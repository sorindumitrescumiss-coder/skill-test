import { redirect } from 'next/navigation';

/** Settings merged into Profile — keep route for old links. */
export default function SettingsPage() {
  redirect('/profile');
}
