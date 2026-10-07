import AuthForm from "@/components/forms/AuthForm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }
  const { mode } = await searchParams;
  return <AuthForm initialMode={mode === "register" ? "register" : "login"} />;
}
