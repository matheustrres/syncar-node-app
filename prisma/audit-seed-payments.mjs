import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { writeFile } from 'node:fs/promises';
import { contractData } from './seed-contracts.mjs';

// Read-only. The report identifies candidates; it never deletes installments.
nextEnv.loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production');
const prisma = new PrismaClient();
try {
  const users = await prisma.user.findMany({ select: { id: true }, take: 2 });
  if (users.length !== 1) throw new Error('A auditoria exige exatamente um usuário.');
  const payments = await prisma.payment.findMany({
    where: { contract: { userId: users[0].id, OR: contractData.map(item => ({
      vehicle: { plate: item.vehiclePlate }, driver: { cpf: item.driverCpf },
    })) } },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });
  const groups = new Map();
  for (const payment of payments) {
    const key = `${payment.contractId}:${payment.dueDate.toISOString().slice(0, 10)}`;
    groups.set(key, [...(groups.get(key) || []), payment]);
  }
  const duplicates = [...groups.entries()].filter(([, items]) => items.length > 1).map(([key, items]) => {
    const paid = items.filter(item => item.status === 'Pago' || item.paymentDate !== null);
    const sameValue = new Set(items.map(item => item.value)).size === 1;
    const safe = paid.length <= 1 && sameValue && items.every(item => ['Pendente', 'Pago'].includes(item.status));
    const keep = paid[0] || items[0];
    return { key, requiresReview: !safe, keepId: safe ? keep.id : null,
      candidateIds: safe ? items.filter(item => item.id !== keep.id && item.status === 'Pendente' && !item.paymentDate).map(item => item.id) : [],
      payments: items };
  });
  const report = { generatedAt: new Date().toISOString(), inspectedPayments: payments.length,
    duplicateGroups: duplicates.length, pendingCandidates: duplicates.reduce((sum, group) => sum + group.candidateIds.length, 0),
    requiresReview: duplicates.filter(group => group.requiresReview).length, groups: duplicates };
  const output = process.argv[2];
  if (output) await writeFile(output, JSON.stringify(report, null, 2), { flag: 'wx', mode: 0o600 });
  console.log(JSON.stringify({ inspectedPayments: report.inspectedPayments, duplicateGroups: report.duplicateGroups,
    pendingCandidates: report.pendingCandidates, requiresReview: report.requiresReview, report: output || 'Passe um caminho para salvar os detalhes.' }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Falha na auditoria.');
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
