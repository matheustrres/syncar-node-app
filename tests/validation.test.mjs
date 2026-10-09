import test from 'node:test';
import assert from 'node:assert/strict';
import {
  vehicleCreateSchema,
  vehicleUpdateSchema,
  vehicleIdsSchema,
  vehicleListQuerySchema,
} from '../src/lib/vehicle-validation.ts';
import {
  maintenanceBodySchema,
  maintenanceIdsSchema,
  maintenanceListQuerySchema,
  maintenanceIdSchema,
} from '../src/lib/maintenance-validation.ts';
import {
  driverCreateSchema,
  driverUpdateSchema,
  driverIdsSchema,
  driverListQuerySchema,
} from '../src/lib/driver-validation.ts';
import {
  contractBodySchema,
  contractIdsSchema,
  contractListQuerySchema,
  contractIdSchema,
} from '../src/lib/contract-validation.ts';
import { paymentIdSchema, paymentUpdateSchema } from '../src/lib/payment-validation.ts';
import { profilePasswordSchema, profileUpdateSchema } from '../src/lib/profile-validation.ts';
import {
  bcryptHashSchema,
  forgotPasswordSchema,
  loginCredentialsSchema,
  registrationSchema,
  resetPasswordSchema,
  strongPasswordSchema,
} from '../src/lib/auth-validation.ts';

const vehicle = {
  plate: 'ABC-1234',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2024,
  color: 'Prata',
  km: 25_000,
  status: 'Disponível',
};

const maintenance = {
  vehicleId: 'vehicle_123',
  type: 'PREVENTIVA',
  description: ' Revisão ',
  cost: '150.50',
  date: '2026-10-08T12:00:00.000Z',
  mileage: '25000',
  nextServiceMileage: null,
  nextServiceDate: null,
  notes: '  troca de filtros  ',
};

const driver = {
  name: '  Maria da Silva  ',
  nameNormalized: 'maria da silva',
  cpf: '529.982.247-25',
  phone: '(11) 99999-9999',
  email: 'MARIA@EXEMPLO.COM',
  cnh: '12345678901',
  cnhValidity: '2027-05-31',
  cep: '01310-100',
  logradouro: 'Av. Paulista',
  numero: '1000',
  complemento: '',
  bairro: 'Bela Vista',
  cidade: 'São Paulo',
  uf: 'sp',
  status: 'Ativo',
};

const contract = {
  vehicleId: 'vehicle_123',
  driverId: 'driver_123',
  weeklyValue: 850.5,
  paymentDay: 'Segunda-feira',
  startDate: '2026-10-09T12:00:00.000Z',
  deposit: 1000,
  status: 'Ativo',
  duration: 24,
};

const validAuthPassword = 'Syncar!2026@';

test('auth schemas validate signup, login, password reset and stored bcrypt hashes', () => {
  const registration = registrationSchema.safeParse({
    name: '  Ana Silva ',
    email: ' ANA@EXEMPLO.COM ',
    password: validAuthPassword,
    confirmPassword: validAuthPassword,
    companyName: '  Empresa Ana ',
    phone: '(11) 99999-9999',
  });
  assert.equal(registration.success, true);
  assert.equal(registration.data.email, 'ana@exemplo.com');
  assert.equal(registration.data.name, 'Ana Silva');
  assert.equal(registration.data.companyName, 'Empresa Ana');

  assert.equal(registrationSchema.safeParse({
    name: 'Ana', email: 'ana@exemplo.com', password: validAuthPassword,
    confirmPassword: 'Outro!2026@', companyName: 'Empresa Ana', phone: '11999999999',
  }).success, false);
  assert.equal(registrationSchema.safeParse({
    name: 'Ana', email: 'invalido', password: validAuthPassword,
    confirmPassword: validAuthPassword, companyName: 'Empresa Ana', phone: '11999999999',
  }).success, false);
  assert.equal(registrationSchema.safeParse({
    name: 'Ana', email: 'ana@exemplo.com', password: validAuthPassword,
    confirmPassword: validAuthPassword, companyName: 'Empresa Ana', phone: '11999999999',
    plan: 'PRO',
  }).success, false);

  assert.equal(strongPasswordSchema.safeParse('Abcdef1!').success, false);
  assert.equal(strongPasswordSchema.safeParse('abcdefgh!@1').success, false);
  assert.equal(strongPasswordSchema.safeParse(`A1!@${'a'.repeat(70)}`).success, false);
  assert.equal(strongPasswordSchema.safeParse(validAuthPassword).success, true);

  assert.equal(loginCredentialsSchema.safeParse({ email: ' USER@EXEMPLO.COM ', password: 'legacy' }).data.email, 'user@exemplo.com');
  assert.equal(loginCredentialsSchema.safeParse({ email: 'x@exemplo.com', password: 'x'.repeat(73) }).success, false);
  const nextAuthCredentials = loginCredentialsSchema.safeParse({
    email: ' USER@EXEMPLO.COM ', password: 'legacy',
    csrfToken: 'csrf-token', callbackUrl: '/dashboard', json: 'true',
  });
  assert.equal(nextAuthCredentials.success, true);
  assert.deepEqual(nextAuthCredentials.data, { email: 'user@exemplo.com', password: 'legacy' });

  assert.equal(forgotPasswordSchema.safeParse({ email: ' USER@EXEMPLO.COM ' }).data.email, 'user@exemplo.com');
  assert.equal(forgotPasswordSchema.safeParse({ email: 'invalido' }).success, false);
  assert.equal(resetPasswordSchema.safeParse({ token: 'a'.repeat(64), password: validAuthPassword }).success, true);
  assert.equal(resetPasswordSchema.safeParse({ token: 'bad-token', password: validAuthPassword }).success, false);
  assert.equal(resetPasswordSchema.safeParse({ token: 'a'.repeat(64), password: 'weak' }).success, false);

  assert.equal(bcryptHashSchema.safeParse('$2b$10$' + 'a'.repeat(53)).success, true);
  assert.equal(bcryptHashSchema.safeParse('plain-password').success, false);
  assert.equal(bcryptHashSchema.safeParse('$2b$10$broken').success, false);
});

