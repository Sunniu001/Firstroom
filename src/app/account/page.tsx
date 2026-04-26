import { Suspense } from 'react';
import { AccountDashboard } from '@/components/AccountDashboard/AccountDashboard';

export const metadata = {
  title: 'My Account — FirstRoom',
  description: 'Manage your FirstRoom account.',
};

export default function AccountPage() {
  return (
    <Suspense fallback={<div>Loading account...</div>}>
      <AccountDashboard />
    </Suspense>
  );
}
