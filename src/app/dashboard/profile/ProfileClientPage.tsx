"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowUpRight, Building2, Check, CreditCard, ExternalLink, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { User as UserType } from "@/types";
import { useFetchProfile } from "@/hooks/useData";
import UpgradeModal from "@/components/ui/UpgradeModal";
import { useToast } from "@/context/ToastContext";
import ProfileSkeleton from "./ProfileSkeleton";
import styles from "./profile.module.css";

async function responseError(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return data.error || fallback;
  } catch {
    return fallback;
  }
}

function ProfileForm({ profile, mutateProfile }: { profile: UserType; mutateProfile: () => void }) {
  const { update } = useSession();
  const [formData, setFormData] = useState({ name: "", email: "", companyName: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({ name: profile.name || "", email: profile.email || "", companyName: profile.companyName || "" });
  }, [profile]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setMessage("");
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        setError(await responseError(response, "Não foi possível atualizar o perfil."));
        return;
      }
      await update({ name: formData.name, email: formData.email });
      mutateProfile();
      setMessage("Dados atualizados com sucesso.");
    } catch {
      setError("Não foi possível salvar os dados. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="profile-name">Nome completo <span aria-hidden="true">*</span></label>
        <div className={styles.inputWrap}><UserRound size={18} aria-hidden="true" /><input id="profile-name" name="name" type="text" autoComplete="name" value={formData.name} onChange={handleChange} required /></div>
      </div>
      <div className={styles.field}>
        <label htmlFor="profile-email">E-mail <span aria-hidden="true">*</span></label>
        <div className={styles.inputWrap}><Mail size={18} aria-hidden="true" /><input id="profile-email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} required /></div>
      </div>
      <div className={styles.field}>
        <label htmlFor="profile-company">Nome da empresa <span aria-hidden="true">*</span></label>
        <div className={styles.inputWrap}><Building2 size={18} aria-hidden="true" /><input id="profile-company" name="companyName" type="text" autoComplete="organization" value={formData.companyName} onChange={handleChange} required /></div>
      </div>
      <div className={styles.formFooter}>
        <button type="submit" className={styles.saveButton} disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar alterações"}</button>
        {message && <p className={styles.successMessage} role="status"><Check size={16} aria-hidden="true" />{message}</p>}
        {error && <p className={styles.errorMessage} role="alert">{error}</p>}
      </div>
    </form>
  );
}

