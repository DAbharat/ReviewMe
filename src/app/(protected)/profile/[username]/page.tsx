import ProfileClient from '@/components/profile/ProfileClient'

export default async function page({ params }: { params: any }) {
  const resolved = await params
  const username = resolved?.username ?? 'username'

  return <ProfileClient username={username} />
}

