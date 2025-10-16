import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ResetPasswordForm from "@/components/forms/ResetPasswordForm";

interface ResetPasswordPageProps {
  params: Promise<{ token: string }>;
}

export default async function ResetPasswordPage({
  params,
}: ResetPasswordPageProps) {
  const { token } = await params;
  if (!token) {
    redirect("/login");
  }
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!resetToken || resetToken.expires < new Date()) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Link inválido ou expirado
          </h2>
          <p className="text-gray-600 mb-6">
            O link de recuperação de senha é inválido ou já expirou. Por favor,
            solicite um novo.
          </p>
          <a href="/login" className="text-blue-600 hover:underline">
            Voltar para o login
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Redefinir senha
        </h2>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
