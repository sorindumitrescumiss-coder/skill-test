import React from 'react';
import AppLayout from '@/components/AppLayout';
import CandidatesClient from '@/app/candidates/CandidatesClient';

export default function CandidatesPage() {
  return (
    <AppLayout activePath="/candidates">
      <CandidatesClient />
    </AppLayout>
  );
}
