'use client';

import { useEffect, useRef } from 'react';

interface HeroBackgroundVideoProps {
  src: string;
  playbackRate?: number;
  className?: string;
}

export default function HeroBackgroundVideo({
  src,
  playbackRate = 1,
  className = 'absolute inset-0 h-full w-full object-cover',
}: HeroBackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  return (
    <video ref={videoRef} className={className} autoPlay loop muted playsInline>
      <source src={src} type="video/mp4" />
    </video>
  );
}
