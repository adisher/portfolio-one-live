import { redirect } from 'next/navigation'

// Social profiles now live inside the Profile page.
export default function SocialPage() {
  redirect('/admin/profile')
}