test('vehicle create validates required fields and normalizes plate and optional identifiers', () => {
  const parsed = vehicleCreateSchema.safeParse({
    ...vehicle,
    plate: 'abc1234',
    renavam: '',
    chassis: '',
  });
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.plate, 'ABC1234');
  assert.equal(parsed.data.renavam, null);
  assert.equal(parsed.data.chassis, null);

  assert.equal(vehicleCreateSchema.safeParse({ ...vehicle, plate: 'ABC-12' }).success, false);
  assert.equal(vehicleCreateSchema.safeParse({ ...vehicle, year: new Date().getFullYear() + 2 }).success, false);
  assert.equal(vehicleCreateSchema.safeParse({ ...vehicle, km: -1 }).success, false);
  assert.equal(vehicleCreateSchema.safeParse({ ...vehicle, status: 'Ativo' }).success, false);
});

test('vehicle update requires at least one valid field', () => {
  assert.equal(vehicleUpdateSchema.safeParse({}).success, false);
  assert.deepEqual(vehicleUpdateSchema.safeParse({ km: 0 }).data, { km: 0 });
  assert.equal(vehicleUpdateSchema.safeParse({ km: 1.5 }).success, false);
});

test('vehicle IDs and list filters enforce shape, bounds and ranges', () => {
  assert.deepEqual(vehicleIdsSchema.safeParse({ ids: ['vehicle1', 'vehicle2'] }).data, { ids: ['vehicle1', 'vehicle2'] });
  assert.equal(vehicleIdsSchema.safeParse({ ids: [] }).success, false);
  assert.equal(vehicleIdsSchema.safeParse({ ids: ['same', 'same'] }).success, false);
  assert.equal(vehicleIdsSchema.safeParse({ ids: Array.from({ length: 101 }, (_, index) => `v${index}`) }).success, false);
  assert.equal(vehicleIdsSchema.safeParse(['vehicle1']).success, false);

  const defaults = vehicleListQuerySchema.safeParse({});
  assert.equal(defaults.success, true);
  assert.equal(defaults.data.page, 1);
  assert.equal(defaults.data.limit, 10);
  assert.equal(vehicleListQuerySchema.safeParse({ search: '  Corolla  ' }).data.search, 'Corolla');
  assert.equal(vehicleListQuerySchema.safeParse({ search: 'x'.repeat(101) }).success, false);
  assert.equal(vehicleListQuerySchema.safeParse({ status: 'Desconhecido' }).success, false);
  assert.equal(vehicleListQuerySchema.safeParse({ kmMin: '100', kmMax: '10' }).success, false);
  assert.equal(vehicleListQuerySchema.safeParse({ extra: 'nope' }).success, false);
});

test('maintenance create validates values and normalizes optional text and numeric strings', () => {
  const parsed = maintenanceBodySchema.safeParse(maintenance);
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.cost, 150.5);
  assert.equal(parsed.data.mileage, 25_000);
  assert.equal(parsed.data.description, 'Revisão');
  assert.equal(parsed.data.notes, 'troca de filtros');

  assert.equal(maintenanceBodySchema.safeParse({ ...maintenance, type: 'LAVAGEM' }).success, false);
  assert.equal(maintenanceBodySchema.safeParse({ ...maintenance, cost: 'abc' }).success, false);
  assert.equal(maintenanceBodySchema.safeParse({ ...maintenance, cost: '0' }).success, false);
  assert.equal(maintenanceBodySchema.safeParse({ ...maintenance, mileage: '1.5' }).success, false);
  assert.equal(maintenanceBodySchema.safeParse({ ...maintenance, date: '2026-02-30' }).success, false);
  assert.equal(maintenanceBodySchema.safeParse({ ...maintenance, unexpected: true }).success, false);
});

