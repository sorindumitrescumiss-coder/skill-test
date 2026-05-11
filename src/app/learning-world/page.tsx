import React from 'react';
import AppLayout from '@/components/AppLayout';
import CredentialingHero from '@/components/CredentialingHero';
import TrustedBySection from '@/components/TrustedBySection';
import LearningWorldClient from './components/LearningWorldClient';

const LEARNING_WORLD_TITLE =
  "Let's immerse ourselves in the vast and deep world of learning, as vast as the universe.";

const LEARNING_WORLD_INTRO = (
  <>
    Your hub for what to study next: every domain is organized as a track—so you can explore topics, focus your prep, and
    move from reading and practice into the AI skill test when you are ready.
    <span className="ml-1 font-semibold text-amber-100">Explore domains. Study with intent. Prove what you know.</span>
  </>
);

export default function LearningWorldPage() {
  return (
    <AppLayout activePath="/learning-world">
      <div className="space-y-0">
        <CredentialingHero
          eyebrow="Learning World"
          title={LEARNING_WORLD_TITLE}
          description={LEARNING_WORLD_INTRO}
          secondaryCta={{ href: '#learning-tracks', label: 'Browse tracks' }}
          relaxedTop
          showCollage={false}
          heroImage={{
            src: '/learning-world/learning-study-desk.png',
            alt: 'Learner at a desk with a laptop, coding books on HTML, JavaScript, and Python, and a whiteboard study plan',
          }}
          showMetricsAndCampaigns={false}
        />
        <TrustedBySection />
        <div className="bg-parchment-100 px-4 pb-14 pt-10 sm:px-6">
          <LearningWorldClient />
        </div>
      </div>
    </AppLayout>
  );
}
