import Link from "next/link";
import { ArrowUpRight, CalendarDays, CarFront, CircleAlert, Wallet, Wrench, FileText } from "lucide-react";
import { getDashboardData } from "@/lib/data-access";
import DashboardActions from "./DashboardActions";
import PaymentsPreview from "./PaymentsPreview";
import styles from "./dashboard.module.css";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function DashboardPage() {
  const { stats, pendingPayments } = await getDashboardData();
  const otherVehicles = Math.max(0, stats.totalVehicles - stats.availableVehiclesCount - stats.rentedVehiclesCount);
  const occupancy = stats.totalVehicles > 0 ? Math.round((stats.rentedVehiclesCount / stats.totalVehicles) * 100) : null;
  const outsideRental = stats.totalVehicles - stats.rentedVehiclesCount;

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <div>
          <span className={styles.eyebrow}>Painel da operação</span>
          <h1>Visão geral</h1>
          <p>Acompanhe a frota, as cobranças e o resultado em um só lugar.</p>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.period}><CalendarDays size={17} aria-hidden="true" /> Acumulado</span>
          <DashboardActions stats={stats} />
        </div>
      </header>

      <section className={styles.overview} aria-labelledby="indicators-title">
        <div className={styles.overviewHeader}>
          <h2 id="indicators-title">Indicadores principais</h2>
          <span>Dados atuais da sua conta</span>
        </div>
        <div className={styles.metricGrid}>
          <div className={styles.metric}>
            <div className={styles.metricTop}><span>Veículos alugados</span><span className={styles.metricIcon}><ArrowUpRight size={17} aria-hidden="true" /></span></div>
            <strong>{stats.rentedVehiclesCount}<small>/{stats.totalVehicles}</small></strong>
            <span className={styles.metricNote}>{occupancy === null ? "Cadastre veículos para acompanhar a ocupação" : `${occupancy}% de ocupação da frota`}</span>
          </div>
          <div className={styles.metric}>
            <div className={styles.metricTop}><span>Disponíveis para locação</span><span className={styles.metricIcon}><CarFront size={17} aria-hidden="true" /></span></div>
            <strong>{stats.availableVehiclesCount}</strong>
            <span className={styles.metricNote}>{otherVehicles} {otherVehicles === 1 ? "veículo em outra situação" : "veículos em outras situações"}</span>
          </div>
          <div className={styles.metric}>
            <div className={styles.metricTop}><span>Cobranças em atraso</span><span className={`${styles.metricIcon} ${stats.overduePaymentsCount > 0 ? styles.dangerIcon : ""}`}><CircleAlert size={17} aria-hidden="true" /></span></div>
            <strong className={stats.overduePaymentsCount > 0 ? styles.dangerValue : undefined}>{stats.overduePaymentsCount}</strong>
            <span className={styles.metricNote}>{stats.overduePaymentsCount > 0 ? "Requerem acompanhamento" : "Nenhuma cobrança em atraso"}</span>
          </div>
          <div className={styles.metric}>
            <div className={styles.metricTop}><span>Resultado acumulado</span><span className={styles.metricIcon}><Wallet size={17} aria-hidden="true" /></span></div>
            <strong className={`${styles.moneyValue} ${stats.netProfit < 0 ? styles.dangerValue : ""}`}>{currency.format(stats.netProfit)}</strong>
            <span className={styles.metricNote}>Recebido menos despesas registradas</span>
          </div>
        </div>
      </section>

      <div className={styles.detailGrid}>
        <div className={styles.workColumn}>
          <section className={styles.panel} aria-labelledby="attention-title">
            <div className={styles.panelHeader}><div><h2 id="attention-title">O que precisa de atenção</h2><p>Uma fila de trabalho a partir dos dados da operação.</p></div></div>
            <ul className={styles.attentionList}>
              <li>
                <span className={`${styles.attentionIcon} ${styles.attentionDanger}`}><CircleAlert size={20} aria-hidden="true" /></span>
                <div><h3>Cobranças vencidas</h3><p>{stats.overduePaymentsCount > 0 ? "Revise os recebimentos e priorize os vencimentos mais antigos." : "Nenhum pagamento vencido no momento."}</p></div>
                <Link className={`${styles.rowLink} ${stats.overduePaymentsCount > 0 ? styles.dangerLink : ""}`} href="/dashboard/financial">{stats.overduePaymentsCount} {stats.overduePaymentsCount === 1 ? "pendência" : "pendências"}<ArrowUpRight size={15} aria-hidden="true" /></Link>
              </li>
              <li>
                <span className={`${styles.attentionIcon} ${styles.attentionWarning}`}><CarFront size={20} aria-hidden="true" /></span>
                <div><h3>Veículos fora de locação</h3><p>Confira a situação dos veículos que não estão alugados.</p></div>
                <Link className={styles.rowLink} href="/dashboard/vehicles">{outsideRental} {outsideRental === 1 ? "veículo" : "veículos"}<ArrowUpRight size={15} aria-hidden="true" /></Link>
              </li>
              <li>
                <span className={`${styles.attentionIcon} ${styles.attentionSuccess}`}><ArrowUpRight size={20} aria-hidden="true" /></span>
                <div><h3>Frota disponível</h3><p>{stats.availableVehiclesCount > 0 ? "Há veículos prontos para as próximas locações." : "Nenhum veículo disponível para locação no momento."}</p></div>
                <Link className={styles.rowLink} href="/dashboard/vehicles">{stats.availableVehiclesCount} {stats.availableVehiclesCount === 1 ? "veículo" : "veículos"}<ArrowUpRight size={15} aria-hidden="true" /></Link>
              </li>
            </ul>
          </section>

          <section className={styles.panel} aria-labelledby="payments-title">
            <div className={styles.panelHeader}>
              <div><h2 id="payments-title">Cobranças para acompanhar</h2><p>Até 5 pagamentos pendentes, por data de vencimento.</p></div>
              <Link className={styles.panelLink} href="/dashboard/financial">Abrir financeiro <ArrowUpRight size={16} aria-hidden="true" /></Link>
            </div>
            <PaymentsPreview payments={pendingPayments} />
          </section>
        </div>

        <div className={styles.sideColumn}>
          <section className={styles.panel} aria-labelledby="fleet-title">
            <div className={styles.panelHeader}>
              <div><h2 id="fleet-title">Situação da frota</h2><p>Distribuição dos {stats.totalVehicles} veículos cadastrados.</p></div>
              <Link className={styles.panelLink} href="/dashboard/vehicles">Ver frota <ArrowUpRight size={16} aria-hidden="true" /></Link>
            </div>
            {stats.totalVehicles > 0 ? (
              <div className={styles.fleetBody}>
                <div className={styles.occupancy}><strong>{occupancy}%</strong><span>{stats.rentedVehiclesCount} de {stats.totalVehicles} veículos alugados</span></div>
                <div className={styles.fleetBar} role="img" aria-label={`${stats.rentedVehiclesCount} alugados, ${stats.availableVehiclesCount} disponíveis e ${otherVehicles} em outras situações`}>
                  <span style={{ width: `${(stats.rentedVehiclesCount / stats.totalVehicles) * 100}%` }} />
                  <span style={{ width: `${(stats.availableVehiclesCount / stats.totalVehicles) * 100}%` }} />
                  <span style={{ width: `${(otherVehicles / stats.totalVehicles) * 100}%` }} />
                </div>
                <dl className={styles.fleetLegend}>
                  <div><dt><i className={styles.rentedDot} aria-hidden="true" />Alugados</dt><dd>{stats.rentedVehiclesCount}</dd></div>
                  <div><dt><i className={styles.availableDot} aria-hidden="true" />Disponíveis</dt><dd>{stats.availableVehiclesCount}</dd></div>
                  <div><dt><i className={styles.otherDot} aria-hidden="true" />Outros</dt><dd>{otherVehicles}</dd></div>
                </dl>
              </div>
            ) : (
              <div className={styles.emptyState}><CarFront size={24} aria-hidden="true" /><div><strong>Nenhum veículo cadastrado</strong><p>Cadastre um veículo para acompanhar a situação da frota.</p><Link href="/dashboard/vehicles">Ir para veículos <ArrowUpRight size={15} aria-hidden="true" /></Link></div></div>
            )}
          </section>
          <section className={styles.panel} aria-labelledby="finance-title">
            <div className={styles.panelHeader}>
              <div><h2 id="finance-title">Resumo financeiro</h2><p>Valores acumulados registrados.</p></div>
              <Link className={styles.panelLink} href="/dashboard/reports">Relatórios <ArrowUpRight size={16} aria-hidden="true" /></Link>
            </div>
            <div className={styles.financeBody}>
              <dl>
                <div><dt>Receitas pagas</dt><dd>{currency.format(stats.totalRevenue)}</dd></div>
                <div><dt>Despesas registradas</dt><dd>− {currency.format(stats.totalExpenses)}</dd></div>
                <div className={styles.financeTotal}><dt>Resultado acumulado</dt><dd className={stats.netProfit < 0 ? styles.dangerValue : undefined}>{currency.format(stats.netProfit)}</dd></div>
              </dl>
              <p>O resultado considera apenas receitas pagas e despesas registradas.</p>
            </div>
          </section>
          <nav className={styles.quickLinks} aria-label="Outras áreas da operação">
            <Link href="/dashboard/contracts"><FileText size={16} aria-hidden="true" /> Contratos <ArrowUpRight size={15} aria-hidden="true" /></Link>
            <Link href="/dashboard/maintenance"><Wrench size={16} aria-hidden="true" /> Manutenções <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
