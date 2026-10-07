import styles from "./landing.module.css";
export default function HowItWorks() {
    return (<section className={styles["steps"] + " " + styles["wrap"]} id="como-funciona">
    <div className={styles["steps-head"]}>
    <div className={styles["eyebrow"]} style={{ color: "#498269" }}>Simples de começar</div>
    <h2 className={styles["section-title"]}>Organize hoje. Cresça com clareza.</h2>
    <p className={styles["section-copy"]}>Uma maneira direta de sair das informações espalhadas e ganhar uma visão da operação.</p>
    </div>
    <div className={styles["steps-grid"]}>
    <article className={styles["step"]}>
    <span className={styles["step-number"]}>01</span>
    <h3>Cadastre sua frota</h3>
    <p>Reúna veículos e motoristas em um só lugar para começar com uma base organizada.</p>
    </article>
    <article className={styles["step"]}>
    <span className={styles["step-number"]}>02</span>
    <h3>Registre as locações</h3>
    <p>Acompanhe contratos, pagamentos e a situação de cada veículo.</p>
    </article>
    <article className={styles["step"]}>
    <span className={styles["step-number"]}>03</span>
    <h3>Acompanhe o negócio</h3>
    <p>Consulte pendências e relatórios para decidir o próximo passo com mais segurança.</p>
    </article>
    </div>
    </section>);
}
