// Tipos que espelham o schema do Prisma para uso seguro no Frontend

export type Vehicle = {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  renavam: string;
  chassis: string;
  km: number;
  status: string;
  userId: string;
};

export type Driver = {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  cnh: string;
  cnhValidity: string; // A data virá como string do JSON
  address: string;
  status: string;
  userId: string;
};

export type Contract = {
  id: string;
  weeklyValue: number;
  paymentDay: string;
  startDate: string; // A data virá como string do JSON
  deposit: number;
  status: string;
  userId: string;
  vehicleId: string;
  driverId: string;
};

export type Payment = {
  id: string;
  weekStart: string;
  weekEnd: string;
  value: number;
  dueDate: string;
  paymentDate?: string | null;
  status: string;
  contractId: string;
};

export type Expense = {
  id: string;
  type: string;
  description: string;
  value: number;
  date: string;
  vehicleId: string;
  userId: string;
};