function PasswordForm() {
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPasswords((previous) => ({ ...previous, [name]: value }));
    setMessage("");
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    if (passwords.newPassword.length < 8) {
      setError("A nova senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setError("A nova senha e a confirmação não coincidem.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }),
      });
      if (!response.ok) {
        setError(await responseError(response, "Não foi possível alterar a senha."));
        return;
      }
      setPasswords({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      setMessage("Senha alterada com sucesso.");
    } catch {
      setError("Não foi possível alterar a senha. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="current-password">Senha atual <span aria-hidden="true">*</span></label>
        <div className={styles.inputWrap}><LockKeyhole size={18} aria-hidden="true" /><input id="current-password" name="currentPassword" type="password" autoComplete="current-password" value={passwords.currentPassword} onChange={handleChange} required /></div>
      </div>
      <div className={styles.field}>
        <label htmlFor="new-password">Nova senha <span aria-hidden="true">*</span></label>
        <div className={styles.inputWrap}><LockKeyhole size={18} aria-hidden="true" /><input id="new-password" name="newPassword" type="password" autoComplete="new-password" minLength={8} value={passwords.newPassword} onChange={handleChange} required aria-describedby="password-hint" /></div>
        <p id="password-hint" className={styles.fieldHint}>Use pelo menos 8 caracteres.</p>
      </div>
      <div className={styles.field}>
        <label htmlFor="confirm-password">Confirmar nova senha <span aria-hidden="true">*</span></label>
        <div className={styles.inputWrap}><LockKeyhole size={18} aria-hidden="true" /><input id="confirm-password" name="confirmNewPassword" type="password" autoComplete="new-password" value={passwords.confirmNewPassword} onChange={handleChange} required /></div>
      </div>
      <div className={styles.formFooter}>
        <button type="submit" className={styles.saveButton} disabled={isSubmitting}>{isSubmitting ? "Alterando..." : "Alterar senha"}</button>
        {message && <p className={styles.successMessage} role="status"><Check size={16} aria-hidden="true" />{message}</p>}
        {error && <p className={styles.errorMessage} role="alert">{error}</p>}
      </div>
    </form>
  );
}

export default function ProfileClientPage({ initialProfile }: { initialProfile: UserType | null }) {
  const { data: session, status: sessionStatus, update } = useSession();
  const { profile, isError, mutateProfile } = useFetchProfile(initialProfile);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgrade") !== "success") return;
    update();
    mutateProfile();
    showToast("Upgrade realizado com sucesso!", "success");
    params.delete("upgrade");
    const query = params.toString();
    window.history.replaceState({ path: window.location.pathname }, "", window.location.pathname + (query ? `?${query}` : ""));
  }, [update, mutateProfile, showToast]);

  if (!profile && !isError) return <ProfileSkeleton />;
  if (isError || !profile) return <div className={styles.loadError} role="alert">Não foi possível carregar o perfil. Atualize a página para tentar novamente.</div>;

  const handleManageSubscription = async () => {
    setIsPortalLoading(true);
    try {
      const response = await fetch("/api/stripe/create-portal-session", { method: "POST" });
      if (!response.ok) throw new Error("Falha ao abrir o portal de gerenciamento.");
      const { url } = await response.json();
      window.location.href = url;
    } catch {
      showToast("Erro ao acessar o portal. Tente novamente.", "error");
      setIsPortalLoading(false);
    }
  };

  const userPlan = session?.user?.plan || "BASIC";
  const isBasicPlan = userPlan === "BASIC";
  const planName = userPlan === "PROFESSIONAL" ? "Profissional" : isBasicPlan ? "Básico" : userPlan;

  return (
    <main className={styles.page}>
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} resourceName="seu plano atual" monthlyPrice="R$ 49,90" annualPrice="R$ 499" annualSavings="Economize R$ 99,80" />
      <header className={styles.intro}>
        <div>
          <span className={styles.eyebrow}>Conta e acesso</span>
          <h1>Meu perfil</h1>
          <p>Gerencie os dados da conta, sua assinatura e a segurança do acesso.</p>
        </div>
        <div className={styles.introMark} aria-hidden="true"><UserRound size={30} strokeWidth={1.7} /></div>
      </header>

      <section className={styles.subscription} aria-labelledby="subscription-title">
        <div className={styles.planIcon}><CreditCard size={23} aria-hidden="true" /></div>
        <div className={styles.planCopy}>
          <span className={styles.planLabel}>Plano e assinatura</span>
          {sessionStatus === "loading" ? (
            <h2 id="subscription-title" className={styles.planLoading} aria-label="Carregando plano" />
          ) : (
            <>
              <div className={styles.planTitleRow}><h2 id="subscription-title">{planName}</h2><span className={styles.planBadge}>{isBasicPlan ? "Gratuito" : "Ativo"}</span></div>
              <p>{isBasicPlan ? "Organize sua operação gratuitamente. Amplie os recursos quando precisar." : "Gerencie sua assinatura e acompanhe os recursos do seu plano."}</p>
            </>
          )}
        </div>
        {sessionStatus !== "loading" && (isBasicPlan ? (
          <button type="button" className={styles.planAction} onClick={() => setIsUpgradeModalOpen(true)}>Conhecer o Profissional <ArrowUpRight size={18} aria-hidden="true" /></button>
        ) : (
          <button type="button" className={styles.planAction} onClick={handleManageSubscription} disabled={isPortalLoading}>{isPortalLoading ? "Abrindo..." : "Gerenciar assinatura"}{!isPortalLoading && <ExternalLink size={17} aria-hidden="true" />}</button>
        ))}
      </section>

      <div className={styles.sections}>
        <section className={styles.section} aria-labelledby="account-title">
          <div className={styles.sectionHeading}><span className={styles.headingIcon}><UserRound size={21} aria-hidden="true" /></span><div><h2 id="account-title">Dados da conta</h2><p>Informações usadas no seu perfil e na operação.</p></div></div>
          <div className={styles.panel}><ProfileForm profile={profile} mutateProfile={mutateProfile} /></div>
        </section>
        <section className={styles.section} aria-labelledby="security-title">
          <div className={styles.sectionHeading}><span className={styles.headingIcon}><ShieldCheck size={21} aria-hidden="true" /></span><div><h2 id="security-title">Segurança</h2><p>Atualize a senha para manter seu acesso protegido.</p></div></div>
          <div className={styles.panel}><PasswordForm /></div>
        </section>
      </div>
    </main>
  );
}
