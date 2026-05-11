import React from 'react';

export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="loader-swirl" aria-label="Loading" />
    </div>
  );
}
