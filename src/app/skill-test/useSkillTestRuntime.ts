'use client';

import React, { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { useSessionScreenRecording } from '@/app/skill-test/useSessionScreenRecording';
import { useSkillTestPayment } from '@/app/skill-test/hooks/useSkillTestPayment';
import { SUBTOPIC_HINTS } from '@/app/skill-test/subtopicHints';
import {
  DIFFICULTY_OPTIONS,
  INTRO_RULE_CHECKLIST,
  LANGUAGE_OPTIONS,
  SESSION_DURATION_MINUTES,
  SESSION_DURATION_MS,
  SETUP_STEPS,
  formatCountdown,
  formatSessionDuration,
  parseSubtopicProgramOptions,
} from '@/app/skill-test/constants';
import type {
  ActiveTestPart,
  Difficulty,
  InterviewTurn,
  MCQQuestion,
  OpenQuestion,
  Phase,
  PracticalQuestion,
  SetupPhase,
  SetupStep,
} from '@/app/skill-test/types';
import type { User } from '@supabase/supabase-js';
import { FIELD_OPTIONS } from '@/app/skill-test/fieldOptions';
import { SkillFieldIcon } from '@/app/skill-test/SkillFieldIcon';
import { useExamGuards } from '@/app/skill-test/examGuards';
export function useSkillTestRuntime() {
export default function SkillTestClient() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const payment = useSkillTestPayment(user?.id);
  const {
    stripePaymentRequired,
    examFeeLabel,
    paymentCreditId,
    paymentBusy,
    paymentStatusLoading,
    hasExamPaymentCredit,
    refreshPaymentCredit,
    beginCheckout,
    consumeCreditOnStart,
    handlePaymentRequiredError,
  } = payment;
  const [setupPhase, setSetupPhase] = useState<SetupPhase>('intro');
  const [setupStep, setSetupStep] = useState<SetupStep>(1);
  const [introRulesAck, setIntroRulesAck] = useState<Record<string, boolean>>({});
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [presetLanguages, setPresetLanguages] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [phase, setPhase] = useState<Phase>('idle');
  const [err, setErr] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([]);
  const [openQuestions, setOpenQuestions] = useState<OpenQuestion[]>([]);
  const [correctingQuestions, setCorrectingQuestions] = useState<OpenQuestion[]>([]);
  const [practicalQuestions, setPracticalQuestions] = useState<PracticalQuestion[]>([]);
  const [aiInterviewQuestions, setAiInterviewQuestions] = useState<OpenQuestion[]>([]);
  const [mcAnswers, setMcAnswers] = useState<Record<string, number>>({});
  const [openAnswers, setOpenAnswers] = useState<Record<string, string>>({});
  const [correctingAnswers, setCorrectingAnswers] = useState<Record<string, string>>({});
  const [practicalAnswers, setPracticalAnswers] = useState<Record<string, string>>({});
  const [aiInterviewAnswers, setAiInterviewAnswers] = useState<Record<string, string>>({});
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewIndex, setInterviewIndex] = useState(0);
  const [interviewDraft, setInterviewDraft] = useState('');
  const [interviewTurns, setInterviewTurns] = useState<InterviewTurn[]>([]);
  const [speechListening, setSpeechListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [faceMissingCount, setFaceMissingCount] = useState(0);
  const [proctorStartedAt, setProctorStartedAt] = useState<string | null>(null);
  const [interviewNotice, setInterviewNotice] = useState<string | null>(null);
  /** Examiner is reading the question aloud (browser TTS). */
  const [interviewerSpeaking, setInterviewerSpeaking] = useState(false);
  /** After the question is read, automatically open the mic for your spoken answer. */
  const [autoAskAnswer, setAutoAskAnswer] = useState(true);
  const recognitionRef = useRef<unknown>(null);
  const interviewVideoRef = useRef<HTMLVideoElement | null>(null);
  const interviewStreamRef = useRef<MediaStream | null>(null);
  /** Synced with mic tracks when acquiring media so auto-listen does not run before state updates. */
  const interviewMicReadyRef = useRef(false);
  const faceScanTimerRef = useRef<number | null>(null);
  const [activeTestPart, setActiveTestPart] = useState<ActiveTestPart>(1);
  const [maxUnlockedPart, setMaxUnlockedPart] = useState<ActiveTestPart>(1);
  /** Part 1 MCQ: show one question at a time; advance after each answer. */
  const [mcqStepIndex, setMcqStepIndex] = useState(0);
  /** Part 2 written: one prompt at a time. */
  const [openStepIndex, setOpenStepIndex] = useState(0);
  /** Part 3 correcting: one item at a time. */
  const [correctingStepIndex, setCorrectingStepIndex] = useState(0);
  /** Part 4 practical: one challenge at a time. */
  const [practicalStepIndex, setPracticalStepIndex] = useState(0);
  const prevActivePartRef = React.useRef<ActiveTestPart>(activeTestPart);
  const sessionTimerIntervalRef = useRef<number | null>(null);
  const sessionDeadlineRef = useRef<number | null>(null);
  const sessionTimerAttemptRef = useRef<string | null>(null);
  const sessionAutoSubmitFiredRef = useRef<string | null>(null);
  const submitRef = useRef<() => Promise<void>>(async () => {});
  const submitBusyRef = useRef(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    feedback: string;
    eligibleNft: boolean;
  } | null>(null);
  const [claimStatus, setClaimStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [claimedCredentialId, setClaimedCredentialId] = useState<string | null>(null);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [sessionMark] = useState(() =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().slice(0, 8) : String(Date.now()),
  );

  const sessionRecording = useSessionScreenRecording({ attemptId });

  const allIntroRulesAcknowledged = React.useMemo(
    () => INTRO_RULE_CHECKLIST.every((r) => Boolean(introRulesAck[r.id])),
    [introRulesAck],
  );

  const totalTestParts: 5 = 5;
  const selectedFieldConfig = FIELD_OPTIONS.find((f) => f.id === selectedField);
  const currentSubtopicHints = selectedField ? SUBTOPIC_HINTS[selectedField] : undefined;
  const selectedSubtopic = selectedTopics[0] ?? null;
  const selectedSubtopicHint = selectedSubtopic ? currentSubtopicHints?.[selectedSubtopic] : undefined;
  const subtopicProgramOptions = React.useMemo(
    () => parseSubtopicProgramOptions(selectedSubtopicHint),
    [selectedSubtopicHint],
  );
  const languageChoices = React.useMemo(() => {
    const base = subtopicProgramOptions.length > 0 ? subtopicProgramOptions : [...LANGUAGE_OPTIONS];
    if (presetLanguages.length === 0) return base;
    return Array.from(new Set([...presetLanguages, ...base]));
  }, [subtopicProgramOptions, presetLanguages]);

  const part1Complete = React.useMemo(
    () => mcqQuestions.length > 0 && mcqQuestions.every((q) => mcAnswers[q.id] !== undefined),
    [mcqQuestions, mcAnswers],
  );

  const part2Complete = React.useMemo(
    () =>
      openQuestions.length > 0 &&
      openQuestions.every((q) => (openAnswers[q.id] ?? '').trim().length > 0),
    [openQuestions, openAnswers],
  );

  const part3Complete = React.useMemo(
    () =>
      correctingQuestions.length > 0 &&
      correctingQuestions.every((q) => (correctingAnswers[q.id] ?? '').trim().length > 0),
    [correctingQuestions, correctingAnswers],
  );

  const part4Complete = React.useMemo(
    () =>
      practicalQuestions.length > 0 &&
      practicalQuestions.every((q) => (practicalAnswers[q.id] ?? '').trim().length > 0),
    [practicalQuestions, practicalAnswers],
  );

  const interviewQuestions = React.useMemo(() => {
    const base = aiInterviewQuestions.slice(0, 5);
    if (base.length >= 5) return base;
    const fallback = [
      'Walk me through a project decision you made and why.',
      'What trade-off would you make to improve performance quickly?',
      'How would you debug an issue that appears only in production?',
      'How do you ensure your solution is secure and maintainable?',
      'If your first approach fails, what is your backup plan?',
    ];
    const expanded = [...base];
    for (let i = base.length; i < 5; i += 1) {
      expanded.push({ id: `interview-${i + 1}`, text: fallback[i] });
    }
    return expanded;
  }, [aiInterviewQuestions]);

  const part5Complete = React.useMemo(
    () =>
      interviewQuestions.length > 0 &&
      interviewQuestions.every((q) => (aiInterviewAnswers[q.id] ?? '').trim().length > 0),
    [interviewQuestions, aiInterviewAnswers],
  );

  const canSubmitForGrading = React.useMemo(() => {
    const sessionTimeUp = remainingSeconds !== null && remainingSeconds <= 0;
    const allPartsAnswered =
      interviewStarted &&
      part1Complete &&
      part2Complete &&
      part3Complete &&
      part4Complete &&
      part5Complete;
    return sessionTimeUp || allPartsAnswered;
  }, [
    remainingSeconds,
    interviewStarted,
    part1Complete,
    part2Complete,
    part3Complete,
    part4Complete,
    part5Complete,
  ]);

  const { preventExamClipboard, preventExamContextMenu, preventExamDrag } = useExamGuards();

  const refreshUser = useCallback(() => {
    const sb = getSupabaseBrowser();
    void sb.auth
      .getUser()
      .then(({ data }) => {
        setUser(data.user ?? null);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  React.useEffect(() => {
    const dispose = sessionRecording.dispose;
    return () => dispose();
  }, [sessionRecording.dispose]);

  React.useEffect(() => {
    refreshUser();
    const sb = getSupabaseBrowser();
    const { data: sub } = sb.auth.onAuthStateChange(
      (
        _event: unknown,
        _session: unknown,
      ) => {
        void refreshUser();
      },
    );
    return () => sub.subscription.unsubscribe();
  }, [refreshUser]);

  /** Deep link from dashboard cards: /skill-test?field=web-development */
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('examroom') === '1' || params.get('autostart') === '1') return;
    const raw = params.get('field');
    if (!raw) return;
    const ok = FIELD_OPTIONS.some((f) => f.id === raw);
    if (!ok) return;
    setSelectedField(raw);
    setSetupPhase('wizard');
    setSetupStep(2);
  }, []);

  /** Best-effort: block common copy/paste/screenshot/print shortcuts only while the live exam is active (cannot stop OS tools or a physical camera). */
  React.useEffect(() => {
    if (phase !== 'test') return;
    const blockShortcuts = (ev: KeyboardEvent) => {
      const inTextArea = ev.target instanceof HTMLTextAreaElement;
      const keyLower = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;

      if (ev.key === 'PrintScreen') {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        return;
      }

      // macOS / Chromebook screenshot shortcuts (may be consumed by the OS before the page sees them)
      if (ev.shiftKey && (ev.metaKey || ev.ctrlKey)) {
        if (['3', '4', '5', 's'].includes(keyLower)) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          return;
        }
      }

      const mod = ev.ctrlKey || ev.metaKey;
      if (mod && ['c', 'v', 'x'].includes(keyLower)) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        return;
      }
      // Select-all only outside answer textareas (still allows selecting your answer to edit locally without copy)
      if (mod && keyLower === 'a' && !inTextArea) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        return;
      }
      // Print / Save page — reduces PDF/save exfil attempts from the browser
      if (mod && !ev.shiftKey && (keyLower === 'p' || keyLower === 's')) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
      }
    };
    window.addEventListener('keydown', blockShortcuts, true);
    return () => window.removeEventListener('keydown', blockShortcuts, true);
  }, [phase]);

  React.useEffect(() => {
    const w = window as unknown as {
      webkitSpeechRecognition?: new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
      SpeechRecognition?: new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
    };
    setSpeechSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  React.useEffect(() => {
    if (!interviewStarted || activeTestPart !== 5) return;
    const onVisibility = () => {
      if (document.hidden) setTabSwitchCount((c) => c + 1);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [interviewStarted, activeTestPart]);

  const stopInterviewMedia = useCallback(() => {
    if (faceScanTimerRef.current) {
      window.clearInterval(faceScanTimerRef.current);
      faceScanTimerRef.current = null;
    }
    const stream = interviewStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      interviewStreamRef.current = null;
    }
    if (interviewVideoRef.current) {
      interviewVideoRef.current.srcObject = null;
    }
    setCameraReady(false);
    setMicReady(false);
    interviewMicReadyRef.current = false;
  }, []);

  React.useEffect(() => {
    return () => stopInterviewMedia();
  }, [stopInterviewMedia]);

  const [interviewMediaPending, setInterviewMediaPending] = useState(false);

  const acquireInterviewMedia = useCallback(async () => {
    setInterviewMediaPending(true);
    interviewMicReadyRef.current = false;
    try {
      stopInterviewMedia();

      const win = window as unknown as {
        FaceDetector?: new () => { detect: (source: HTMLVideoElement) => Promise<unknown[]> };
      };

      const startFaceScanIfNeeded = (hasVideo: boolean) => {
        if (!hasVideo || !win.FaceDetector) return;
        const detector = new win.FaceDetector();
        faceScanTimerRef.current = window.setInterval(() => {
          const videoEl = interviewVideoRef.current;
          if (!videoEl || videoEl.readyState < 2) return;
          void detector
            .detect(videoEl)
            .then((faces) => {
              if (!faces || faces.length === 0) setFaceMissingCount((c) => c + 1);
            })
            .catch(() => undefined);
        }, 5000);
      };

      const applyStream = (stream: MediaStream) => {
        interviewStreamRef.current = stream;
        const hasVideo = stream.getVideoTracks().length > 0;
        const hasAudio = stream.getAudioTracks().length > 0;
        interviewMicReadyRef.current = hasAudio;
        setCameraReady(hasVideo);
        setMicReady(hasAudio);
        if (interviewVideoRef.current) {
          interviewVideoRef.current.srcObject = stream;
          void interviewVideoRef.current.play().catch(() => undefined);
        }
        startFaceScanIfNeeded(hasVideo);
      };

      /** Prefer microphone alone first so users are not forced through a camera+m mic prompt. */
      const tryMicThenCamera = async (): Promise<boolean> => {
        let audioStream: MediaStream;
        try {
          audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } catch {
          return false;
        }
        const combined = new MediaStream();
        audioStream.getAudioTracks().forEach((t) => combined.addTrack(t));
        try {
          const videoOnly = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
          videoOnly.getVideoTracks().forEach((t) => combined.addTrack(t));
          applyStream(combined);
          setInterviewNotice(null);
        } catch {
          applyStream(combined);
          setInterviewNotice(
            'Microphone is on. Camera preview is optional — if you allow it later, use Retry for video.',
          );
        }
        return true;
      };

      if (await tryMicThenCamera()) {
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        applyStream(stream);
        setInterviewNotice(null);
        return;
      } catch {
        /* fall through */
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        applyStream(stream);
        setInterviewNotice(
          'Camera was blocked or unavailable — using microphone only. You can still use spoken answers.',
        );
        return;
      } catch {
        /* fall through */
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
        applyStream(stream);
        setInterviewNotice(
          'Microphone was blocked or unavailable — only the camera preview is active. Allow the microphone and use Retry to answer by voice.',
        );
        return;
      } catch {
        /* complete failure */
      }

      setCameraReady(false);
      setMicReady(false);
      interviewMicReadyRef.current = false;
      setInterviewNotice(
        'Microphone access is needed to speak your answers. Click “Allow microphone” or “Retry”, then choose Allow in the browser prompt. You can also type your answer below if your mic cannot be enabled.',
      );
    } finally {
      setInterviewMediaPending(false);
    }
  }, [stopInterviewMedia]);

  const retryInterviewMedia = useCallback(() => {
    void acquireInterviewMedia();
  }, [acquireInterviewMedia]);

  const beginVoiceCapture = useCallback(() => {
    const w = window as unknown as {
      webkitSpeechRecognition?: new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
      SpeechRecognition?: new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      setInterviewNotice('Speech recognition is not supported in this browser.');
      return;
    }
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i][0]?.transcript ?? '';
      }
      setInterviewDraft(transcript.trim());
    };
    const recWithError = rec as typeof rec & { onerror: ((event: Event) => void) | null };
    recWithError.onerror = (event: Event) => {
      const err = (event as unknown as { error?: string }).error;
      setSpeechListening(false);
      if (err === 'not-allowed' || err === 'service-not-allowed') {
        setInterviewNotice(
          'The browser blocked speech recognition from using the microphone. Allow microphone access for this site (address bar lock icon), then try again.',
        );
      } else if (err === 'audio-capture') {
        setInterviewNotice('No microphone was found or capture failed. Check your device settings.');
      } else if (err && err !== 'aborted' && err !== 'no-speech') {
        setInterviewNotice(`Voice capture failed (${err}). Try again or use Retry camera & microphone.`);
      }
    };
    rec.onend = () => setSpeechListening(false);
    recognitionRef.current = rec;
    setSpeechListening(true);
    try {
      rec.start();
    } catch {
      setInterviewNotice('Could not start voice capture. Check microphone permission and try again.');
      setSpeechListening(false);
    }
  }, []);

  const stopVoiceCapture = useCallback(() => {
    const rec = recognitionRef.current as
      | {
          stop: () => void;
        }
      | null;
    if (rec) rec.stop();
    setSpeechListening(false);
  }, []);

  const speakInterviewQuestion = useCallback((text: string, opts?: { onComplete?: () => void }) => {
    stopVoiceCapture();
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      opts?.onComplete?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setInterviewerSpeaking(true);
    utterance.onend = () => {
      setInterviewerSpeaking(false);
      opts?.onComplete?.();
    };
    utterance.onerror = () => {
      setInterviewerSpeaking(false);
      opts?.onComplete?.();
    };
    window.speechSynthesis.speak(utterance);
  }, [stopVoiceCapture]);

  const maybeAutoListenAfterQuestion = useCallback(() => {
    if (autoAskAnswer && speechSupported && interviewMicReadyRef.current) beginVoiceCapture();
  }, [autoAskAnswer, speechSupported, beginVoiceCapture]);

  const startInterviewSession = useCallback(async () => {
    setInterviewNotice(null);
    setProctorStartedAt(new Date().toISOString());
    setInterviewStarted(true);
    setInterviewIndex(0);
    setInterviewDraft('');
    setInterviewerSpeaking(false);

    await acquireInterviewMedia();

    const first = interviewQuestions[0]?.text;
    if (first) {
      speakInterviewQuestion(first, {
        onComplete: () => maybeAutoListenAfterQuestion(),
      });
    }
  }, [interviewQuestions, speakInterviewQuestion, maybeAutoListenAfterQuestion, acquireInterviewMedia]);

  const proctoringReport = React.useMemo(() => {
    const durationMin = proctorStartedAt
      ? Math.max(0, Math.round((Date.now() - new Date(proctorStartedAt).getTime()) / 60000))
      : 0;
    const risk = tabSwitchCount > 1 || faceMissingCount > 2 ? 'elevated' : 'normal';
    return `Interview proctoring summary: mic=${micReady ? 'on' : 'off'}, camera=${cameraReady ? 'on' : 'off'}, tab_switches=${tabSwitchCount}, face_missing_events=${faceMissingCount}, duration_min=${durationMin}, risk=${risk}.`;
  }, [cameraReady, micReady, tabSwitchCount, faceMissingCount, proctorStartedAt]);

  React.useEffect(() => {
    if (!selectedField) {
      setSelectedTopics([]);
      return;
    }
    const allowedTopics = new Set<string>(
      FIELD_OPTIONS.find((field) => field.id === selectedField)?.topics ?? [],
    );
    setSelectedTopics((prev) => prev.filter((topic) => allowedTopics.has(topic)));
  }, [selectedField]);

  React.useEffect(() => {
    setSelectedLanguages((prev) => prev.filter((language) => languageChoices.includes(language)));
  }, [languageChoices]);

  React.useEffect(() => {
    if (mcqQuestions.length === 0) return;
    setMcqStepIndex((i) => Math.min(Math.max(i, 0), mcqQuestions.length - 1));
  }, [mcqQuestions.length]);

  React.useEffect(() => {
    if (openQuestions.length === 0) return;
    setOpenStepIndex((i) => Math.min(Math.max(i, 0), openQuestions.length - 1));
  }, [openQuestions.length]);

  React.useEffect(() => {
    if (correctingQuestions.length === 0) return;
    setCorrectingStepIndex((i) => Math.min(Math.max(i, 0), correctingQuestions.length - 1));
  }, [correctingQuestions.length]);

  React.useEffect(() => {
    if (practicalQuestions.length === 0) return;
    setPracticalStepIndex((i) => Math.min(Math.max(i, 0), practicalQuestions.length - 1));
  }, [practicalQuestions.length]);

  React.useEffect(() => {
    const prev = prevActivePartRef.current;
    prevActivePartRef.current = activeTestPart;
    if (activeTestPart === 1 && mcqQuestions.length > 0 && prev !== 1) {
      const firstIncomplete = mcqQuestions.findIndex((qu) => mcAnswers[qu.id] === undefined);
      setMcqStepIndex(firstIncomplete === -1 ? mcqQuestions.length - 1 : firstIncomplete);
    }
    if (activeTestPart === 2 && openQuestions.length > 0 && prev !== 2) {
      const firstIncomplete = openQuestions.findIndex((qu) => (openAnswers[qu.id] ?? '').trim().length === 0);
      setOpenStepIndex(firstIncomplete === -1 ? openQuestions.length - 1 : firstIncomplete);
    }
    if (activeTestPart === 3 && correctingQuestions.length > 0 && prev !== 3) {
      const firstIncomplete = correctingQuestions.findIndex((qu) => (correctingAnswers[qu.id] ?? '').trim().length === 0);
      setCorrectingStepIndex(firstIncomplete === -1 ? correctingQuestions.length - 1 : firstIncomplete);
    }
    if (activeTestPart === 4 && practicalQuestions.length > 0 && prev !== 4) {
      const firstIncomplete = practicalQuestions.findIndex((qu) => (practicalAnswers[qu.id] ?? '').trim().length === 0);
      setPracticalStepIndex(firstIncomplete === -1 ? practicalQuestions.length - 1 : firstIncomplete);
    }
    // practicalAnswers / correctingAnswers / openAnswers / mcAnswers read when switching parts only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTestPart, mcqQuestions, openQuestions, correctingQuestions, practicalQuestions]);

  React.useEffect(() => {
    if (setupStep !== 5) return;
    void refreshPaymentCredit();
  }, [setupStep, refreshPaymentCredit]);

  const start = async (
    overrides?: {
      fieldId?: string;
      topics?: string[];
      languages?: string[];
    },
    opts?: { preserveActiveRecording?: boolean },
  ) => {
    const activeField = overrides?.fieldId ?? selectedField;
    const activeTopics = overrides?.topics ?? selectedTopics;
    const activeLanguages = overrides?.languages ?? selectedLanguages;
    if (!activeField) {
      setErr('Please choose a field.');
      return;
    }
    if (activeTopics.length === 0) {
      setErr('Please choose a subtopic.');
      return;
    }
    if (activeLanguages.length === 0) {
      setErr('Please choose at least one language.');
      return;
    }
    if (stripePaymentRequired && !hasExamPaymentCredit) {
      setErr(`Pay the exam fee (${examFeeLabel}) before entering the exam room.`);
      return;
    }
    if (!opts?.preserveActiveRecording) {
      sessionRecording.dispose();
    }
    setErr(null);
    setResult(null);
    setPhase('loading');
    const fieldLabel = FIELD_OPTIONS.find((field) => field.id === activeField)?.label ?? activeField;
    const topic = `${fieldLabel} | Languages: ${activeLanguages.join(', ')} | Subtopics: ${activeTopics.join(', ')}`;
    const contentFocus = `Field=${fieldLabel}, Languages=${activeLanguages.join(', ')}, Subtopics=${activeTopics.join(', ')}`;
    const res = await fetch('/api/skill-test/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        difficulty,
        contentFocus,
        paymentId:
          stripePaymentRequired && paymentCreditId && paymentCreditId !== 'free'
            ? paymentCreditId
            : undefined,
      }),
    });
    const j = (await res.json().catch(() => ({}))) as
      | {
          error?: string;
          attemptId?: string;
          mcq?: MCQQuestion[];
          openEnded?: OpenQuestion[];
          correctingMistakes?: OpenQuestion[];
          practical?: PracticalQuestion[] | PracticalQuestion;
          aiInterview?: OpenQuestion[];
        }
      | Record<string, unknown>;
    if (!res.ok) {
      setPhase('idle');
      const code = (j as { code?: string }).code;
      if (res.status === 402 || code === 'PAYMENT_REQUIRED') {
        handlePaymentRequiredError();
      }
      setErr(typeof j.error === 'string' ? j.error : 'Failed to start test');
      sessionRecording.dispose();
      return;
    }
    consumeCreditOnStart();
    setAttemptId((j as { attemptId: string }).attemptId);
    setMcqQuestions((j as { mcq: MCQQuestion[] }).mcq ?? []);
    setOpenQuestions((j as { openEnded: OpenQuestion[] }).openEnded ?? []);
    setCorrectingQuestions((j as { correctingMistakes?: OpenQuestion[] }).correctingMistakes ?? []);
    const practicalFromApi = (j as { practical?: PracticalQuestion[] | PracticalQuestion }).practical;
    setPracticalQuestions(Array.isArray(practicalFromApi) ? practicalFromApi : practicalFromApi ? [practicalFromApi] : []);
    setAiInterviewQuestions((j as { aiInterview?: OpenQuestion[] }).aiInterview ?? []);
    setMcAnswers({});
    setMcqStepIndex(0);
    setOpenStepIndex(0);
    setCorrectingStepIndex(0);
    setPracticalStepIndex(0);
    setOpenAnswers({});
    setCorrectingAnswers({});
    setPracticalAnswers({});
    setAiInterviewAnswers({});
    setInterviewStarted(false);
    setInterviewIndex(0);
    setInterviewDraft('');
    setInterviewTurns([]);
    setTabSwitchCount(0);
    setFaceMissingCount(0);
    setProctorStartedAt(null);
    setInterviewerSpeaking(false);
    stopVoiceCapture();
    stopInterviewMedia();
    setActiveTestPart(1);
    setMaxUnlockedPart(1);
    setPhase('test');
  };

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (phase !== 'idle') return;

    const params = new URLSearchParams(window.location.search);
    const wantsAutostart = params.get('autostart') === '1';
    const wantsExamRoom = params.get('examroom') === '1';
    if (!wantsAutostart && !wantsExamRoom) return;

    const fieldId = params.get('field');
    if (!fieldId) return;

    const fieldConfig = FIELD_OPTIONS.find((field) => field.id === fieldId);
    if (!fieldConfig) return;

    const langsRaw = params.get('langs');
    const deepLinkedLanguages = langsRaw
      ? langsRaw
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
    if (deepLinkedLanguages.length > 0) {
      setPresetLanguages(deepLinkedLanguages);
    }

    const defaultTopic = fieldConfig.topics[0];
    const defaultLanguage = LANGUAGE_OPTIONS[0];
    if (!defaultTopic || !defaultLanguage) return;

    const topics = selectedTopics.length > 0 ? selectedTopics : [defaultTopic];
    const languages = selectedLanguages.length > 0
      ? selectedLanguages
      : deepLinkedLanguages.length > 0
        ? deepLinkedLanguages
        : [defaultLanguage];

    if (selectedField !== fieldId || selectedTopics.length === 0 || selectedLanguages.length === 0) {
      setSelectedField(fieldId);
      setSelectedTopics(topics);
      setSelectedLanguages(languages);
      setSetupPhase('wizard');
      setSetupStep(wantsExamRoom ? 5 : 4);
      return;
    }

    if (wantsExamRoom) {
      setSetupPhase('wizard');
      setSetupStep(5);
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete('examroom');
      window.history.replaceState({}, '', nextUrl.toString());
      return;
    }

    void start({ fieldId, topics, languages });
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete('autostart');
    window.history.replaceState({}, '', nextUrl.toString());
  }, [phase, selectedField, selectedTopics, selectedLanguages]);

  const submit = async () => {
    if (!attemptId || submitBusyRef.current) return;
    submitBusyRef.current = true;
    setErr(null);
    try {
      let recordingBlob: Blob | null = null;
      try {
        recordingBlob = await sessionRecording.finalizeRecording();
      } catch {
        recordingBlob = null;
      }
      setPhase('saving');
      if (recordingBlob) {
        sessionRecording.uploadRecordingInBackground(recordingBlob);
      }
      const res = await fetch('/api/skill-test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          mcAnswers,
          openAnswers,
          correctingAnswers,
          practicalAnswers,
          aiInterviewAnswers,
          proctoringReport,
        }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        error?: string;
        score?: number;
        passed?: boolean;
        feedback?: string;
        eligibleNft?: boolean;
      };
      if (!res.ok) {
        setPhase('test');
        setErr(j.error || 'Submit failed');
        submitBusyRef.current = false;
        return;
      }
      setResult({
        score: j.score ?? 0,
        passed: Boolean(j.passed),
        feedback: j.feedback ?? '',
        eligibleNft: Boolean(j.eligibleNft),
      });
      setPhase('done');
    } catch {
      setPhase('test');
      setErr('Submit failed');
      submitBusyRef.current = false;
    }
  };

  submitRef.current = submit;

  React.useEffect(() => {
    if (phase !== 'test' || !attemptId) {
      if (sessionTimerIntervalRef.current !== null) {
        window.clearInterval(sessionTimerIntervalRef.current);
        sessionTimerIntervalRef.current = null;
      }
      if (phase !== 'test') {
        setRemainingSeconds(null);
      }
      return;
    }

    if (sessionTimerAttemptRef.current !== attemptId) {
      sessionDeadlineRef.current = Date.now() + SESSION_DURATION_MS;
      sessionTimerAttemptRef.current = attemptId;
      sessionAutoSubmitFiredRef.current = null;
    }

    const deadline = sessionDeadlineRef.current ?? Date.now() + SESSION_DURATION_MS;

    const tick = () => {
      const sec = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemainingSeconds(sec);
      if (sec <= 0) {
        if (sessionTimerIntervalRef.current !== null) {
          window.clearInterval(sessionTimerIntervalRef.current);
          sessionTimerIntervalRef.current = null;
        }
        if (sessionAutoSubmitFiredRef.current !== attemptId) {
          sessionAutoSubmitFiredRef.current = attemptId;
          void submitRef.current();
        }
      }
    };

    tick();
    sessionTimerIntervalRef.current = window.setInterval(tick, 1000);
    return () => {
      if (sessionTimerIntervalRef.current !== null) {
        window.clearInterval(sessionTimerIntervalRef.current);
        sessionTimerIntervalRef.current = null;
      }
    };
  }, [phase, attemptId]);

  const claimCredential = async () => {
    if (!attemptId) {
      setClaimStatus('error');
      setClaimMessage('Missing attempt id. Please retake the test and try again.');
      return;
    }
    setClaimStatus('loading');
    setClaimMessage(null);
    const res = await fetch('/api/skill-test/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptId }),
    });
    const j = (await res.json().catch(() => ({}))) as {
      error?: string;
      alreadyClaimed?: boolean;
      credentialId?: string;
      claimedAt?: string;
    };
    if (!res.ok) {
      setClaimStatus('error');
      setClaimMessage(j.error ?? 'Failed to claim credential.');
      return;
    }
    setClaimStatus('done');
    setAlreadyClaimed(Boolean(j.alreadyClaimed));
    setClaimedCredentialId(j.credentialId ?? null);
    setClaimMessage(
      j.alreadyClaimed
        ? `Certificate already claimed.${j.credentialId ? ` ID: ${j.credentialId}` : ''}`
        : `Certificate claimed successfully.${j.credentialId ? ` ID: ${j.credentialId}` : ''}`,
    );
  };

  const goToDashboard = () => {
    router.push('/dashboard');
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        if (window.location.pathname !== '/dashboard') {
          window.location.assign('/dashboard');
        }
      }, 250);
    }
  };
  return {
    router,
    user,
    setUser,
    authLoading,
    setAuthLoading,
    payment,
    setupPhase,
    setSetupPhase,
    setupStep,
    setSetupStep,
    introRulesAck,
    setIntroRulesAck,
    selectedField,
    setSelectedField,
    selectedLanguages,
    setSelectedLanguages,
    presetLanguages,
    setPresetLanguages,
    selectedTopics,
    setSelectedTopics,
    difficulty,
    setDifficulty,
    phase,
    setPhase,
    err,
    setErr,
    attemptId,
    setAttemptId,
    mcqQuestions,
    setMcqQuestions,
    openQuestions,
    setOpenQuestions,
    correctingQuestions,
    setCorrectingQuestions,
    practicalQuestions,
    setPracticalQuestions,
    aiInterviewQuestions,
    setAiInterviewQuestions,
    mcAnswers,
    setMcAnswers,
    openAnswers,
    setOpenAnswers,
    correctingAnswers,
    setCorrectingAnswers,
    practicalAnswers,
    setPracticalAnswers,
    aiInterviewAnswers,
    setAiInterviewAnswers,
    interviewStarted,
    setInterviewStarted,
    interviewIndex,
    setInterviewIndex,
    interviewDraft,
    setInterviewDraft,
    interviewTurns,
    setInterviewTurns,
    speechListening,
    setSpeechListening,
    speechSupported,
    setSpeechSupported,
    cameraReady,
    setCameraReady,
    micReady,
    setMicReady,
    tabSwitchCount,
    setTabSwitchCount,
    faceMissingCount,
    setFaceMissingCount,
    proctorStartedAt,
    setProctorStartedAt,
    interviewNotice,
    setInterviewNotice,
    interviewerSpeaking,
    setInterviewerSpeaking,
    autoAskAnswer,
    setAutoAskAnswer,
    recognitionRef,
    interviewVideoRef,
    interviewStreamRef,
    interviewMicReadyRef,
    faceScanTimerRef,
    activeTestPart,
    setActiveTestPart,
    maxUnlockedPart,
    setMaxUnlockedPart,
    mcqStepIndex,
    setMcqStepIndex,
    openStepIndex,
    setOpenStepIndex,
    correctingStepIndex,
    setCorrectingStepIndex,
    practicalStepIndex,
    setPracticalStepIndex,
    prevActivePartRef,
    sessionTimerIntervalRef,
    sessionDeadlineRef,
    sessionTimerAttemptRef,
    sessionAutoSubmitFiredRef,
    submitBusyRef,
    remainingSeconds,
    setRemainingSeconds,
    result,
    setResult,
    claimStatus,
    setClaimStatus,
    claimMessage,
    setClaimMessage,
    claimedCredentialId,
    setClaimedCredentialId,
    alreadyClaimed,
    setAlreadyClaimed,
    sessionMark,
    sessionRecording,
    allIntroRulesAcknowledged,
    currentSubtopicHints,
    selectedSubtopic,
    selectedSubtopicHint,
    subtopicProgramOptions,
    part1Complete,
    part2Complete,
    part3Complete,
    part4Complete,
    part5Complete,
    interviewMediaPending,
    setInterviewMediaPending,
    start,
  };
}
