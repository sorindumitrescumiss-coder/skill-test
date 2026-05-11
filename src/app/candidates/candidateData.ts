/** Structured profile for verified candidates who passed the AI skill test. Hook `recordingUrl` to signed storage URLs in production. */

export type CandidateRecord = {
  id: string;
  /** Short public credential-style identifier shown on the card */
  displayId: string;
  fullName: string;
  avatarUrl: string;
  badge: 'Verified' | 'Top Rated' | 'Level 1';
  /** One-line headline — typically domain + assessment type */
  headline: string;
  /** Topic, difficulty, languages, parts evaluated */
  testDetails: string;
  /** How passing was determined */
  passingFormat: string;
  score: number;
  /** Score shown as “stars” (derived from score / 100) */
  starRating: number;
  selfIntroduction: string;
  experience: string;
  /** ISO date passed */
  passedAt: string;
  /** Full session recording — required on every profile */
  recordingUrl: string;
  recordingPosterUrl?: string;
  /** Broad category for filters */
  field: string;
};

/** Demo records — replace with API aggregating `profiles`, `skill_test_results`, and storage paths for recordings. */
export const CANDIDATE_SEED: CandidateRecord[] = [
  {
    id: 'cand-001',
    displayId: 'CERT-2026-A7F3B2E1',
    fullName: 'Sarah Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&q=80',
    badge: 'Top Rated',
    headline: 'Web development · Full-stack AI Skill Test',
    testDetails: 'Field: Web development · Difficulty: Advanced · Languages: TypeScript, English · Parts: MCQ, written, corrections, practical, AI interview.',
    passingFormat: 'Pass threshold ≥ 70 overall; MCQ auto-scored; written & interview AI-evaluated against rubric.',
    score: 94,
    starRating: 5,
    selfIntroduction:
      'Frontend-focused engineer with eight years shipping design systems and performance-critical SPAs. I care about measurable UX and accessible interfaces.',
    experience: '8+ yrs · React, Next.js, Node — previously Staff Engineer at a Series C fintech.',
    passedAt: '2026-04-18',
    recordingUrl: '/hero-side-video.mp4',
    recordingPosterUrl: '/hero-side-ai-learning.png',
    field: 'Web development',
  },
  {
    id: 'cand-002',
    displayId: 'CERT-2026-91C4D8AA',
    fullName: 'Marcus Webb',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&h=120&fit=crop&q=80',
    badge: 'Verified',
    headline: 'Blockchain · Smart contracts AI Skill Test',
    testDetails: 'Field: Blockchain · Difficulty: Expert · Focus: Solidity, security patterns · Full five-part assessment completed.',
    passingFormat: 'Overall ≥ 70 required; practical scenarios weighted for smart-contract reasoning.',
    score: 88,
    starRating: 4.9,
    selfIntroduction:
      'Security-minded Solidity developer. I have audited internal protocols and shipped staking products on mainnet.',
    experience: '6 yrs · Solidity, Foundry, Hardhat — contributor to open-source DeFi tooling.',
    passedAt: '2026-04-12',
    recordingUrl: '/hero-side-video.mp4',
    recordingPosterUrl: '/hero-side-team-2.png',
    field: 'Blockchain',
  },
  {
    id: 'cand-003',
    displayId: 'CERT-2026-55E902FD',
    fullName: 'Elena Vasquez',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&q=80',
    badge: 'Top Rated',
    headline: 'AI / ML · Applied reasoning Skill Test',
    testDetails: 'Field: AI · Difficulty: Intermediate · Subtopics: NLP, evaluation metrics · Interview conducted via voice + camera.',
    passingFormat: 'Pass line 70; interview rounds scored on clarity and trade-off reasoning.',
    score: 91,
    starRating: 5,
    selfIntroduction:
      'ML engineer moving NLP models from notebook to production. Interested in evaluation harnesses and responsible deployment.',
    experience: '5 yrs · Python, PyTorch, Hugging Face — MLOps on GCP.',
    passedAt: '2026-04-22',
    recordingUrl: '/hero-side-video.mp4',
    recordingPosterUrl: '/hero-side-ai-learning.png',
    field: 'AI',
  },
  {
    id: 'cand-004',
    displayId: 'CERT-2026-B12A9988',
    fullName: 'James Okonkwo',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&q=80',
    badge: 'Level 1',
    headline: 'Mobile development · Cross-platform Skill Test',
    testDetails: 'Field: Mobile · Flutter & Dart · Intermediate difficulty · All sections submitted within session limit.',
    passingFormat: 'Weighted combination of MCQ (40%), written/practical (45%), interview (15%).',
    score: 76,
    starRating: 4.5,
    selfIntroduction:
      'Mobile developer delivering polished consumer apps. Background in REST integrations and offline-first UX.',
    experience: '4 yrs · Flutter, Kotlin — shipped apps with 500k+ installs.',
    passedAt: '2026-03-30',
    recordingUrl: '/hero-side-video.mp4',
    recordingPosterUrl: '/hero-side-celebration.png',
    field: 'Mobile development',
  },
  {
    id: 'cand-005',
    displayId: 'CERT-2026-CC771200',
    fullName: 'Priya Natarajan',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&q=80',
    badge: 'Verified',
    headline: 'Architecture · BIM & visualization Skill Test',
    testDetails: 'Field: Architecture · Master difficulty · Subtopics: BIM, structural coordination.',
    passingFormat: 'Pass ≥ 70; correcting-mistakes section required for licensure-style rigor.',
    score: 82,
    starRating: 4.7,
    selfIntroduction:
      'Architectural technologist bridging BIM coordination with sustainability constraints on mid-rise commercial projects.',
    experience: '7 yrs · Revit, Rhino — LEED-focused consultancy.',
    passedAt: '2026-04-05',
    recordingUrl: '/hero-side-video.mp4',
    recordingPosterUrl: '/hero-side-meeting.png',
    field: 'Architecture',
  },
  {
    id: 'cand-006',
    displayId: 'CERT-2026-D9013344',
    fullName: 'Alex Rivera',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&q=80',
    badge: 'Top Rated',
    headline: 'Game development · Unity AI Skill Test',
    testDetails: 'Field: Game dev · Difficulty: Advanced · C#, gameplay networking emphasis.',
    passingFormat: 'Overall pass + practical scenarios must meet rubric “meets expectations”.',
    score: 89,
    starRating: 4.9,
    selfIntroduction:
      'Gameplay programmer focusing on responsive combat systems and netcode for cooperative titles.',
    experience: '9 yrs · Unity, Photon — shipped AA multiplayer titles.',
    passedAt: '2026-04-20',
    recordingUrl: '/hero-side-video.mp4',
    recordingPosterUrl: '/hero-side-team-1.png',
    field: 'Game development',
  },
];