test('maintenance IDs and list filters reject malformed values and inverted ranges', () => {
  assert.equal(maintenanceIdSchema.safeParse('maint_123').success, true);
  assert.equal(maintenanceIdSchema.safeParse('bad/id').success, false);
  assert.equal(maintenanceIdsSchema.safeParse({ ids: ['maint1', 'maint2'] }).success, true);
  assert.equal(maintenanceIdsSchema.safeParse({ ids: ['same', 'same'] }).success, false);
  assert.equal(maintenanceIdsSchema.safeParse({ ids: [] }).success, false);
  assert.equal(maintenanceIdsSchema.safeParse({ ids: Array.from({ length: 101 }, (_, index) => `m${index}`) }).success, false);

  const filters = maintenanceListQuerySchema.safeParse({ page: '2', limit: '25', costMin: '10.25', costMax: '90.50', dateStartDate: '2026-10-01' });
  assert.equal(filters.success, true);
  assert.equal(filters.data.page, 2);
  assert.equal(filters.data.costMin, 10.25);
  assert.equal(maintenanceListQuerySchema.safeParse({ mileageMin: '100', mileageMax: '10' }).success, false);
  assert.equal(maintenanceListQuerySchema.safeParse({ dateStartDate: '2026-02-30' }).success, false);
  assert.equal(maintenanceListQuerySchema.safeParse({ sortColumn: 'userId' }).success, false);
  assert.equal(maintenanceListQuerySchema.safeParse({ unknown: 'value' }).success, false);
});

test('driver create validates identity, contact and address fields and normalizes optional values', () => {
  const parsed = driverCreateSchema.safeParse(driver);
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.name, 'Maria da Silva');
  assert.equal(parsed.data.email, 'maria@exemplo.com');
  assert.equal(parsed.data.uf, 'SP');
  assert.equal(parsed.data.cnh, '12345678901');

  const noCnh = driverCreateSchema.safeParse({ ...driver, cnh: '', cnhValidity: null, complemento: null });
  assert.equal(noCnh.success, true);
  assert.equal(noCnh.data.cnh, null);
  assert.equal(driverCreateSchema.safeParse({ ...driver, cpf: '111.111.111-11' }).success, false);
  assert.equal(driverCreateSchema.safeParse({ ...driver, cpf: '123.456.789-00' }).success, false);
  assert.equal(driverCreateSchema.safeParse({ ...driver, phone: 'abc' }).success, false);
  assert.equal(driverCreateSchema.safeParse({ ...driver, email: 'invalido' }).success, false);
  assert.equal(driverCreateSchema.safeParse({ ...driver, cnh: '123' }).success, false);
  assert.equal(driverCreateSchema.safeParse({ ...driver, cnhValidity: '2026-02-30' }).success, false);
  assert.equal(driverCreateSchema.safeParse({ ...driver, cep: '123' }).success, false);
  assert.equal(driverCreateSchema.safeParse({ ...driver, uf: 'São Paulo' }).success, false);
  assert.equal(driverCreateSchema.safeParse({ ...driver, status: 'Pendente' }).success, false);
});

test('driver update, IDs and list filters reject empty or malformed input', () => {
  assert.equal(driverUpdateSchema.safeParse({}).success, false);
  assert.deepEqual(driverUpdateSchema.safeParse({ status: 'Inativo' }).data, { status: 'Inativo' });
  assert.equal(driverUpdateSchema.safeParse({ unexpected: true }).success, false);

  assert.equal(driverIdsSchema.safeParse({ ids: ['driver1', 'driver2'] }).success, true);
  assert.equal(driverIdsSchema.safeParse({ ids: [] }).success, false);
  assert.equal(driverIdsSchema.safeParse({ ids: ['same', 'same'] }).success, false);
  assert.equal(driverIdsSchema.safeParse({ ids: Array.from({ length: 101 }, (_, index) => `d${index}`) }).success, false);

  const defaults = driverListQuerySchema.safeParse({});
  assert.equal(defaults.success, true);
  assert.equal(defaults.data.page, 1);
  assert.equal(defaults.data.limit, 10);
  assert.equal(driverListQuerySchema.safeParse({ status: 'Outro' }).success, false);
  assert.equal(driverListQuerySchema.safeParse({ sortColumn: 'userId' }).success, false);
  assert.equal(driverListQuerySchema.safeParse({ page: '-1' }).success, false);
  assert.equal(driverListQuerySchema.safeParse({ unknown: 'x' }).success, false);
});

