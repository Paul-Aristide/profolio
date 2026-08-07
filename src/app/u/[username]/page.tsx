// src/app/u/[username]/page.tsx
import PublicProfile from '@/components/PublicProfile';

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return (
    <div className="min-h-screen bg-brand-bg">
      <PublicProfile username={username} />
    </div>
  );
}
