import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Bekollo',
  description: 'Manage your store',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
