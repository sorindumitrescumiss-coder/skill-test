import React from 'react';
import AppLayout from '@/components/AppLayout';
import ProfilePageClient from './ProfilePageClient';

export default function ProfilePage() {
  return (
    <AppLayout activePath="/profile">
      <ProfilePageClient />
    </AppLayout>
  );
}
