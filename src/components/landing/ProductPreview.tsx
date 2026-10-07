"use client";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { ArrowUpRight, Check } from "lucide-react";
import styles from "./landing.module.css";
const previews = [
    { name: "Frota", title: "Frota sob controle", description: "Disponibilidade e manutenção em uma única visão.", headers: ["Veículo", "Placa", "Situação", "Km"], rows: [["Chevrolet Onix", "RJT-4A18", "Disponível", "28.450"], ["Hyundai HB20", "RJL-8C72", "Alugado", "34.120"], ["Fiat Argo", "RJP-2D96", "Manutenção", "41.800"]], footer: "24 veículos cadastrados" },
    { name: "Contratos", title: "Locações organizadas", description: "Cada contrato conectado ao veículo e ao pagamento.", headers: ["Contrato", "Veículo", "Situação", "Valor"], rows: [["#LOC-0248", "Chevrolet Onix", "Ativo", "R$ 1.890"], ["#LOC-0247", "Hyundai HB20", "Ativo", "R$ 2.150"], ["#LOC-0246", "Fiat Argo", "Pendente", "R$ 1.670"]], footer: "14 contratos ativos" },
    { name: "Financeiro", title: "O financeiro em foco", description: "Identifique o que entrou e o que falta receber.", headers: ["Lançamento", "Referência", "Situação", "Valor"], rows: [["Locação mensal", "#LOC-0248", "Recebido", "R$ 1.890"], ["Locação semanal", "#LOC-0247", "Pendente", "R$ 2.150"], ["Manutenção", "Fiat Argo", "Registrado", "R$ 680"]], footer: "Visão financeira da operação" },
];
export default function ProductPreview() {
    return (<section className={styles["feature-band"]} id="plataforma">
    <div className={styles["wrap"] + " " + styles["feature-layout"]}>
    <div className={styles["feature-copy"]}>
    <div className={styles["eyebrow"]}>Por dentro da SynCar</div>
    <h2 className={styles["section-title"]}>Decisões melhores começam com uma visão completa.</h2>
    <p className={styles["section-copy"]}>Acompanhe a rotina da locadora em um painel que reúne o que importa, da frota ao financeiro.</p>
    <div className={styles["feature-list"]}>
    <div>
    <span className={styles["check"]}>
    <Check size={14} aria-hidden="true"/>
    </span> Controle de veículos e manutenções</div>
    <div>
    <span className={styles["check"]}>
    <Check size={14} aria-hidden="true"/>
    </span> Contratos e pagamentos organizados</div>
    <div>
    <span className={styles["check"]}>
    <Check size={14} aria-hidden="true"/>
    </span> Relatórios para acompanhar o desempenho</div>
    </div>
    <a className={styles["text-link"]} href="#planos">Ver planos e recursos <span aria-hidden="true">
    <ArrowUpRight size={18} aria-hidden="true"/>
    </span>
    </a>
    </div>
    <TabGroup className={styles["app-showcase"]}>
 <div className={styles["show-head"]}>
    <span>Explore a plataforma</span>
    <small>Prévia ilustrativa</small>
    </div>
 <TabList className={styles["show-tabs"]} aria-label="Áreas da plataforma">{previews.map(item => <Tab key={item.name}>{item.name}</Tab>)}</TabList>
 <TabPanels>{previews.map(item => <TabPanel key={item.name} className={styles["show-content"]}>
 <h3>{item.title}</h3>
        <p>{item.description}</p>
 <div className={styles.tableScroll} tabIndex={0} role="region" aria-label={`Dados demonstrativos de ${item.name}`}>
 <table className={styles.demoTable}>
        <thead>
        <tr>{item.headers.map(header => <th key={header} scope="col">{header}</th>)}</tr>
        </thead>
 <tbody>{item.rows.map(row => <tr key={row[0]}>{row.map((cell, index) => <td key={index}>{index === 2 ? <span className={`${styles.pill} ${styles[["Disponível", "Recebido", "Ativo"].includes(cell) ? "green" : ["Pendente", "Manutenção"].includes(cell) ? "orange" : "gray"]}`}>{cell}</span> : cell}</td>)}</tr>)}</tbody>
        </table>
        </div>
 <div className={styles["show-foot"]}>
        <span>{item.footer}</span>
        <span>Dados demonstrativos</span>
        </div>
 </TabPanel>)}</TabPanels>
    </TabGroup>
    </div>
    </section>);
}
