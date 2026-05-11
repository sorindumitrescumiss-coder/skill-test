import { redirect } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { getSupabaseServer } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin';
import AdminThirdwebProvider from './AdminThirdwebProvider';
import CreateNFTAdminClient from './CreateNFTAdminClient';

export default async function AdminCreateNFTPage() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-up-login-screen');
  if (!isAdminEmail(user.email)) redirect('/dashboard');

  return (
    <AppLayout activePath="/admin/create-nft">
      <AdminThirdwebProvider>
        <CreateNFTAdminClient />
      </AdminThirdwebProvider>
    </AppLayout>
  );
}
