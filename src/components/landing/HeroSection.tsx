import { ArrowUpRight, ArrowRight, FileText, Wallet, LayoutDashboard, CarFront, BarChart3, Check } from "lucide-react";
import styles from "./landing.module.css";
export default function HeroSection() {
    return (<section className={styles["hero"]}>
    <div className={styles["wrap"] + " " + styles["hero-inner"]}>
      <div className={styles["hero-copy"]}>
    <div className={styles["eyebrow"]}>Gestão feita para locadoras</div>
    <h1>Menos planilhas.<br />Mais frota <em>em movimento.</em>
    </h1>
    <p className={styles["hero-lead"]}>Veículos, contratos e financeiro conversando entre si. Tenha uma visão clara da operação e saiba o que precisa da sua atenção hoje.</p>
    <div className={styles["hero-actions"]}>
    <a className={styles["btn-primary"]} href="/login?mode=register">Organizar minha locadora <span aria-hidden="true">
    <ArrowUpRight size={18} aria-hidden="true"/>
    </span>
    </a>
    <a className={styles["text-link"]} href="#plataforma">Explorar a plataforma <span aria-hidden="true">
    <ArrowRight size={18} aria-hidden="true"/>
    </span>
    </a>
    </div>
    <div className={styles["hero-note"]}>
    <span>
    <Check size={14} aria-hidden="true"/>
    </span> Plano gratuito para até 3 veículos e 3 motoristas</div>
    </div>
      <div className={styles["visual-stage"]} aria-label="Prévia ilustrativa do painel da SynCar">
    <div className={styles["dashboard"]}>
    <div className={styles["dash-top"]}>
    <div className={styles["dots"]}>
    <i>
    </i>
    <i>
    </i>
    <i>
    </i>
    </div>
    <strong>syncar<span style={{ color: "#75a64b" }}>.</span>
    </strong>
    <span>VISÃO GERAL &nbsp; · &nbsp; DADOS DEMONSTRATIVOS</span>
    </div>
    <div className={styles["dash-body"]}>
    <div className={styles["dash-side"]}>
    <div className={styles["selected"]}>
    <LayoutDashboard size={12} aria-hidden="true"/> &nbsp; Visão geral</div>
    <div>
    <CarFront size={12} aria-hidden="true"/> &nbsp; Veículos</div>
    <div>
    <FileText size={22} aria-hidden="true"/> &nbsp; Contratos</div>
    <div>
    <Wallet size={22} aria-hidden="true"/> &nbsp; Financeiro</div>
    <div>
    <BarChart3 size={12} aria-hidden="true"/> &nbsp; Relatórios</div>
    </div>
    <div className={styles["dash-main"]}>
    <div className={styles["dash-greeting"]}>Bom dia, equipe </div>
    <h3>Visão da operação</h3>
    <div className={styles["kpi-grid"]}>
    <div className={styles["kpi"]}>
    <small>Frota disponível</small>
    <strong>08 <b>veículos</b>
    </strong>
    </div>
    <div className={styles["kpi"]}>
    <small>Contratos ativos</small>
    <strong>14 <b>em andamento</b>
    </strong>
    </div>
    <div className={styles["kpi"]}>
    <small>Receita do mês</small>
    <strong>R$ 42.800</strong>
    </div>
    </div>
    <div className={styles["dash-bottom"]}>
    <div className={styles["dash-card"]}>
    <h4>Receita ao longo do mês</h4>
    <div className={styles["bars"]}>
    <i>
    </i>
    <i>
    </i>
    <i>
    </i>
    <i>
    </i>
    <i>
    </i>
    <i>
    </i>
    </div>
    </div>
    <div className={styles["dash-card"]}>
    <h4>Situação da frota</h4>
    <div className={styles["fleet-row"]}>
    <span>● Alugados</span>
    <strong>14</strong>
    </div>
    <div className={styles["fleet-row"]}>
    <span>● Disponíveis</span>
    <strong>08</strong>
    </div>
    <div className={styles["fleet-row"]}>
    <span>● Manutenção</span>
    <strong>02</strong>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    <div className={styles["floating-card"]}>
    <small>
    <ArrowUpRight size={18} aria-hidden="true"/> &nbsp; Tudo em uma visão</small>
    <strong>24 veículos</strong>
    <span>Do cadastro ao resultado.</span>
    </div>
    </div>
    </div>
    <p className={styles["illustration-note"]}>Prévia ilustrativa · Dados demonstrativos</p>
    </section>);
}
