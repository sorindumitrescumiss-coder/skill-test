import Link from 'next/link';
import AppLayout from '@/components/AppLayout';

export default function BillingCancelPage() {
  return (
    <AppLayout activePath="/skill-test">
      <div className="mx-auto max-w-lg rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-xl font-semibold text-amber-900">Payment cancelled</h1>
        <p className="mt-2 text-sm text-amber-800">
          No charge was made. Return to the skill test when you are ready to pay the exam fee.
        </p>
        <Link
          href="/billing"
          className="mt-5 inline-flex rounded-md bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900"
        >
          Back to billing
        </Link>
      </div>
    </AppLayout>
  );
}
