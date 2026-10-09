"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import styles from "@/components/forms/auth.module.css";

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const { showToast } = useToast();
  const router = useRouter();

  const validatePassword = (pwd: string) => {
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const strength = {
      minLength: pwd.length >= 9,
      hasLowerCase: /[a-z]/.test(pwd),
      hasUpperCase: /[A-Z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
      hasTwoSpecialChars:
        (pwd.match(new RegExp(specialCharRegex.source, "g")) || []).length >= 2,
    };
    return strength;
  };

  const isPasswordValid = (strength: ReturnType<typeof validatePassword>) => {
    return Object.values(strength).every((value) => value === true);
  };

  const passwordStrength = validatePassword(password);
  const passwordIsValid = isPasswordValid(passwordStrength);
  const confirmationMismatch = Boolean(confirmPassword) && password !== confirmPassword;
  const canSubmit = passwordIsValid && Boolean(confirmPassword) && !confirmationMismatch && !loading;

  const updatePassword = (value: string) => {
    setPassword(value);
    setErrors((current) => ({
      ...current,
      password: value && !isPasswordValid(validatePassword(value))
        ? "A senha não atende aos requisitos"
        : undefined,
      confirmPassword: confirmPassword && value !== confirmPassword
        ? "As senhas não coincidem"
        : undefined,
    }));
  };

  const updateConfirmPassword = (value: string) => {
    setConfirmPassword(value);
    setErrors((current) => ({
      ...current,
      confirmPassword: value && password !== value
        ? "As senhas não coincidem"
        : undefined,
    }));
  };

  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};
    const strength = validatePassword(password);
    if (!password) {
      newErrors.password = "Senha é obrigatória";
    } else if (!isPasswordValid(strength)) {
      newErrors.password = "A senha não atende aos requisitos";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirmação de senha é obrigatória";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao redefinir senha.");
      }

      showToast("Senha redefinida com sucesso!", "success");
      router.push("/login?reset=success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Ocorreu um erro inesperado.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${styles.recovery} ${styles.form}`}>
      <div className={styles.field}>
        <label htmlFor="reset-password" className="block text-sm font-medium mb-2">
          Nova Senha *
        </label>
        <div className={styles.inputWrap}>
          <Lock size={18} aria-hidden="true" />
          <input
            id="reset-password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={(e) => updatePassword(e.target.value)}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby="password-requirements password-error"
            placeholder="Crie uma senha forte"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.reveal}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className={styles.error}>{errors.password}</p>
        )}
        <div id="password-requirements" className={styles.requirements} aria-label="Requisitos da senha">
          <p>Sua senha precisa conter:</p>
          <ul>
            <li className={passwordStrength.minLength ? styles.fulfilled : undefined}>Pelo menos 9 caracteres</li>
            <li className={passwordStrength.hasTwoSpecialChars ? styles.fulfilled : undefined}>Pelo menos 2 caracteres especiais</li>
            <li className={passwordStrength.hasLowerCase ? styles.fulfilled : undefined}>Pelo menos 1 letra minúscula</li>
            <li className={passwordStrength.hasUpperCase ? styles.fulfilled : undefined}>Pelo menos 1 letra maiúscula</li>
            <li className={passwordStrength.hasNumber ? styles.fulfilled : undefined}>Pelo menos 1 número</li>
          </ul>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="reset-password-confirm" className="block text-sm font-medium mb-2">
          Confirmar Nova Senha *
        </label>
        <div className={styles.inputWrap}>
          <Lock size={18} aria-hidden="true" />
          <input
            id="reset-password-confirm"
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => updateConfirmPassword(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword || confirmationMismatch ? "confirm-password-error" : undefined}
            placeholder="Repita sua nova senha"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.reveal}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {(errors.confirmPassword || confirmationMismatch) && (
          <p id="confirm-password-error" className={styles.error}>As senhas não coincidem</p>
        )}
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className={styles.submit}
      >
        {loading ? (
          <><Loader2 className="animate-spin" size={18} aria-hidden="true" /> Redefinindo senha...</>
        ) : (
          <>Redefinir senha <span aria-hidden="true">→</span></>
        )}
      </button>
    </form>
  );
}
