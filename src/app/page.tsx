import { redirect } from "next/navigation";

/** The app entry point. Owners start at the login page. */
export default function Home() {
  redirect("/login");
}
