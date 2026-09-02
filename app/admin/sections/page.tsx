import { redirect } from 'next/navigation'

// The Sections page is retired — its content toggles and CTA banner moved
// into Content (under Advanced), and the video is now a Video block.
export default function SectionsPage() {
  redirect('/admin/links')
}
