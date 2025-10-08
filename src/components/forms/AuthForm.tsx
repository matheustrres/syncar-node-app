"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
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
} from "lucide-react";

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
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    phone?: string;
    companyName?: string;
    api?: string;
  }>({});
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasLowerCase: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const router = useRouter();

  const validatePassword = (password: string) => {
    return {
      minLength: password.length >= 8,
      hasLowerCase: /[a-z]/.test(password),
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  const isPasswordValid = (strength: typeof passwordStrength) => {
    return Object.values(strength).every((value) => value === true);
  };

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      phone?: string;
      companyName?: string;
    } = {};

    if (!isLogin && !formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }
    if (!isLogin && !formData.companyName.trim()) {
      newErrors.companyName = "Nome da empresa é obrigatório";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (!isLogin && !isPasswordValid(passwordStrength)) {
      newErrors.password = "A senha não atende a todos os requisitos";
    }
    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      setPasswordStrength(validatePassword(value));
    }

    if (errors.name) {
      setErrors((prev: unknown) => ({
        ...(prev as Record<string, unknown>),
        [name]: "",
      }));
    }
  };

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
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            companyName: formData.companyName,
            phone: formData.phone,
          }),
        });
        if (response.ok) {
          alert("Cadastro realizado com sucesso! Faça o login.");
          toggleMode();
        } else {
          const errorData = await response.json();
          setErrors({
            api: errorData.message || "Erro no cadastro. Verifique os dados.",
          });
        }
      } catch {
        setErrors({ api: "Ocorreu um erro de conexão. Tente novamente." });
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-12 text-white flex-col justify-center hidden lg:flex">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Car size={48} className="text-white" />
              <h1 className="text-4xl font-bold">Syncar</h1>
            </div>
            <p className="text-blue-100 text-lg">
              Sistema completo de gestão de frota para aluguel de veículos
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
                  Controle total da sua frota com informações detalhadas
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
                  Gerencie documentação e histórico de cada motorista
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
                  Acompanhe pagamentos, despesas e lucro em tempo real
                </p>
              </div>
            </div>
          </div>
          <div className="mt-12 p-6 bg-blue-700 bg-opacity-50 rounded-lg">
            <p className="text-sm text-blue-100">
              &ldquo;Transformei meu negócio com o Syncar. Agora tenho
              controle total sobre meus veículos e pagamentos!&rdquo;
            </p>
            <p className="text-sm font-semibold mt-2">
              — Carlos Silva, Empresário
            </p>
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
                : "Comece a gerenciar sua frota hoje mesmo"}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? "border-red-500" : "border-gray-300"}`}
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
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.companyName ? "border-red-500" : "border-gray-300"}`}
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
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? "border-red-500" : "border-gray-300"}`}
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
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha *
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-11 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? "border-red-500" : "border-gray-300"}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
              {!isLogin && formData.password && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Requisitos da senha:
                  </p>
                  {/* Password strength indicators... */}
                </div>
              )}
            </div>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
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
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                  {isLogin ? "Entrar" : "Criar Conta"}
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
          {!isLogin && (
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Ao criar uma conta, você concorda com nossos Termos de Serviço e
                Política de Privacidade
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
