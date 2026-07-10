import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Summitet',
  description: 'Manage your store',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
