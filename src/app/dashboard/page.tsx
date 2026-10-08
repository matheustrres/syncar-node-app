import Link from "next/link";
import { ArrowRight, CarFront, CircleAlert, Wallet, FileText, Wrench, CheckCheck } from "lucide-react";
import { getDashboardData } from "@/lib/data-access";
import styles from "./dashboard.module.css";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const date = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function DashboardPage() {
  const { stats, pendingPayments } = await getDashboardData();
  const otherVehicles = Math.max(
    0,
    stats.totalVehicles - stats.availableVehiclesCount - stats.rentedVehiclesCount
  );

  const occupancy = stats.totalVehicles > 0
    ? Math.round((stats.rentedVehiclesCount / stats.totalVehicles) * 100)
    : null;
  const priorities = [
    {
      href: "/dashboard/financial",
      icon: CircleAlert,
      count: stats.overduePaymentsCount,
      title: "Cobranças em atraso",
      detail: stats.overduePaymentsCount > 0 ? "Confira os vencimentos e acompanhe os recebimentos." : "Nenhum pagamento atrasado no momento.",
      action: "Conferir financeiro",
      warning: stats.overduePaymentsCount > 0,
    },
    {
      href: "/dashboard/vehicles",
      icon: CarFront,
      count: stats.availableVehiclesCount,
      title: "Veículos disponíveis",
      detail: stats.availableVehiclesCount > 0 ? "Consulte a frota disponível para as próximas locações." : "Consulte os veículos e a situação de cada um.",
      action: "Consultar frota",
      warning: false,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.intro}>
        <div>
          <span className={styles.eyebrow}>Painel da operação</span>
          <h1>Visão geral</h1>
          <p>O que precisa da sua atenção na frota e no financeiro.</p>
        </div>
        <Link className={styles.primaryAction} href="/dashboard/vehicles">
          Ver veículos <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>

      <section className={styles.overview} aria-labelledby="operation-title">
        <div className={styles.overviewHeader}>
          <h2 id="operation-title">Situação da operação</h2>
          <span>Dados atuais da sua conta</span>
        </div>
        <div className={styles.metricGrid}>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Veículos disponíveis</span>
            <strong>{stats.availableVehiclesCount}</strong>
            <span className={styles.metricNote}>de {stats.totalVehicles} na frota</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Veículos alugados</span>
            <strong>{stats.rentedVehiclesCount}</strong>
            <span className={styles.metricNote}>em operação</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Pagamentos atrasados</span>
            <strong className={stats.overduePaymentsCount > 0 ? styles.warningValue : undefined}>
              {stats.overduePaymentsCount}
            </strong>
            <span className={styles.metricNote}>{stats.overduePaymentsCount > 0 ? "exigem acompanhamento" : "nenhum atraso registrado"}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Resultado acumulado</span>
            <strong className={stats.netProfit < 0 ? styles.dangerValue : undefined}>
              {currency.format(stats.netProfit)}
            </strong>
            <span className={styles.metricNote}>receitas pagas menos despesas</span>
          </div>
        </div>
      </section>

      <nav className={styles.shortcuts} aria-label="Atalhos da operação">
        <span>Rotina da operação</span>
        <Link href="/dashboard/contracts"><FileText size={17} aria-hidden="true" /> Contratos <ArrowRight size={14} aria-hidden="true" /></Link>
        <Link href="/dashboard/financial"><Wallet size={17} aria-hidden="true" /> Pagamentos e despesas <ArrowRight size={14} aria-hidden="true" /></Link>
        <Link href="/dashboard/maintenance"><Wrench size={17} aria-hidden="true" /> Manutenções <ArrowRight size={14} aria-hidden="true" /></Link>
      </nav>

      <div className={styles.detailGrid}>
        <div className={styles.workColumn}>
          <section className={styles.panel} aria-labelledby="priorities-title">
            <div className={styles.panelHeader}>
              <div>
                <div className={styles.titleWithIcon}><CheckCheck size={19} aria-hidden="true" /><h2 id="priorities-title">Prioridades da operação</h2></div>
                <p>Próximos passos a partir da situação atual.</p>
              </div>
            </div>
            <ul className={styles.priorityList}>
              {priorities.map(({ href, icon: Icon, count, title, detail, action, warning }) => (
                <li key={title}>
                  <span className={`${styles.priorityCount} ${warning ? styles.priorityWarning : ""}`}>{count}</span>
                  <div><h3><Icon size={15} aria-hidden="true" />{title}</h3><p>{detail}</p><Link className={styles.textLink} href={href}>{action}<ArrowRight size={15} aria-hidden="true" /></Link></div>
                </li>
              ))}
            </ul>
          </section>

        <section className={styles.panel} aria-labelledby="payments-title">
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.titleWithIcon}>
                <CircleAlert size={19} aria-hidden="true" />
                <h2 id="payments-title">Pagamentos pendentes</h2>
              </div>
              <p>Até 5 pagamentos, por data de vencimento.</p>
            </div>
            <Link className={styles.textLink} href="/dashboard/financial">
              Ver financeiro <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          {pendingPayments.length > 0 ? (
            <ul className={styles.paymentList}>
              {pendingPayments.map((payment) => {
                const isOverdue = new Date(payment.dueDate) < new Date();
                return (
                  <li className={styles.paymentRow} key={payment.id}>
                    <div className={styles.paymentIdentity}>
                      <strong>{payment.driverName}</strong>
                      <span>{payment.vehicleInfo}</span>
                    </div>
                    <div className={styles.paymentMeta}>
                      <strong>{currency.format(payment.value)}</strong>
                      <span className={isOverdue ? styles.overdue : undefined}>
                        {isOverdue ? "Atrasado · " : "Vence em "}
                        {date.format(new Date(payment.dueDate))}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}><Wallet size={24} aria-hidden="true" /></span>
              <h3>Nenhum pagamento pendente</h3>
              <p>Os pagamentos dos contratos aparecerão aqui quando houver valores a receber.</p>
              <Link className={styles.textLink} href="/dashboard/contracts">
                Ver contratos <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>

        </div>
        <div className={styles.sideColumn}>
          <section className={styles.panel} aria-labelledby="fleet-title">
            <div className={styles.panelHeader}>
              <div>
                <div className={styles.titleWithIcon}>
                  <CarFront size={19} aria-hidden="true" />
                  <h2 id="fleet-title">Status da frota</h2>
                </div>
                <p>Distribuição dos veículos cadastrados.</p>
              </div>
            </div>
            {stats.totalVehicles > 0 ? (
              <>
              <div className={styles.occupancy}>
                <div><span>Ocupação da frota</span><strong>{occupancy}%</strong></div>
                <p>{stats.rentedVehiclesCount} de {stats.totalVehicles} veículos alugados</p>
                <div className={styles.fleetBar} aria-hidden="true">
                  <span style={{ width: `${(stats.rentedVehiclesCount / stats.totalVehicles) * 100}%` }} />
                  <span style={{ width: `${(stats.availableVehiclesCount / stats.totalVehicles) * 100}%` }} />
                  <span style={{ width: `${(otherVehicles / stats.totalVehicles) * 100}%` }} />
                </div>
              </div>
              <dl className={styles.fleetList}>
                <div><dt><i className={styles.availableDot} aria-hidden="true" />Disponíveis</dt><dd>{stats.availableVehiclesCount}</dd></div>
                <div><dt><i className={styles.rentedDot} aria-hidden="true" />Alugados</dt><dd>{stats.rentedVehiclesCount}</dd></div>
                {otherVehicles > 0 && <div><dt><i className={styles.otherDot} aria-hidden="true" />Outras situações</dt><dd>{otherVehicles}</dd></div>}
                <div className={styles.fleetTotal}><dt>Total de veículos</dt><dd>{stats.totalVehicles}</dd></div>
              </dl>
              </>
            ) : (
              <div className={styles.fleetEmpty}>
                <span className={styles.emptyIcon}><CarFront size={24} aria-hidden="true" /></span>
                <div>
                  <strong>Nenhum veículo cadastrado</strong>
                  <p>Cadastre o primeiro veículo para acompanhar a disponibilidade da frota.</p>
                  <Link className={styles.textLink} href="/dashboard/vehicles">
                    Ir para veículos <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}
          </section>

          <section className={styles.financePanel} aria-labelledby="finance-title">
            <div className={styles.financeHeading}>
              <h2 id="finance-title">Resumo financeiro</h2>
              <span>Acumulado</span>
            </div>
            <dl>
              <div><dt>Receitas pagas</dt><dd>{currency.format(stats.totalRevenue)}</dd></div>
              <div><dt>Despesas registradas</dt><dd>{currency.format(stats.totalExpenses)}</dd></div>
            </dl>
            <Link href="/dashboard/reports">
              Explorar relatórios <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
