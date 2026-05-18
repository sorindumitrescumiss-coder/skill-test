        <div
          className="skill-test-protected relative space-y-6 select-none print:hidden"
          onContextMenu={preventExamContextMenu}
          onCopy={preventExamClipboard}
          onCut={preventExamClipboard}
          onPaste={preventExamClipboard}
          onDragStart={preventExamDrag}
        >
          <div
            className="pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-3xl"
            aria-hidden
          >
            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage: `repeating-linear-gradient(-24deg, transparent, transparent 44px, rgba(92,64,51,0.45) 44px, rgba(92,64,51,0.45) 45px)`,
              }}
            />
            <p className="absolute left-1/2 top-1/2 w-[min(90vw,720px)] -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] text-center text-[11px] font-semibold tracking-wide text-stone-400/65 sm:text-xs">
              TrueAssess · {user.email ?? user.id?.slice(0, 8) ?? 'session'} · {sessionMark}
            </p>
            <p
              className="absolute left-1/2 top-[58%] w-[min(92vw,760px)] -translate-x-1/2 rotate-[14deg] text-center text-[10px] font-medium tracking-[0.2em] text-stone-400/45 sm:text-[11px]"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              CONFIDENTIAL SESSION · {attemptId?.slice(0, 8) ?? sessionMark}
            </p>
          </div>

          <div className="relative z-[2] space-y-6">
          {phase === 'test' && remainingSeconds !== null && (
            <div
              className={`rounded-xl border px-4 py-3 font-sans sm:flex sm:items-center sm:justify-between sm:gap-4 ${
                remainingSeconds <= 300
                  ? 'border-red-400/70 bg-red-50/95 shadow-sm'
                  : 'border-[#1e293b]/35 bg-parchment-150/90'
              }`}
              role="timer"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#4f46e5]">Session time remaining</p>
                <p className="mt-1 text-[11px] leading-snug text-ink-soft sm:text-xs">
                  When time runs out, your answers are submitted automatically for grading. Session limit:{' '}
                  {formatSessionDuration(SESSION_DURATION_MINUTES)}. Finish all parts before then if you can.
                </p>
              </div>
              <p
                className={`mt-2 shrink-0 tabular-nums text-2xl font-bold tracking-tight sm:mt-0 ${
                  remainingSeconds <= 300 ? 'text-red-800' : 'text-ink'
                }`}
              >
                {formatCountdown(remainingSeconds)}
              </p>
            </div>
          )}
          <div className="rounded-xl border border-[#1e293b]/35 bg-parchment-150/90 px-3 py-3 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-4">
            <div className="min-w-0 space-y-1">
              <p className="font-sans text-xs font-semibold uppercase tracking-wide text-[#4f46e5]">Session screen recording</p>
              <p className="font-sans text-[11px] leading-snug text-ink-soft sm:text-xs">
                Capture starts automatically when you enter the exam room (browser will ask you to share this tab or your screen). Upload runs in
                the background after you submit. Stop sharing from the browser when you finish if needed.
              </p>
              {sessionRecording.message && (
                <p
                  className={`font-sans text-[11px] sm:text-xs ${
                    sessionRecording.ui === 'error' ? 'text-red-700' : 'text-ink-muted'
                  }`}
                >
                  {sessionRecording.message}
                </p>
              )}
            </div>
            <div className="mt-2 flex shrink-0 flex-wrap items-center justify-end gap-2 sm:mt-0">
              {sessionRecording.isRecording ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300/80 bg-red-50 px-2.5 py-1 font-sans text-[11px] font-semibold uppercase tracking-wide text-red-800">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-600" aria-hidden />
                  Recording
                </span>
              ) : (
                <span className="font-sans text-[11px] font-medium text-ink-soft sm:text-xs">
                  {sessionRecording.ui === 'uploaded'
                    ? 'Saved'
                    : sessionRecording.ui === 'uploading'
                      ? 'Saving…'
                      : sessionRecording.ui === 'stopped'
                        ? 'Stopped'
                        : sessionRecording.ui === 'error'
                          ? 'No capture'
                          : 'Idle'}
                </span>
              )}
            </div>
          </div>

          <nav
            className="flex flex-nowrap items-center gap-2 border-0 border-b border-[#1e293b]/30 bg-transparent px-0 pb-4 pt-1 sm:gap-3"
            aria-label="Test parts"
          >
            <span className="shrink-0 text-xs font-sans font-semibold uppercase tracking-wide text-[#4f46e5]/85">
              Parts
            </span>
            <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1.5 overflow-x-auto overscroll-x-contain pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 [&::-webkit-scrollbar]:hidden">
              {Array.from({ length: totalTestParts }, (_, i) => i + 1).map((p) => {
                const n = p as ActiveTestPart;
                const unlocked = n <= maxUnlockedPart;
                const active = activeTestPart === n;
                const subtitle =
                  n === 1 ? 'Multiple choice' : n === 2 ? 'Written' : n === 3 ? 'Correcting mistakes' : n === 4 ? 'Practical' : 'AI interview';
                return (
                  <button
                    key={p}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => setActiveTestPart(n)}
                    title={`Part ${p}: ${subtitle}`}
                    className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 ${
                      active
                        ? 'bg-gradient-to-r from-[#1e293b] to-[#a07856] text-white shadow-sm'
                        : unlocked
                          ? 'border border-[#1e293b]/40 bg-transparent text-ink hover:border-[#4f46e5]/60 hover:bg-[#0f172a]/[0.04]'
                          : 'cursor-not-allowed border border-[#1e293b]/20 bg-transparent/30 text-ink-soft'
                    }`}
                  >
                    <span className="sm:hidden">P{p}</span>
                    <span className="hidden sm:inline">
                      Part {p}: {subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={goToDashboard}
              title="Go to Dashboard"
              className="ml-1 shrink-0 inline-flex items-center rounded-md border border-[#1e293b]/35 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft transition hover:border-[#4f46e5]/55 hover:text-ink sm:ml-2 sm:px-3 sm:text-xs"
            >
              Dashboard
            </button>
          </nav>

          {activeTestPart === 1 && (
          <section className="space-y-8 border-0 bg-transparent p-0 pt-2 shadow-none">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-serif text-xl font-semibold italic text-ink md:text-2xl">
                Part 1: Multiple-choice ({mcqQuestions.length || '…'})
              </h3>
              <span className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-sans font-semibold text-stone-800">
                Auto-checkable
              </span>
            </div>
            {mcqQuestions.length > 0 && mcqQuestions[mcqStepIndex] && (
              <>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 font-sans text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <span>
                    Question {mcqStepIndex + 1} of {mcqQuestions.length}
                  </span>
                  {part1Complete && (
                    <span className="rounded-full border border-emerald-300/60 bg-emerald-50 px-2 py-0.5 text-emerald-800">
                      Section complete
                    </span>
                  )}
                </div>
                <div
                  key={mcqQuestions[mcqStepIndex].id}
                  className="animate-slide-up rounded-xl border border-[#1e293b]/35 bg-parchment-200/95 p-4 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.42)] sm:p-5"
                >
                  <p className="font-serif text-lg font-semibold text-ink">Question {mcqStepIndex + 1}</p>
                  <p className="mt-2 select-none font-serif text-base leading-8 text-ink-muted">
                    {mcqQuestions[mcqStepIndex].text}
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    {mcqQuestions[mcqStepIndex].options.map((opt, optIdx) => (
                      <label
                        key={`${mcqQuestions[mcqStepIndex].id}-${optIdx}`}
                        className="flex cursor-pointer items-start gap-2 rounded-sm border border-[#1e293b]/40 bg-parchment-950/[0.05] px-3 py-2.5 font-serif text-sm leading-snug text-ink-muted transition hover:border-[#4f46e5]/60 hover:bg-[#0f172a]/[0.07] sm:text-base sm:leading-snug"
                      >
                        <input
                          type="radio"
                          name={mcqQuestions[mcqStepIndex].id}
                          checked={mcAnswers[mcqQuestions[mcqStepIndex].id] === optIdx}
                          onChange={() => {
                            const q = mcqQuestions[mcqStepIndex];
                            setMcAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                            const idx = mcqStepIndex;
                            if (idx < mcqQuestions.length - 1) {
                              window.setTimeout(() => setMcqStepIndex(idx + 1), 400);
                            }
                          }}
                          className="mt-1 h-4 w-4 shrink-0 border-slate-400 text-stone-700 focus:ring-stone-400"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="mr-2 inline-block font-sans text-xs font-semibold tabular-nums text-stone-500">
                            {optIdx + 1}.
                          </span>
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    disabled={mcqStepIndex === 0}
                    onClick={() => setMcqStepIndex((i) => Math.max(0, i - 1))}
                    className="rounded-md border border-[#1e293b]/45 bg-transparent px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#0f172a]/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Previous question
                  </button>
                </div>
              </>
            )}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#1e293b]/25 pt-6">
              <p className="mr-auto font-sans text-sm text-ink-soft">
                {part1Complete
                  ? 'All multiple-choice questions answered. Continue when ready.'
                  : 'Choose an answer — the next question appears automatically.'}
              </p>
              <button
                type="button"
                disabled={!part1Complete}
                onClick={() => {
                  setMaxUnlockedPart((m) => (2 > m ? 2 : m));
                  setActiveTestPart(2);
                  setErr(null);
                }}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#1e293b] to-[#a07856] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next: Part 2 →
              </button>
            </div>
          </section>
          )}

          {activeTestPart === 2 && (
          <section className="space-y-8 border-0 bg-transparent p-0 pt-2 shadow-none">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-serif text-xl font-semibold italic text-ink md:text-2xl">
                Part 2: Written ({openQuestions.length || '…'})
              </h3>
              <span className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-sans font-semibold text-stone-800">
                Written response
              </span>
            </div>
            {openQuestions.length > 0 && openQuestions[openStepIndex] && (
              <>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 font-sans text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <span>
                    Question {openStepIndex + 1} of {openQuestions.length}
                  </span>
                  {part2Complete && (
                    <span className="rounded-full border border-emerald-300/60 bg-emerald-50 px-2 py-0.5 text-emerald-800">
                      Section complete
                    </span>
                  )}
                </div>
                <div
                  key={openQuestions[openStepIndex].id}
                  className="animate-slide-up rounded-xl border border-[#1e293b]/35 bg-parchment-200/95 p-4 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.42)] sm:p-5"
                >
                  <label className="mb-2 block font-serif text-xl font-semibold text-ink">
                    Question {openStepIndex + 1}
                  </label>
                  <p className="mb-4 select-none font-serif text-lg leading-9 text-ink-muted">
                    {openQuestions[openStepIndex].text}
                  </p>
                  <textarea
                    className="input-field min-h-[180px] w-full select-text rounded-sm border-[#1e293b]/40 bg-parchment-150/95 font-serif text-lg leading-8 text-ink placeholder:text-stone-600 backdrop-blur-[1px]"
                    value={openAnswers[openQuestions[openStepIndex].id] ?? ''}
                    onChange={(e) =>
                      setOpenAnswers((a) => ({ ...a, [openQuestions[openStepIndex].id]: e.target.value }))
                    }
                    placeholder="Your answer…"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    disabled={openStepIndex === 0}
                    onClick={() => setOpenStepIndex((i) => Math.max(0, i - 1))}
                    className="rounded-md border border-[#1e293b]/45 bg-transparent px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#0f172a]/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Previous question
                  </button>
                  {openStepIndex < openQuestions.length - 1 && (
                    <button
                      type="button"
                      disabled={(openAnswers[openQuestions[openStepIndex].id] ?? '').trim().length === 0}
                      onClick={() => {
                        const cur = openQuestions[openStepIndex];
                        if ((openAnswers[cur.id] ?? '').trim().length === 0) return;
                        const idx = openStepIndex;
                        window.setTimeout(() => setOpenStepIndex(idx + 1), 400);
                      }}
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#1e293b] to-[#a07856] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Save &amp; next question
                    </button>
                  )}
                  {openStepIndex === openQuestions.length - 1 && (
                    <p className="font-sans text-sm text-ink-soft">
                      Last written prompt — finish your answer, then use <strong className="font-semibold text-ink">Next: Part 3</strong>{' '}
                      below when all prompts are complete.
                    </p>
                  )}
                </div>
              </>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1e293b]/25 pt-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTestPart(1);
                  setErr(null);
                }}
                className="rounded-md border border-[#1e293b]/45 bg-transparent px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-[#0f172a]/[0.06] disabled:opacity-50"
              >
                ← Part 1
              </button>
              <p className="order-3 w-full text-center font-sans text-sm text-ink-soft sm:order-none sm:w-auto">
                {part2Complete
                  ? 'All written answers complete. Continue when ready.'
                  : 'Answer each prompt — use Save & next to reveal the following question.'}
              </p>
              <button
                type="button"
                disabled={!part2Complete || correctingQuestions.length === 0}
                onClick={() => {
                  setMaxUnlockedPart((m) => (3 > m ? 3 : m));
                  setActiveTestPart(3);
                  setErr(null);
                }}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#1e293b] to-[#a07856] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next: Part 3 →
              </button>
            </div>
          </section>
          )}

          {activeTestPart === 3 && (
            <section className="space-y-8 border-0 bg-transparent p-0 pt-2 shadow-none">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-serif text-xl font-semibold italic text-ink md:text-2xl">
                  Part 3: Correcting mistakes ({correctingQuestions.length || '…'})
                </h3>
                <span className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-sans font-semibold text-stone-800">
                  Debug mindset
                </span>
              </div>
              {correctingQuestions.length > 0 && correctingQuestions[correctingStepIndex] && (
                <>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2 font-sans text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    <span>
                      Item {correctingStepIndex + 1} of {correctingQuestions.length}
                    </span>
                    {part3Complete && (
                      <span className="rounded-full border border-emerald-300/60 bg-emerald-50 px-2 py-0.5 text-emerald-800">
                        Section complete
                      </span>
                    )}
                  </div>
                  <div
                    key={correctingQuestions[correctingStepIndex].id}
                    className="animate-slide-up rounded-xl border border-[#1e293b]/35 bg-parchment-200/95 p-4 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.42)] sm:p-5"
                  >
                    <label className="mb-2 block font-serif text-xl font-semibold text-ink">
                      Correcting mistakes {correctingStepIndex + 1}
                    </label>
                    <p className="mb-4 select-none font-serif text-lg leading-9 text-ink-muted">
                      {correctingQuestions[correctingStepIndex].text}
                    </p>
                    <textarea
                      className="input-field min-h-[180px] w-full select-text rounded-sm border-[#1e293b]/40 bg-parchment-150/95 font-serif text-lg leading-8 text-ink placeholder:text-stone-600 backdrop-blur-[1px]"
                      value={correctingAnswers[correctingQuestions[correctingStepIndex].id] ?? ''}
                      onChange={(e) =>
                        setCorrectingAnswers((a) => ({
                          ...a,
                          [correctingQuestions[correctingStepIndex].id]: e.target.value,
                        }))
                      }
                      placeholder="Explain what is wrong, then provide the corrected version…"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      disabled={correctingStepIndex === 0}
                      onClick={() => setCorrectingStepIndex((i) => Math.max(0, i - 1))}
                      className="rounded-md border border-[#1e293b]/45 bg-transparent px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#0f172a]/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ← Previous item
                    </button>
                    {correctingStepIndex < correctingQuestions.length - 1 && (
                      <button
                        type="button"
                        disabled={
                          (correctingAnswers[correctingQuestions[correctingStepIndex].id] ?? '').trim().length === 0
                        }
                        onClick={() => {
                          const cur = correctingQuestions[correctingStepIndex];
                          if ((correctingAnswers[cur.id] ?? '').trim().length === 0) return;
                          const idx = correctingStepIndex;
                          window.setTimeout(() => setCorrectingStepIndex(idx + 1), 400);
                        }}
                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#1e293b] to-[#a07856] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Save &amp; next item
                      </button>
                    )}
                    {correctingStepIndex === correctingQuestions.length - 1 && (
                      <p className="font-sans text-sm text-ink-soft">
                        Last prompt — finish your correction, then use <strong className="font-semibold text-ink">Next: Part 4</strong>{' '}
                        when every item is complete.
                      </p>
                    )}
                  </div>
                </>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1e293b]/25 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTestPart(2);
                    setErr(null);
                  }}
                  className="rounded-md border border-[#1e293b]/45 bg-transparent px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-[#0f172a]/[0.06] disabled:opacity-50"
                >
                  ← Part 2
                </button>
                <p className="order-3 w-full text-center font-sans text-sm text-ink-soft sm:order-none sm:w-auto">
                  {part3Complete
                    ? 'All corrections complete. Continue when ready.'
                    : 'Complete each item — Save & next reveals the following prompt.'}
                </p>
                <button
                  type="button"
                  disabled={!part3Complete || practicalQuestions.length === 0}
                  onClick={() => {
                    setMaxUnlockedPart((m) => (4 > m ? 4 : m));
                    setActiveTestPart(4);
                    setErr(null);
                  }}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#1e293b] to-[#a07856] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next: Part 4 →
                </button>
              </div>
            </section>
          )}

          {activeTestPart === 4 && practicalQuestions.length > 0 && (
            <section className="space-y-8 border-0 bg-transparent p-0 pt-2 shadow-none">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-serif text-xl font-semibold italic text-ink md:text-2xl">
                  Part 4: Practical challenges ({practicalQuestions.length})
                </h3>
                <span className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-sans font-semibold text-stone-800">
                  Core challenge
                </span>
              </div>
              {practicalQuestions[practicalStepIndex] && (
                <>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2 font-sans text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    <span>
                      Challenge {practicalStepIndex + 1} of {practicalQuestions.length}
                    </span>
                    {part4Complete && (
                      <span className="rounded-full border border-emerald-300/60 bg-emerald-50 px-2 py-0.5 text-emerald-800">
                        Section complete
                      </span>
                    )}
                  </div>
                  <div
                    key={practicalQuestions[practicalStepIndex].id}
                    className="animate-slide-up rounded-xl border border-[#1e293b]/35 bg-parchment-200/95 p-4 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.42)] sm:p-5"
                  >
                    <label className="mb-2 block font-serif text-xl font-semibold text-ink">
                      Practical question {practicalStepIndex + 1}
                    </label>
                    <p className="mb-4 select-none font-serif text-lg leading-9 text-ink-muted">
                      {practicalQuestions[practicalStepIndex].text}
                    </p>
                    <textarea
                      className="input-field min-h-[190px] w-full select-text rounded-sm border-[#1e293b]/40 bg-parchment-150/95 font-serif text-lg leading-8 text-ink placeholder:text-stone-600 backdrop-blur-[1px]"
                      value={practicalAnswers[practicalQuestions[practicalStepIndex].id] ?? ''}
                      onChange={(e) =>
                        setPracticalAnswers((a) => ({
                          ...a,
                          [practicalQuestions[practicalStepIndex].id]: e.target.value,
                        }))
                      }
                      placeholder="Describe your practical approach and solution…"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      disabled={practicalStepIndex === 0}
                      onClick={() => setPracticalStepIndex((i) => Math.max(0, i - 1))}
                      className="rounded-md border border-[#1e293b]/45 bg-transparent px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#0f172a]/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ← Previous challenge
                    </button>
                    {practicalStepIndex < practicalQuestions.length - 1 && (
                      <button
                        type="button"
                        disabled={
                          (practicalAnswers[practicalQuestions[practicalStepIndex].id] ?? '').trim().length === 0
                        }
                        onClick={() => {
                          const cur = practicalQuestions[practicalStepIndex];
                          if ((practicalAnswers[cur.id] ?? '').trim().length === 0) return;
                          const idx = practicalStepIndex;
                          window.setTimeout(() => setPracticalStepIndex(idx + 1), 400);
                        }}
                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#1e293b] to-[#a07856] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Save &amp; next challenge
                      </button>
                    )}
                    {practicalStepIndex === practicalQuestions.length - 1 && (
                      <p className="font-sans text-sm text-ink-soft">
                        Last challenge — finish your answer, then use <strong className="font-semibold text-ink">Next: Part 5</strong>{' '}
                        when all challenges are complete.
                      </p>
                    )}
                  </div>
                </>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1e293b]/25 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTestPart(3);
                    setErr(null);
                  }}
                  className="rounded-md border border-[#1e293b]/45 bg-transparent px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-[#0f172a]/[0.06] disabled:opacity-50"
                >
                  ← Part 3
                </button>
                <p className="order-3 w-full text-center font-sans text-sm text-ink-soft sm:order-none sm:w-auto">
                  {part4Complete
                    ? 'All practical challenges complete. Continue when ready.'
                    : 'Complete each challenge — Save & next reveals the following question.'}
                </p>
                <button
                  type="button"
                  disabled={!part4Complete}
                  onClick={() => {
                    setMaxUnlockedPart((m) => (5 > m ? 5 : m));
                    setActiveTestPart(5);
                    setErr(null);
                  }}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#1e293b] to-[#a07856] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next: Part 5 →
                </button>
              </div>
            </section>
          )}

          {activeTestPart === 5 && (
            <section className="space-y-8 border-0 bg-transparent p-0 pt-2 shadow-none">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-serif text-xl font-semibold italic text-ink md:text-2xl">Part 5: AI interview (5)</h3>
                <span className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-sans font-semibold text-stone-800">
                  Voice interview (camera optional)
                </span>
              </div>
              <div className="space-y-4 rounded-2xl border border-[#1e293b]/30 bg-parchment-50/80 p-4 shadow-[0_10px_30px_-18px_rgba(45,34,26,0.45)] md:p-5">
                {typeof window !== 'undefined' && !window.isSecureContext ? (
                  <div className="rounded-lg border border-amber-400/80 bg-amber-50/95 p-3 font-sans text-sm leading-relaxed text-amber-950">
                    <strong className="font-semibold">Microphone and camera need a secure page.</strong> Use{' '}
                    <strong className="font-semibold">https://</strong> or open this app on <strong className="font-semibold">localhost</strong>. On plain{' '}
                    <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">http://</code> (except localhost), the browser will block media.
                  </div>
                ) : null}
                <div className="rounded-xl border border-[#1e293b]/20 bg-[#0f172a]/[0.03] p-4">
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">How this part works</p>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-ink-soft">
                    <strong className="text-ink">Video interview:</strong> each question is played as audio only (nothing written on screen).
                    Reply by voice like a short call, then save each round to continue.
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-lg border border-[#1e293b]/20 bg-white/70 px-3 py-2">
                      <p className="font-sans text-xs font-semibold text-ink">1) Start session</p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                        The browser usually asks for the <strong className="font-semibold text-ink">microphone</strong> first; camera is optional for preview. Then click Start.
                      </p>
                    </div>
                    <div className="rounded-lg border border-[#1e293b]/20 bg-white/70 px-3 py-2">
                      <p className="font-sans text-xs font-semibold text-ink">2) Listen then answer</p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-soft">Wait for audio to finish, then speak clearly in one take.</p>
                    </div>
                    <div className="rounded-lg border border-[#1e293b]/20 bg-white/70 px-3 py-2">
                      <p className="font-sans text-xs font-semibold text-ink">3) Save every round</p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-soft">Use Save & next round until all rounds are completed.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1e293b]/20 bg-white/70 px-3.5 py-3">
                  <label className="flex cursor-pointer items-center gap-2 font-sans text-sm font-medium text-ink">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-stone-400 text-stone-800"
                      checked={autoAskAnswer}
                      onChange={(e) => setAutoAskAnswer(e.target.checked)}
                    />
                    Auto-start microphone after each question
                  </label>
                  <span className="rounded-full bg-stone-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
                    Integrity monitoring active
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span className={`rounded-full px-2.5 py-1 ${micReady ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-600'}`}>
                    Mic: {micReady ? 'ready' : 'off'}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 ${cameraReady ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-600'}`}>
                    Camera: {cameraReady ? 'ready' : 'off'}
                  </span>
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-stone-700">
                    Tab switches: {tabSwitchCount}
                  </span>
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-stone-700">
                    Face missing: {faceMissingCount}
                  </span>
                </div>

                <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-[#1e293b]/30 bg-stone-950 shadow-inner">
                  <video
                    ref={interviewVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`mx-auto block bg-stone-900 object-cover object-top ${
                      interviewStarted ? 'aspect-video min-h-[220px] w-full sm:min-h-[320px]' : 'h-40 w-full max-w-sm sm:h-48'
                    }`}
                  />
                </div>
                {!interviewStarted && (
                  <button
                    type="button"
                    onClick={startInterviewSession}
                    className="inline-flex w-full max-w-3xl items-center justify-center rounded-xl bg-gradient-to-r from-[#1e293b] to-[#a07856] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_-12px_rgba(92,64,51,0.8)] transition hover:brightness-110"
                  >
                    Start AI interview
                  </button>
                )}
                {interviewNotice && (
                  <div
                    className="mt-3 rounded-xl border border-amber-300/80 bg-amber-50/95 px-4 py-3 font-sans text-sm leading-relaxed text-amber-950"
                    role="status"
                  >
                    {interviewNotice}
                  </div>
                )}
                {interviewStarted && (
                  <div className="mt-3 space-y-3 rounded-xl border border-[#1e293b]/20 bg-white/70 px-3 py-3">
                    <button
                      type="button"
                      disabled={interviewMediaPending}
                      onClick={retryInterviewMedia}
                      className="inline-flex w-full max-w-md items-center justify-center rounded-lg bg-gradient-to-r from-[#1e293b] to-[#a07856] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {interviewMediaPending ? 'Requesting access…' : 'Allow microphone (retry)'}
                    </button>
                    <ol className="list-decimal space-y-1 pl-5 font-sans text-xs leading-relaxed text-ink-soft">
                      <li>Click <strong className="text-ink">Allow microphone</strong> above (or the lock icon in the address bar).</li>
                      <li>Set <strong className="text-ink">Microphone</strong> to Ask or Allow. Camera is optional for preview only.</li>
                      <li>If no prompt appears, check OS privacy settings (Windows: Settings → Privacy → Microphone).</li>
                    </ol>
                  </div>
                )}
              </div>

              {interviewStarted && interviewQuestions[interviewIndex] && (
                <div className="space-y-4 rounded-xl border border-[#1e293b]/30 bg-parchment-50/75 p-4">
                  <div className="flex flex-wrap items-center gap-3 border-b border-[#1e293b]/20 pb-3">
                    <div className="flex flex-wrap gap-2 font-sans text-xs font-semibold">
                      <span
                        className={`rounded-full px-3 py-1 ${interviewerSpeaking ? 'bg-[#1e293b] text-white' : 'bg-stone-200 text-stone-600'}`}
                      >
                        1 · Listen
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 ${!interviewerSpeaking ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}
                      >
                        2 · Speak
                      </span>
                    </div>
                    {interviewerSpeaking && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                        Examiner speaking — listen
                      </span>
                    )}
                    {speechListening && !interviewerSpeaking && (
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-900">
                        Mic on — your turn
                      </span>
                    )}
                    <span className="ml-auto font-sans text-xs font-semibold text-[#4f46e5]">
                      Round {interviewIndex + 1} / {interviewQuestions.length}
                    </span>
                  </div>
                  <p className="font-sans text-center text-sm text-ink-soft">
                    The question plays as audio only. After it finishes, answer by voice or type your reply below — both count for this round.
                  </p>
                  {!micReady && !interviewerSpeaking && (
                    <p className="rounded-lg border border-sky-200 bg-sky-50/90 px-3 py-2 text-center font-sans text-xs leading-relaxed text-sky-950">
                      Microphone is off. Use <strong className="font-semibold">Allow microphone (retry)</strong> above, or type your answer in the box below.
                    </p>
                  )}
                  <div className="flex flex-wrap justify-center gap-2">
                    {speechSupported && (
                      <button
                        type="button"
                        title={
                          !micReady
                            ? 'Turn on the microphone with the button above, then try again.'
                            : undefined
                        }
                        disabled={interviewerSpeaking || !micReady}
                        onClick={() => {
                          if (speechListening) {
                            stopVoiceCapture();
                          } else {
                            beginVoiceCapture();
                          }
                        }}
                        className="rounded-md border border-[#1e293b]/40 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#0f172a]/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {speechListening ? 'Stop microphone' : 'Speak your answer'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        speakInterviewQuestion(interviewQuestions[interviewIndex].text, {
                          onComplete: () => maybeAutoListenAfterQuestion(),
                        })
                      }
                      className="rounded-md border border-[#1e293b]/40 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#0f172a]/[0.06]"
                    >
                      Play question audio again
                    </button>
                  </div>
                  <div
                    className={`rounded-lg border px-4 py-3 text-center font-sans text-sm ${
                      interviewDraft.trim().length > 0
                        ? 'border-emerald-300 bg-emerald-50/90 text-emerald-900'
                        : 'border-stone-200 bg-stone-50/80 text-stone-600'
                    }`}
                    aria-live="polite"
                  >
                    {interviewDraft.trim().length > 0
                      ? 'Answer ready — you can save and continue.'
                      : interviewerSpeaking
                        ? 'Listen to the question…'
                        : !micReady
                          ? 'Grant microphone access above, or type your answer below.'
                          : speechSupported
                            ? 'Use Speak your answer when you are ready, or type below.'
                            : 'Type your answer in the box below.'}
                  </div>
                  {!speechSupported ? (
                    <div className="rounded-lg border border-[#1e293b]/25 bg-white/80 px-3 py-3 font-sans text-sm">
                      <p className="text-xs font-semibold text-ink">This browser does not support voice capture — type your answer.</p>
                      <label htmlFor="interview-draft-type" className="mt-2 block text-xs font-medium text-ink-soft">
                        Your answer for this round
                      </label>
                      <textarea
                        id="interview-draft-type"
                        rows={4}
                        value={interviewDraft}
                        onChange={(e) => setInterviewDraft(e.target.value)}
                        placeholder="Write your answer here."
                        className="mt-1 w-full resize-y rounded-md border border-[#1e293b]/30 bg-white px-3 py-2 text-sm text-ink shadow-inner placeholder:text-stone-400 focus:border-[#1e293b]/60 focus:outline-none focus:ring-2 focus:ring-[#1e293b]/20"
                      />
                    </div>
                  ) : (
                    <details className="group rounded-lg border border-[#1e293b]/25 bg-white/80 px-3 py-2 font-sans text-sm">
                      <summary className="cursor-pointer select-none font-semibold text-ink hover:text-[#1e293b]">
                        Type your answer instead (if the mic is blocked or you prefer typing)
                      </summary>
                      <label htmlFor="interview-draft-type" className="mt-2 block text-xs font-medium text-ink-soft">
                        Your answer for this round
                      </label>
                      <textarea
                        id="interview-draft-type"
                        rows={4}
                        value={interviewDraft}
                        onChange={(e) => setInterviewDraft(e.target.value)}
                        placeholder="Write your spoken-style answer here. You can edit text from voice recognition too."
                        className="mt-1 w-full resize-y rounded-md border border-[#1e293b]/30 bg-white px-3 py-2 text-sm text-ink shadow-inner placeholder:text-stone-400 focus:border-[#1e293b]/60 focus:outline-none focus:ring-2 focus:ring-[#1e293b]/20"
                      />
                    </details>
                  )}
                  <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#1e293b]/25 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        const q = interviewQuestions[interviewIndex];
                        const answer = interviewDraft.trim();
                        if (!q || !answer) {
                          setErr(
                            'Add an answer for this round: use the microphone after the question finishes, or type in “Type your answer instead”, then save.',
                          );
                          return;
                        }
                        setErr(null);
                        setAiInterviewAnswers((a) => ({ ...a, [q.id]: answer }));
                        setInterviewTurns((t) => [...t, { questionId: q.id, question: q.text, answer, startedAt: new Date().toISOString() }]);
                        setInterviewDraft('');
                        stopVoiceCapture();
                        if (interviewIndex < interviewQuestions.length - 1) {
                          const next = interviewQuestions[interviewIndex + 1];
                          setInterviewIndex((i) => i + 1);
                          speakInterviewQuestion(next.text, {
                            onComplete: () => maybeAutoListenAfterQuestion(),
                          });
                        }
                      }}
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#1e293b] to-[#a07856] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                    >
                      {interviewIndex < interviewQuestions.length - 1 ? 'Save & next round' : 'Save final round'}
                    </button>
                  </div>
                </div>
              )}

              {interviewTurns.length > 0 && (
                <div className="rounded-xl border border-[#1e293b]/25 bg-[#0f172a]/[0.03] p-4">
                  <p className="font-sans text-sm font-semibold text-ink">
                    Rounds completed: {interviewTurns.length} / {interviewQuestions.length}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1e293b]/25 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTestPart(4);
                    setErr(null);
                  }}
                  className="rounded-md border border-[#1e293b]/45 bg-transparent px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-[#0f172a]/[0.06] disabled:opacity-50"
                >
                  ← Part 4
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSubmitForGrading}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#1e293b] to-[#a07856] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Submit for grading
                </button>
              </div>
            </section>
          )}
          {err && <p className="text-sm text-red-600">{err}</p>}
          </div>
        </div>
