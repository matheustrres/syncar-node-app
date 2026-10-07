import { ArrowUpRight, FileText, Wallet } from "lucide-react";
import styles from "./landing.module.css";
export default function BenefitsSection() {
    return (<section className={styles["intro"] + " " + styles["wrap"]} id="beneficios">
    <div className={styles["intro-top"]}>
    <div>
    <div className={styles["eyebrow"]} style={{ color: "#498269" }}>O que muda no dia a dia</div>
    <h2 className={styles["section-title"]}>Sua operação, sem pontos cegos.</h2>
    </div>
    <p className={styles["section-copy"]}>Da disponibilidade de um carro ao dinheiro que ainda falta entrar: encontre as respostas sem cruzar abas e planilhas.</p>
    </div>
    <div className={styles["problem-grid"]}>
    <article className={styles["problem-card"]}>
    <span className={styles["num"]}>01 / FROTA</span>
    <div className={styles["icon"]} aria-hidden="true">
    <ArrowUpRight size={18} aria-hidden="true"/>
    </div>
    <h3>Saiba o que pode alugar</h3>
    <p>Acompanhe veículos disponíveis, alugados e em manutenção em uma visão simples.</p>
    </article>
    <article className={styles["problem-card"]}>
    <span className={styles["num"]}>02 / CONTRATOS</span>
    <div className={styles["icon"]} aria-hidden="true">
    <FileText size={22} aria-hidden="true"/>
    </div>
    <h3>Conecte cada locação</h3>
    <p>Organize contratos, motoristas e pagamentos ligados a cada veículo.</p>
    </article>
    <article className={styles["problem-card"]}>
    <span className={styles["num"]}>03 / FINANCEIRO</span>
    <div className={styles["icon"]} aria-hidden="true">
    <Wallet size={22} aria-hidden="true"/>
    </div>
    <h3>Enxergue o resultado</h3>
    <p>Veja receitas, despesas e valores pendentes antes que virem uma surpresa.</p>
    </article>
    </div>
    </section>);
}
