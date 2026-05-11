'use client';

import { useCallback, useRef, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/client';

export type SessionRecordingUi = 'off' | 'recording' | 'stopped' | 'uploading' | 'uploaded' | 'error';

type Options = {
  attemptId: string | null;
};

type RecordingLifecycleStatus = 'started' | 'capture_stopped' | 'uploaded' | 'upload_failed';

/**
 * Captures the browser tab/window/screen during a skill test via getDisplayMedia + MediaRecorder.
 * Upload runs in the background after submit (server-side storage).
 */
export function useSessionScreenRecording({ attemptId }: Options) {
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  /** Latest completed recording (including if the user stopped sharing before submit). */
  const stoppedBlobRef = useRef<Blob | null>(null);
  const stopResolverRef = useRef<(() => void) | null>(null);
  const startedAtRef = useRef<string | null>(null);
  const captureStoppedAtRef = useRef<string | null>(null);

  const postLifecycleEvent = useCallback(
    (status: RecordingLifecycleStatus, extra?: Record<string, unknown>) => {
      if (!attemptId) return;
      void fetch('/api/skill-test/recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          status,
          startedAt: startedAtRef.current,
          captureStoppedAt: captureStoppedAtRef.current,
          ...extra,
        }),
      }).catch(() => {
        /* best effort only; do not block the exam */
      });
    },
    [attemptId],
  );

  const [ui, setUi] = useState<SessionRecordingUi>('off');
  const [message, setMessage] = useState<string | null>(null);

  const dispose = useCallback(() => {
    stopResolverRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const rec = recorderRef.current;
    if (rec && rec.state !== 'inactive') {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    }
    recorderRef.current = null;
    chunksRef.current = [];
    stoppedBlobRef.current = null;
    startedAtRef.current = null;
    captureStoppedAtRef.current = null;
    setUi('off');
    setMessage(null);
  }, []);

  const startRecording = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      setMessage('Screen recording is not supported in this browser.');
      setUi('error');
      return false;
    }
    dispose();
    setMessage(null);
    setUi('off');
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;

      const mimeCandidates = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
      const mimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? '';

      const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];

      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'video/webm' });
        chunksRef.current = [];
        if (blob.size > 0) stoppedBlobRef.current = blob;
        captureStoppedAtRef.current = new Date().toISOString();
        postLifecycleEvent('capture_stopped', { capturedBytes: blob.size, mimeType: rec.mimeType || 'video/webm' });
        recorderRef.current = null;
        streamRef.current = null;
        setUi((prev) => (prev === 'recording' ? 'stopped' : prev));
        const done = stopResolverRef.current;
        if (done) {
          stopResolverRef.current = null;
          done();
        }
      };

      const videoTrack = stream.getVideoTracks()[0];
      videoTrack?.addEventListener('ended', () => {
        if (recorderRef.current?.state === 'recording') {
          try {
            recorderRef.current.stop();
          } catch {
            /* ignore */
          }
        }
        stream.getTracks().forEach((t) => t.stop());
      });

      recorderRef.current = rec;
      startedAtRef.current = new Date().toISOString();
      captureStoppedAtRef.current = null;
      rec.start(1000);
      setUi('recording');
      setMessage('Session recording is active. Upload runs automatically after you submit.');
      postLifecycleEvent('started');
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not start capture';
      setMessage(msg === 'Permission denied' ? 'Screen capture was cancelled or denied.' : msg);
      setUi('error');
      return false;
    }
  }, [dispose]);

  const finalizeRecording = useCallback(async (): Promise<Blob | null> => {
    const rec = recorderRef.current;
    const stream = streamRef.current;
    if (rec && rec.state === 'recording') {
      await new Promise<void>((resolve) => {
        stopResolverRef.current = resolve;
        try {
          rec.stop();
        } catch {
          stopResolverRef.current = null;
          resolve();
        }
        stream?.getTracks().forEach((t) => t.stop());
      });
    } else {
      stream?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    const blob = stoppedBlobRef.current;
    stoppedBlobRef.current = null;
    return blob && blob.size > 0 ? blob : null;
  }, []);

  const uploadRecordingInBackground = useCallback(
    (blob: Blob) => {
      if (!attemptId || blob.size < 32) return;
      setUi('uploading');
      setMessage('Saving session recording in the background…');
      void (async () => {
        try {
          const sb = getSupabaseBrowser();
          const {
            data: { user },
          } = await sb.auth.getUser();
          if (!user) {
            setUi('error');
            setMessage('Sign-in required to store recording.');
            return;
          }
          const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
          const path = `${user.id}/${attemptId}.${ext}`;
          const { error } = await sb.storage.from('skill-test-recordings').upload(path, blob, {
            contentType: blob.type || 'video/webm',
            upsert: true,
          });
          if (error) {
            postLifecycleEvent('upload_failed', {
              storagePath: path,
              mimeType: blob.type || 'video/webm',
              bytes: blob.size,
              uploadError: error.message,
            });
            setUi('error');
            setMessage(
              error.message.includes('Bucket not found') || error.message.includes('not found')
                ? 'Session recording could not be saved (storage is not configured). Contact support if this persists.'
                : 'Session recording could not be saved. Try again later or contact support.',
            );
            return;
          }
          postLifecycleEvent('uploaded', {
            storagePath: path,
            mimeType: blob.type || 'video/webm',
            bytes: blob.size,
          });
          setUi('uploaded');
          setMessage('Session recording saved.');
        } catch (err) {
          postLifecycleEvent('upload_failed', {
            mimeType: blob.type || 'video/webm',
            bytes: blob.size,
            uploadError: err instanceof Error ? err.message : 'Recording upload failed',
          });
          setUi('error');
          setMessage(err instanceof Error ? err.message : 'Recording upload failed.');
        }
      })();
    },
    [attemptId, postLifecycleEvent],
  );

  return {
    ui,
    message,
    isRecording: ui === 'recording',
    startRecording,
    finalizeRecording,
    uploadRecordingInBackground,
    dispose,
  };
}
