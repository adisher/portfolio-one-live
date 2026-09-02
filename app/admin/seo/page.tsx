import { redirect } from 'next/navigation'

// SEO now lives inside Settings.
export default function SeoPage() {
  redirect('/admin/settings')
}