test('contract body validates required fields, enums, values and dates', () => {
  assert.equal(contractBodySchema.safeParse(contract).success, true);
  assert.equal(contractBodySchema.safeParse({ ...contract, weeklyValue: 0 }).success, false);
  assert.equal(contractBodySchema.safeParse({ ...contract, deposit: -1 }).success, false);
  assert.equal(contractBodySchema.safeParse({ ...contract, duration: 1.5 }).success, false);
  assert.equal(contractBodySchema.safeParse({ ...contract, paymentDay: 'Feriado' }).success, false);
  assert.equal(contractBodySchema.safeParse({ ...contract, startDate: '2026-02-30' }).success, false);
  assert.equal(contractBodySchema.safeParse({ ...contract, unexpected: true }).success, false);
  assert.equal(contractBodySchema.safeParse({ ...contract, duration: null }).success, true);
});

test('contract IDs and list filters reject malformed input and inverted ranges', () => {
  assert.equal(contractIdSchema.safeParse('contract_123').success, true);
  assert.equal(contractIdSchema.safeParse('bad/id').success, false);
  assert.equal(contractIdsSchema.safeParse({ ids: ['contract1', 'contract2'] }).success, true);
  assert.equal(contractIdsSchema.safeParse({ ids: ['same', 'same'] }).success, false);
  assert.equal(contractIdsSchema.safeParse({ ids: [] }).success, false);
  assert.equal(contractIdsSchema.safeParse({ ids: Array.from({ length: 101 }, (_, index) => `c${index}`) }).success, false);

  const defaults = contractListQuerySchema.safeParse({});
  assert.equal(defaults.success, true);
  assert.equal(defaults.data.page, 1);
  assert.equal(defaults.data.limit, 10);
  assert.equal(contractListQuerySchema.safeParse({ status: 'Pendente' }).success, false);
  assert.equal(contractListQuerySchema.safeParse({ weeklyValueMin: '100', weeklyValueMax: '10' }).success, false);
  assert.equal(contractListQuerySchema.safeParse({ startDateStartDate: '2026-02-30' }).success, false);
  assert.equal(contractListQuerySchema.safeParse({ sortColumn: 'userId' }).success, false);
  assert.equal(contractListQuerySchema.safeParse({ extra: 'x' }).success, false);
});

test('payment updates validate report confirmation and editable payment fields', () => {
  const reportConfirmation = paymentUpdateSchema.safeParse({ status: 'Pago', paymentDate: '2026-10-09T12:00:00.000Z' });
  assert.equal(reportConfirmation.success, true);
  assert.equal(paymentUpdateSchema.safeParse({}).success, false);
  assert.equal(paymentUpdateSchema.safeParse({ status: 'Cancelado' }).success, false);
  assert.equal(paymentUpdateSchema.safeParse({ paymentDate: '2026-02-30' }).success, false);
  assert.equal(paymentUpdateSchema.safeParse({ value: -1 }).success, false);
  assert.equal(paymentUpdateSchema.safeParse({ weekStart: '2026-10-20', weekEnd: '2026-10-10' }).success, false);
  assert.equal(paymentUpdateSchema.safeParse({ userId: 'another-user' }).success, false);
  assert.equal(paymentIdSchema.safeParse('payment_123').success, true);
  assert.equal(paymentIdSchema.safeParse('bad/id').success, false);
});

test('profile update validates and normalizes account details', () => {
  const parsed = profileUpdateSchema.safeParse({ name: '  Maria da Silva  ', email: ' MARIA@EXEMPLO.COM ', companyName: '  Frota Maria  ' });
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.name, 'Maria da Silva');
  assert.equal(parsed.data.email, 'maria@exemplo.com');
  assert.equal(parsed.data.companyName, 'Frota Maria');
  assert.equal(profileUpdateSchema.safeParse({ name: '', email: 'invalido', companyName: 'X' }).success, false);
  assert.equal(profileUpdateSchema.safeParse({ name: 'Maria', email: 'maria@example.com', companyName: 'Empresa', plan: 'PROFESSIONAL' }).success, false);
});

test('profile password update enforces required fields and bcrypt input size', () => {
  assert.equal(profilePasswordSchema.safeParse({ currentPassword: 'senha-atual', newPassword: validAuthPassword }).success, true);
  assert.equal(profilePasswordSchema.safeParse({ currentPassword: '', newPassword: validAuthPassword }).success, false);
  assert.equal(profilePasswordSchema.safeParse({ currentPassword: 'senha-atual', newPassword: 'curta' }).success, false);
  assert.equal(profilePasswordSchema.safeParse({ currentPassword: 'senha-atual', newPassword: 'á'.repeat(37) }).success, false);
  assert.equal(profilePasswordSchema.safeParse({ currentPassword: 'senha-atual', newPassword: validAuthPassword, confirmNewPassword: 'outra' }).success, false);
});
