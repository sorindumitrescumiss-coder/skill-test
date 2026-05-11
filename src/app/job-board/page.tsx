import React from 'react';
import AppLayout from '@/components/AppLayout';
import JobBoardClient from './components/JobBoardClient';

export default function JobBoardPage() {
  return (
    <AppLayout activePath="/job-board">
      <JobBoardClient />
    </AppLayout>
  );
}