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
  LogIn,
  UserPlus,
  CheckCircle,
} from "lucide-react";
import Modal from "../ui/Modal";
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

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
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
      if (formData.password !== formData.confirmPassword) {
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
  }, [formData.password, formData.confirmPassword]);

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
          setErrors({ api: errorData.message || "Erro no cadastro." });
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

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-blue-600 p-12 text-white flex-col justify-center hidden lg:flex">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Car size={48} />
                <h1 className="text-4xl font-bold">Syncar</h1>
              </div>
              <p className="text-blue-100 text-lg">
                Sistema completo de gestão de frota
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500 p-3 rounded-lg">
                  <Car size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    Gestão de Veículos
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Controle total da sua frota
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-blue-500 p-3 rounded-lg">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    Controle de Motoristas
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Gerencie documentação e histórico
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-blue-500 p-3 rounded-lg">
                  <Building size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    Financeiro Completo
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Acompanhe pagamentos e despesas
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-12 flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}
              </h2>
              <p className="text-gray-600">
                {isLogin
                  ? "Entre para gerenciar sua frota"
                  : "Comece a gerenciar sua frota hoje"}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NomecCompleto *
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full pl-11 pr-4 py-3 border rounded-lg ${
                          errors.name ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Empresa *
                    </label>
                    <div className="relative">
                      <Building
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className={`w-full pl-11 pr-4 py-3 border rounded-lg ${
                          errors.companyName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Nome da sua empresa"
                      />
                    </div>
                    {errors.companyName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.companyName}
                      </p>
                    )}
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="seu@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <IMaskInput
                      mask="(00) 00000-0000"
                      name="phone"
                      value={formData.phone}
                      onAccept={(value: string) =>
                        handleChange({ name: "phone", value })
                      }
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha *
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-11 py-3 border rounded-lg ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
              {!isLogin && (
                <div className="mt-2 text-sm">
                  <p
                    className={
                      passwordStrength.minLength
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    Pelo menos 9 caracteres
                  </p>
                  <p
                    className={
                      passwordStrength.hasTwoSpecialChars
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    Pelo menos 2 caracteres especiais
                  </p>
                  <p
                    className={
                      passwordStrength.hasLowerCase
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    Pelo menos 1 letra minúscula
                  </p>
                  <p
                    className={
                      passwordStrength.hasUpperCase
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    Pelo menos 1 letra maiúscula
                  </p>
                  <p
                    className={
                      passwordStrength.hasNumber
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    Pelo menos 1 número
                  </p>
                </div>
              )}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onPaste={(e) => e.preventDefault()}
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}
              {isLogin && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordModalOpen(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
              )}
              {errors.api && (
                <p className="text-red-500 text-sm text-center">{errors.api}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-6 h-6 border-t-2 border-r-2 border-white rounded-full animate-spin" />
                ) : (
                  <>
                    {" "}
                    {isLogin ? (
                      <LogIn size={20} />
                    ) : (
                      <UserPlus size={20} />
                    )}{" "}
                    {isLogin ? "Entrar" : "Criar Conta"}{" "}
                  </>
                )}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
                <button
                  onClick={toggleMode}
                  className="ml-2 text-blue-600 hover:text-blue-700 font-semibold"
                >
                  {isLogin ? "Cadastre-se" : "Faça login"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        title="Sucesso!"
        size="md"
      >
        <div className="text-center p-4">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
            Cadastro Realizado!
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              Sua conta foi criada com sucesso. Por favor, faça o login para
              continuar.
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={handleCloseSuccessModal}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Ir para Login
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
        title="Recuperar Senha"
        size="md"
      >
        <ForgotPasswordForm
          onClose={() => setIsForgotPasswordModalOpen(false)}
        />
      </Modal>
    </>
  );
};

export default AuthForm;
