"use client";

import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Car,
  Mail,
  Lock,
  User,
  Phone,
  Building,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
  ArrowUpRight,
  Check,
  Circle,
} from "lucide-react";
import Modal from "../ui/Modal";
import Link from "next/link";
import styles from "./auth.module.css";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { IMaskInput } from "react-imask";

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  companyName?: string;
  api?: string;
};

const AuthForm = ({ initialMode = "login" }: { initialMode?: "login" | "register" }) => {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    companyName: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasLowerCase: false,
    hasUpperCase: false,
    hasNumber: false,
    hasTwoSpecialChars: false,
  });
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);

  const validatePassword = (password: string) => {
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    return {
      minLength: password.length >= 9,
      hasLowerCase: /[a-z]/.test(password),
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasTwoSpecialChars:
        (password.match(new RegExp(specialCharRegex.source, "g")) || [])
          .length >= 2,
    };
  };

  const isPasswordValid = (strength: typeof passwordStrength) => {
    return Object.values(strength).every((value) => value === true);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!isLogin && !formData.name.trim())
      newErrors.name = "Nome é obrigatório";
    if (!isLogin && !formData.companyName.trim())
      newErrors.companyName = "Nome da empresa é obrigatório";
    if (!formData.email.trim()) newErrors.email = "Email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email inválido";
    if (!isLogin && formData.phone.length < 11)
      newErrors.phone = "Telefone inválido";
    if (!formData.password) newErrors.password = "Senha é obrigatória";
    else if (!isLogin && !isPasswordValid(passwordStrength))
      newErrors.password = "A senha não atende aos requisitos";
    if (!isLogin && formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "As senhas não coincidem";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { name: string; value: string }
  ) => {
    const { name, value } = "target" in e ? e.target : e;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "password") {
      setPasswordStrength(validatePassword(value));
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLogin && formData.confirmPassword && formData.password !== formData.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "As senhas não coincidem",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.password, formData.confirmPassword, isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});
    if (isLogin) {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });
      if (result?.error) {
        setErrors({ api: "Email ou senha inválidos." });
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } else {
      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          setShowSuccessModal(true);
          updateSession(); // Update session after successful registration
        } else {
          const errorData = await response.json();
          setErrors({ api: errorData.error || "Erro no cadastro." });
        }
      } catch {
        setErrors({ api: "Ocorreu um erro de conexão." });
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setShowPassword(false);
    setPasswordStrength(validatePassword(""));
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      companyName: "",
    });
    setErrors({});
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    toggleMode();
  };

  const fields = [
    ...(!isLogin ? [
      { name: "name" as const, label: "Nome completo", type: "text", autocomplete: "name", placeholder: "Seu nome completo", Icon: User },
      { name: "companyName" as const, label: "Nome da empresa", type: "text", autocomplete: "organization", placeholder: "Nome da sua empresa", Icon: Building },
    ] : []),
    { name: "email" as const, label: "Email", type: "email", autocomplete: "email", placeholder: "seu@email.com", Icon: Mail },
    ...(!isLogin ? [{ name: "phone" as const, label: "Telefone", type: "tel", autocomplete: "tel", placeholder: "(00) 00000-0000", Icon: Phone }] : []),
    { name: "password" as const, label: "Senha", type: showPassword ? "text" : "password", autocomplete: isLogin ? "current-password" : "new-password", placeholder: "Digite sua senha", Icon: Lock },
    ...(!isLogin ? [{ name: "confirmPassword" as const, label: "Confirmar senha", type: showPassword ? "text" : "password", autocomplete: "new-password", placeholder: "Repita sua senha", Icon: Lock }] : []),
  ];
  const requirements = [
    ["minLength", "9 caracteres ou mais"],
    ["hasTwoSpecialChars", "2 caracteres especiais"],
    ["hasLowerCase", "1 letra minúscula"],
    ["hasUpperCase", "1 letra maiúscula"],
    ["hasNumber", "1 número"],
  ] as const;

  return (
    <main className={styles.page}>
      <aside className={styles.brandPanel}>
        <Link href="/" className={styles.logo} aria-label="SynCar — página inicial">
          <span><Car size={24} aria-hidden="true" /></span>syncar.
        </Link>
        <div className={styles.brandContent}>
          <h2>Sua operação,<br />com tudo <em>no lugar.</em></h2>
          <p>Veículos, motoristas, contratos e financeiro conectados para acompanhar sua locadora.</p>
          <ul>
            <li><Check size={18} aria-hidden="true" /> Controle da frota e das manutenções</li>
            <li><Check size={18} aria-hidden="true" /> Contratos e pagamentos organizados</li>
            <li><Check size={18} aria-hidden="true" /> Clareza sobre receitas e despesas</li>
          </ul>
        </div>
        <p className={styles.brandFoot}>Da frota ao resultado. Uma visão completa.</p>
      </aside>
      <section className={styles.formPanel} aria-labelledby="auth-title">
        <Link href="/" className={styles.backLink}><ArrowLeft size={16} aria-hidden="true" /> Voltar ao início</Link>
        <div className={styles.formContent}>
          <header className={styles.heading}>
            <h1 id="auth-title">{isLogin ? "Bem-vindo de volta." : "Crie sua conta"}</h1>
            <p>{isLogin ? "Entre para acompanhar sua operação." : "Comece a organizar sua locadora em um só lugar."}</p>
          </header>
          <form onSubmit={handleSubmit} noValidate className={styles.form} aria-busy={loading}>
            <div className={`${styles.fields} ${!isLogin ? styles.registerFields : ""}`}>
              {fields.map(({name, label, type, autocomplete, placeholder, Icon}) => (
                <div className={styles.field} key={name}>
                  <label htmlFor={`auth-${name}`}>{label}</label>
                  <div className={styles.inputWrap}>
                    <Icon size={18} aria-hidden="true" />
                    {name === "phone" ? (
                      <IMaskInput id={`auth-${name}`} name={name} type="tel" autoComplete={autocomplete} mask="(00) 00000-0000" value={formData.phone} onAccept={(value: string) => handleChange({ name: "phone", value })} placeholder={placeholder} required aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `error-${name}` : undefined} />
                    ) : (
                      <input id={`auth-${name}`} name={name} type={type} autoComplete={autocomplete} value={formData[name]} onChange={handleChange} placeholder={placeholder} required aria-invalid={Boolean(errors[name])} aria-describedby={[errors[name] ? `error-${name}` : "", name === "password" && !isLogin ? "password-requirements" : ""].filter(Boolean).join(" ") || undefined} />
                    )}
                    {name === "password" && <button type="button" className={styles.reveal} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
                  </div>
                  {errors[name] && <p id={`error-${name}`} className={styles.error}>{errors[name]}</p>}
                </div>
              ))}
            </div>
            {!isLogin && <div id="password-requirements" className={styles.requirements}>
              <p>Sua senha precisa ter:</p>
              <ul>{requirements.map(([key, label]) => <li key={key} className={passwordStrength[key] ? styles.fulfilled : ""}>{passwordStrength[key] ? <Check size={14} aria-hidden="true" /> : <Circle size={10} aria-hidden="true" />}<span>{label}</span><span className="sr-only">{passwordStrength[key] ? ": atendido" : ": pendente"}</span></li>)}</ul>
            </div>}
            {isLogin && <button type="button" className={styles.forgot} onClick={() => setIsForgotPasswordModalOpen(true)}>Esqueceu a senha?</button>}
            {errors.api && <p role="alert" className={styles.error}>{errors.api}</p>}
            <button type="submit" disabled={loading} className={styles.submit}>
              {loading ? "Aguarde…" : isLogin ? "Entrar na plataforma" : "Criar conta"}
              {!loading && <ArrowUpRight size={18} aria-hidden="true" />}
            </button>
          </form>
          <p className={styles.switchMode}>{isLogin ? "Ainda não tem uma conta?" : "Já tem uma conta?"} <button type="button" onClick={toggleMode} disabled={loading}>{isLogin ? "Começar grátis" : "Faça login"}</button></p>
          {!isLogin && <p className={styles.freeNote}>Plano gratuito para até 3 veículos e 3 motoristas.</p>}
        </div>
        <p className={styles.formFoot}>© {new Date().getFullYear()} SynCar</p>
      </section>
      <Modal isOpen={showSuccessModal} onClose={handleCloseSuccessModal} title="Conta criada" size="md">
        <div className={styles.success}>
          <CheckCircle size={48} aria-hidden="true" />
          <p>Sua conta foi criada com sucesso. Faça login para continuar.</p>
          <button onClick={handleCloseSuccessModal} className={styles.submit}>Ir para login <ArrowUpRight size={18} /></button>
        </div>
      </Modal>
      <Modal isOpen={isForgotPasswordModalOpen} onClose={() => setIsForgotPasswordModalOpen(false)} title="Recuperar senha" size="md">
        <ForgotPasswordForm className={styles.recovery} onClose={() => setIsForgotPasswordModalOpen(false)} />
      </Modal>
    </main>
  );
};

export default AuthForm;
