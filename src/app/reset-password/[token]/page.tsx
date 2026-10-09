import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Car, Check, KeyRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ResetPasswordForm from "@/components/forms/ResetPasswordForm";
import styles from "./reset-password.module.css";

interface ResetPasswordPageProps {
  params: Promise<{ token: string }>;
}

export default async function ResetPasswordPage({
  params,
}: ResetPasswordPageProps) {
  const { token } = await params;
  if (!token) redirect("/login");

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });
  const isTokenValid = resetToken && resetToken.expires >= new Date();

  return (
    <main className={styles.page}>
      <aside className={styles.brandPanel}>
        <Link href="/" className={styles.logo} aria-label="SynCar — página inicial">
          <span><Car size={24} aria-hidden="true" /></span>syncar.
        </Link>
        <div className={styles.brandContent}>
          <div className={styles.brandIcon}><KeyRound size={22} aria-hidden="true" /></div>
          <h2>Proteja sua conta.<br />Retome o controle <em>da sua operação.</em></h2>
          <p>Defina uma nova senha para voltar a acompanhar sua frota, equipe e contratos em um só lugar.</p>
          <ul>
            <li><Check size={18} aria-hidden="true" /> Uma senha forte protege seu acesso</li>
            <li><Check size={18} aria-hidden="true" /> Suas informações ficam no mesmo lugar</li>
          </ul>
        </div>
        <p className={styles.brandFoot}>Da frota ao resultado. Uma visão completa.</p>
      </aside>

      <section className={styles.formPanel} aria-labelledby="reset-title">
        <Link href="/login" className={styles.backLink}><ArrowLeft size={16} aria-hidden="true" /> Voltar para o login</Link>
        <div className={styles.formContent}>
          {isTokenValid ? (
            <>
              <header className={styles.heading}>
                <p className={styles.eyebrow}>ACESSO À CONTA</p>
                <h1 id="reset-title">Redefinir senha</h1>
                <p>Escolha uma senha nova para proteger sua conta SynCar.</p>
              </header>
              <ResetPasswordForm token={token} />
              <p className={styles.formFoot}>O link de redefinição é pessoal e válido por tempo limitado.</p>
            </>
          ) : (
            <div className={styles.expired}>
              <div className={styles.expiredIcon}><KeyRound size={22} aria-hidden="true" /></div>
              <p className={styles.eyebrow}>LINK INDISPONÍVEL</p>
              <h1 id="reset-title">Este link expirou</h1>
              <p>O link de recuperação é inválido ou já expirou. Solicite um novo para continuar.</p>
              <Link href="/login" className={styles.submit}>Voltar para o login <ArrowLeft size={17} aria-hidden="true" /></Link>
            </div>
          )}
        </div>
        <p className={styles.formFoot}>© {new Date().getFullYear()} SynCar. Todos os direitos reservados.</p>
      </section>
    </main>
  );
}
