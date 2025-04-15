import { redirect } from "next/navigation"

export default function LanguagePage({ params }: { params: { lang: string } }) {
  // Redirect to the home page
  redirect("/")
}
