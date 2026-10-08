import Link from "next/link";
import { ArrowRight, CarFront, CircleAlert, Wallet } from "lucide-react";
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

  return (
    <div className={styles.page}>
      <div className={styles.intro}>
        <div>
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
            <span className={styles.metricNote}>exigem acompanhamento</span>
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

      <div className={styles.detailGrid}>
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
              <dl className={styles.fleetList}>
                <div><dt>Disponíveis</dt><dd>{stats.availableVehiclesCount}</dd></div>
                <div><dt>Alugados</dt><dd>{stats.rentedVehiclesCount}</dd></div>
                {otherVehicles > 0 && <div><dt>Outras situações</dt><dd>{otherVehicles}</dd></div>}
                <div className={styles.fleetTotal}><dt>Total de veículos</dt><dd>{stats.totalVehicles}</dd></div>
              </dl>
            ) : (
              <div className={styles.fleetEmpty}>
                <p>Cadastre o primeiro veículo para acompanhar a disponibilidade da frota.</p>
                <Link className={styles.textLink} href="/dashboard/vehicles">
                  Ir para veículos <ArrowRight size={16} aria-hidden="true" />
                </Link>
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
