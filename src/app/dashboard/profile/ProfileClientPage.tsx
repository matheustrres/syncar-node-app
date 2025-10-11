"use client";

import { useSession } from "next-auth/react";
import { useState, FormEvent, useEffect } from "react";
import { User as UserType } from "@/types";
import { useFetchProfile } from "@/hooks/useData";
import { User, Mail, Lock, Building } from "lucide-react";
import ProfileSkeleton from "./ProfileSkeleton";

const ProfileForm = ({
  profile,
  mutateProfile,
}: {
  profile: UserType;
  mutateProfile: () => void;
}) => {
  const { update: updateSession } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        companyName: profile.companyName || "",
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("Salvando...");
    setError("");
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setIsSubmitting(false);
    if (res.ok) {
      await updateSession({ name: formData.name, email: formData.email });
      mutateProfile();
      setMessage("Perfil atualizado com sucesso!");
    } else {
      const data = await res.json();
      setError(data.error || "Ocorreu um erro ao atualizar.");
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome completo *
        </label>
        <User className="absolute left-3 top-9 text-gray-400 z-10" size={20} />
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="pl-11 pr-4 py-2 w-full border border-gray-200 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
        />
      </div>
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <Mail className="absolute left-3 top-9 text-gray-400 z-10" size={20} />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="pl-11 pr-4 py-2 w-full border border-gray-200 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
        />
      </div>
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome da empresa *
        </label>
        <Building
          className="absolute left-3 top-9 text-gray-400 z-10"
          size={20}
        />
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          required
          className="pl-11 pr-4 py-2 w-full border border-gray-200 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Salvando..." : "Salvar alterações"}
        </button>
        {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>
    </form>
  );
};

const PasswordForm = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
    setMessage("Alterando senha...");
    const res = await fetch("/api/profile/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      }),
    });

    setIsSubmitting(false);

    if (res.ok) {
      setMessage("Senha alterada com sucesso!");
      setError("");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } else {
      const data = await res.json();
      setError(data.error || "Ocorreu um erro ao alterar a senha.");
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Senha atual *
        </label>
        <Lock className="absolute left-3 top-9 text-gray-400 z-10" size={20} />
        <input
          type="password"
          name="currentPassword"
          value={passwords.currentPassword}
          onChange={handleChange}
          required
          className="pl-11 pr-4 py-2 w-full border border-gray-200 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
        />
      </div>
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nova senha *
        </label>
        <Lock className="absolute left-3 top-9 text-gray-400 z-10" size={20} />
        <input
          type="password"
          name="newPassword"
          value={passwords.newPassword}
          onChange={handleChange}
          required
          className="pl-11 pr-4 py-2 w-full border border-gray-200 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
        />
      </div>
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirmar nova senha *
        </label>
        <Lock className="absolute left-3 top-9 text-gray-400 z-10" size={20} />
        <input
          type="password"
          name="confirmNewPassword"
          value={passwords.confirmNewPassword}
          onChange={handleChange}
          required
          className="pl-11 pr-4 py-2 w-full border border-gray-200 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Alterando..." : "Alterar senha"}
        </button>
        {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>
    </form>
  );
};

export default function ProfileClientPage({
  initialProfile,
}: {
  initialProfile: UserType | null;
}) {
  const { profile, isError, mutateProfile } = useFetchProfile(initialProfile);

  if (!profile && !isError) return <ProfileSkeleton />;
  if (isError || !profile) {
    return (
      <div className="text-center text-red-500">Erro ao carregar o perfil.</div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Meu Perfil</h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-700 border-b border-gray-200 pb-4 mb-6">
          Informações do perfil
        </h3>
        <ProfileForm profile={profile} mutateProfile={mutateProfile} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-700 border-b border-gray-200 pb-4 mb-6">
          Alterar senha
        </h3>
        <PasswordForm />
      </div>
    </div>
  );
}
