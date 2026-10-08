import SkeletonCard from "@/components/ui/SkeletonCard";
import styles from "./profile.module.css";

const FormSkeleton = () => (
  <div className="space-y-5">
    <div className="space-y-2">
      <SkeletonCard className="h-4 w-24" />
      <SkeletonCard className="h-11 w-full" />
    </div>
    <div className="space-y-2">
      <SkeletonCard className="h-4 w-20" />
      <SkeletonCard className="h-11 w-full" />
    </div>
    <div className="space-y-2">
      <SkeletonCard className="h-4 w-32" />
      <SkeletonCard className="h-11 w-full" />
    </div>
    <SkeletonCard className="h-11 w-40" />
  </div>
);

export default function ProfileSkeleton() {
  return (
    <div className={styles.page} aria-label="Carregando perfil">
      <header className={styles.intro}><div><span className={styles.eyebrow}>Conta e acesso</span><h1>Meu perfil</h1><p>Gerencie os dados da conta, sua assinatura e a segurança do acesso.</p></div></header>
      <div className={styles.subscription}><SkeletonCard className="h-14 w-14 rounded-xl" /><div className={styles.planCopy}><SkeletonCard className="h-4 w-28 mb-3" /><SkeletonCard className="h-7 w-40" /></div></div>
      <div className={styles.sections}>
        <section className={styles.section}><div className={styles.sectionHeading}><span className={styles.headingIcon}><SkeletonCard className="h-5 w-5" /></span><div><SkeletonCard className="h-5 w-36 mb-2" /><SkeletonCard className="h-4 w-52" /></div></div><div className={styles.panel}><div className={styles.form}><FormSkeleton /></div></div></section>
        <section className={styles.section}><div className={styles.sectionHeading}><span className={styles.headingIcon}><SkeletonCard className="h-5 w-5" /></span><div><SkeletonCard className="h-5 w-28 mb-2" /><SkeletonCard className="h-4 w-52" /></div></div><div className={styles.panel}><div className={styles.form}><FormSkeleton /></div></div></section>
      </div>
    </div>
  );
}
