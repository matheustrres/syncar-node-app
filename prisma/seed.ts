import { MaintenanceType } from '@prisma/client';
import { PrismaClient, type Prisma } from '@prisma/client';
import { contractData } from './seed-contracts.mjs';
import { buildSeedPayments } from './seed-payments.mjs';

const client = new PrismaClient();

const daysAgo = (days: number) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const daysFromNow = (days: number) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

async function main(prisma: Prisma.TransactionClient) {
  console.log('Iniciando seed da frota...');

  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' }, take: 2 });
  if (users.length === 0) {
    throw new Error('Nenhum usuário encontrado. Crie o usuário da plataforma antes de executar o seed.');
  }
  if (users.length > 1) {
    throw new Error(`Esperado um único usuário, mas foram encontrados ${users.length}. Seed cancelado.`);
  }
  const user = users[0];
  await prisma.user.update({ where: { id: user.id }, data: { plan: 'PROFESSIONAL' } });
  console.log(`Preenchendo frota para ${user.name} (${user.email}).`);

  const vehicleData = [
    { plate: 'RND1A23', brand: 'Fiat', model: 'Mobi Like', year: 2023, color: 'Branco', renavam: '11111111111', chassis: '9BD341A1XPY000001', km: 18420, status: 'Disponível' },
    { plate: 'RNE2B34', brand: 'Hyundai', model: 'HB20 Comfort', year: 2022, color: 'Prata', renavam: '22222222222', chassis: '9BHBG51CAKP000002', km: 42780, status: 'Alugado' },
    { plate: 'RNF3C45', brand: 'Chevrolet', model: 'Onix LT', year: 2024, color: 'Preto', renavam: '33333333333', chassis: '9BGEB48A0RG000003', km: 12650, status: 'Alugado' },
    { plate: 'RNG4D56', brand: 'Volkswagen', model: 'Gol Track', year: 2021, color: 'Vermelho', renavam: '44444444444', chassis: '9BWAB45U7MT000004', km: 87630, status: 'Manutenção' },
    { plate: 'RNH5E67', brand: 'Fiat', model: 'Argo Drive', year: 2023, color: 'Cinza', renavam: '55555555555', chassis: '9BD358A1HNY000005', km: 29310, status: 'Alugado' },
    { plate: 'RNI6F78', brand: 'Renault', model: 'Kwid Zen', year: 2022, color: 'Azul', renavam: '66666666666', chassis: '93YRBB000NJ000006', km: 51340, status: 'Disponível' },
    { plate: 'RNJ7G89', brand: 'Toyota', model: 'Yaris Sedan XL', year: 2023, color: 'Prata', renavam: '77777777777', chassis: '9BRBC3F30P0000007', km: 36200, status: 'Alugado' },
    { plate: 'RNK8H90', brand: 'Honda', model: 'City LX', year: 2024, color: 'Branco', renavam: '88888888888', chassis: '93HGN2650RZ000008', km: 21940, status: 'Alugado' },
    { plate: 'RNL9J01', brand: 'Nissan', model: 'Versa Sense', year: 2022, color: 'Cinza', renavam: '99999999999', chassis: '94DBCAN17NB000009', km: 68450, status: 'Disponível' },
    { plate: 'RNM0K12', brand: 'Chevrolet', model: 'Spin LT', year: 2023, color: 'Prata', renavam: '10101010101', chassis: '9BGJP7520PB000010', km: 45820, status: 'Alugado' },
    { plate: 'RNN1L23', brand: 'Volkswagen', model: 'Virtus Comfortline', year: 2024, color: 'Azul', renavam: '11111111112', chassis: '9BWDH6BZ5RP000011', km: 17380, status: 'Alugado' },
    { plate: 'RNO2M34', brand: 'Hyundai', model: 'HB20S Platinum', year: 2022, color: 'Preto', renavam: '12121212121', chassis: '9BHCP51AANP000012', km: 73210, status: 'Manutenção' },
    { plate: 'RNP3N45', brand: 'Fiat', model: 'Cronos Drive', year: 2023, color: 'Vermelho', renavam: '13131313131', chassis: '8AP359A1DPU000013', km: 38960, status: 'Alugado' },
    { plate: 'RNQ4P56', brand: 'Renault', model: 'Logan Life', year: 2021, color: 'Branco', renavam: '14141414141', chassis: '93Y4SRD04MJ000014', km: 95800, status: 'Disponível' },
    { plate: 'RNR5Q67', brand: 'Toyota', model: 'Corolla GLi', year: 2024, color: 'Preto', renavam: '15151515151', chassis: '9BRB33BE5R0000015', km: 14650, status: 'Alugado' },
    { plate: 'RNS6R78', brand: 'Honda', model: 'City Hatch EX', year: 2023, color: 'Cinza', renavam: '16161616161', chassis: '93HGR2650PZ000016', km: 32780, status: 'Alugado' },
    { plate: 'RNT7S89', brand: 'Chevrolet', model: 'Onix Plus LT', year: 2022, color: 'Branco', renavam: '17171717171', chassis: '9BGEY69H0NG000017', km: 61740, status: 'Disponível' },
    { plate: 'RNU8T90', brand: 'Volkswagen', model: 'Polo Track', year: 2024, color: 'Prata', renavam: '18181818181', chassis: '9BWAG5BZ5RT000018', km: 10820, status: 'Alugado' },
  ];
  const vehicles = await Promise.all(vehicleData.map(({ plate, ...data }) => prisma.vehicle.upsert({
    where: { plate },
    create: { ...data, plate, plateNormalized: plate, modelNormalized: data.model.toLowerCase(), userId: user.id },
    update: { ...data, plateNormalized: plate, modelNormalized: data.model.toLowerCase(), userId: user.id },
  })));
  const vehicleByPlate = new Map(vehicles.map((vehicle) => [vehicle.plate, vehicle]));

  const driverData = [
    { cpf: '111.111.111-11', name: 'João Silva', phone: '11987654321', email: 'joao.silva@example.com', cnh: '11111111111', cnhValidity: new Date('2028-05-20'), cep: '01310-100', logradouro: 'Avenida Paulista', numero: '1000', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP', status: 'Ativo' },
    { cpf: '222.222.222-22', name: 'Maria Oliveira', phone: '11976543210', email: 'maria.oliveira@example.com', cnh: '22222222222', cnhValidity: new Date('2029-11-12'), cep: '04001-000', logradouro: 'Rua Vergueiro', numero: '850', bairro: 'Vila Mariana', cidade: 'São Paulo', uf: 'SP', status: 'Ativo' },
    { cpf: '333.333.333-33', name: 'Carlos Pereira', phone: '11965432109', email: 'carlos.pereira@example.com', cnh: '33333333333', cnhValidity: new Date('2027-08-03'), cep: '05001-000', logradouro: 'Rua Caiubi', numero: '240', bairro: 'Perdizes', cidade: 'São Paulo', uf: 'SP', status: 'Ativo' },
    { cpf: '444.444.444-44', name: 'Ana Costa', phone: '11954321098', email: 'ana.costa@example.com', cnh: '44444444444', cnhValidity: new Date('2030-02-18'), cep: '04538-132', logradouro: 'Rua Gomes de Carvalho', numero: '1200', bairro: 'Vila Olímpia', cidade: 'São Paulo', uf: 'SP', status: 'Ativo' },
    { cpf: '555.555.555-55', name: 'Marcos Santos', phone: '11943210987', email: 'marcos.santos@example.com', cnh: '55555555555', cnhValidity: new Date('2028-12-09'), cep: '02011-000', logradouro: 'Rua Voluntários da Pátria', numero: '500', bairro: 'Santana', cidade: 'São Paulo', uf: 'SP', status: 'Ativo' },
    { cpf: '666.666.666-66', name: 'Fernanda Almeida', phone: '11932109876', email: 'fernanda.almeida@example.com', cnh: '66666666666', cnhValidity: new Date('2029-06-14'), cep: '03178-200', logradouro: 'Rua Serra de Bragança', numero: '700', bairro: 'Tatuapé', cidade: 'São Paulo', uf: 'SP', status: 'Ativo' },
    { cpf: '777.777.777-77', name: 'Rafael Rodrigues', phone: '11921098765', email: 'rafael.rodrigues@example.com', cnh: '77777777777', cnhValidity: new Date('2028-03-21'), cep: '03303-000', logradouro: 'Rua Cantagalo', numero: '420', bairro: 'Tatuapé', cidade: 'São Paulo', uf: 'SP', status: 'Ativo' },
    { cpf: '888.888.888-88', name: 'Juliana Ferreira', phone: '11910987654', email: 'juliana.ferreira@example.com', cnh: '88888888888', cnhValidity: new Date('2030-09-30'), cep: '03512-000', logradouro: 'Avenida Waldemar Carlos Pereira', numero: '320', bairro: 'Vila Matilde', cidade: 'São Paulo', uf: 'SP', status: 'Ativo' },
    { cpf: '999.999.999-99', name: 'Pedro Martins', phone: '11899887766', email: 'pedro.martins@example.com', cnh: '99999999999', cnhValidity: new Date('2027-12-17'), cep: '07020-010', logradouro: 'Rua Dona Antônia', numero: '90', bairro: 'Centro', cidade: 'Guarulhos', uf: 'SP', status: 'Ativo' },
    { cpf: '101.010.101-01', name: 'Beatriz Lima', phone: '11888776655', email: 'beatriz.lima@example.com', cnh: '10101010101', cnhValidity: new Date('2029-04-08'), cep: '06010-000', logradouro: 'Rua Antônio Agu', numero: '610', bairro: 'Centro', cidade: 'Osasco', uf: 'SP', status: 'Ativo' },
    { cpf: '121.212.121-21', name: 'Lucas Ribeiro', phone: '11977665544', email: 'lucas.ribeiro@example.com', cnh: '12121212121', cnhValidity: new Date('2028-10-26'), cep: '09510-000', logradouro: 'Rua Santa Catarina', numero: '155', bairro: 'Centro', cidade: 'São Caetano do Sul', uf: 'SP', status: 'Ativo' },
    { cpf: '131.313.131-31', name: 'Patrícia Gomes', phone: '11966554433', email: 'patricia.gomes@example.com', cnh: '13131313131', cnhValidity: new Date('2030-01-11'), cep: '09010-110', logradouro: 'Rua Coronel Oliveira Lima', numero: '280', bairro: 'Centro', cidade: 'Santo André', uf: 'SP', status: 'Ativo' },
    { cpf: '141.414.141-41', name: 'André Carvalho', phone: '11955443322', email: 'andre.carvalho@example.com', cnh: '14141414141', cnhValidity: new Date('2027-07-05'), cep: '09600-000', logradouro: 'Rua Marechal Deodoro', numero: '440', bairro: 'Centro', cidade: 'São Bernardo do Campo', uf: 'SP', status: 'Ativo' },
    { cpf: '151.515.151-51', name: 'Camila Nunes', phone: '11944332211', email: 'camila.nunes@example.com', cnh: '15151515151', cnhValidity: new Date('2029-02-27'), cep: '01311-000', logradouro: 'Alameda Santos', numero: '580', bairro: 'Cerqueira César', cidade: 'São Paulo', uf: 'SP', status: 'Ativo' },
    { cpf: '161.616.161-61', name: 'Diego Barros', phone: '11933221100', email: 'diego.barros@example.com', cnh: '16161616161', cnhValidity: new Date('2028-06-19'), cep: '05422-001', logradouro: 'Rua dos Pinheiros', numero: '350', bairro: 'Pinheiros', cidade: 'São Paulo', uf: 'SP', status: 'Ativo' },
    { cpf: '171.717.171-71', name: 'Larissa Teixeira', phone: '11922110099', email: 'larissa.teixeira@example.com', cnh: '17171717171', cnhValidity: new Date('2030-08-07'), cep: '04709-110', logradouro: 'Avenida Santo Amaro', numero: '1900', bairro: 'Santo Amaro', cidade: 'São Paulo', uf: 'SP', status: 'Ativo' },
    { cpf: '181.818.181-81', name: 'Gustavo Moreira', phone: '11911009988', email: 'gustavo.moreira@example.com', cnh: '18181818181', cnhValidity: new Date('2029-12-22'), cep: '04038-001', logradouro: 'Rua Domingos de Morais', numero: '720', bairro: 'Vila Mariana', cidade: 'São Paulo', uf: 'SP', status: 'Ativo' },
    { cpf: '191.919.191-91', name: 'Renata Azevedo', phone: '11810998877', email: 'renata.azevedo@example.com', cnh: '19191919191', cnhValidity: new Date('2028-01-15'), cep: '07110-000', logradouro: 'Avenida Guarulhos', numero: '1200', bairro: 'Gopoúva', cidade: 'Guarulhos', uf: 'SP', status: 'Ativo' },
    { cpf: '202.020.202-02', name: 'Thiago Dias', phone: '11890887766', email: 'thiago.dias@example.com', cnh: '20202020202', cnhValidity: new Date('2029-03-12'), cep: '06233-030', logradouro: 'Avenida dos Autonomistas', numero: '800', bairro: 'Vila Yara', cidade: 'Osasco', uf: 'SP', status: 'Ativo' },
  ];
  const drivers = await Promise.all(driverData.map(({ cpf, ...data }) => prisma.driver.upsert({
    where: { cpf },
    create: { ...data, cpf, nameNormalized: data.name.toLowerCase(), userId: user.id },
    update: { ...data, nameNormalized: data.name.toLowerCase(), userId: user.id },
  })));
  const driverByCpf = new Map(drivers.map((driver) => [driver.cpf, driver]));


  for (const contract of contractData) {
    const vehicle = vehicleByPlate.get(contract.vehiclePlate)!;
    const driver = driverByCpf.get(contract.driverCpf)!;
    const saved = await prisma.contract.findFirst({ where: { vehicleId: vehicle.id, driverId: driver.id } });
    const startDate = saved ? new Date(saved.startDate) : daysAgo(contract.daysRunning);
    startDate.setUTCHours(0, 0, 0, 0);
    let contractId: string;
    if (saved) {
      const updated = await prisma.contract.update({ where: { id: saved.id }, data: {
        weeklyValue: contract.weeklyValue, paymentDay: contract.paymentDay, startDate,
        deposit: contract.deposit, duration: contract.duration, status: 'Ativo', userId: user.id,
      } });
      contractId = updated.id;
    } else {
      const created = await prisma.contract.create({ data: {
        weeklyValue: contract.weeklyValue, paymentDay: contract.paymentDay, startDate,
        deposit: contract.deposit, duration: contract.duration, status: 'Ativo', userId: user.id,
        vehicleId: vehicle.id, driverId: driver.id,
      } });
      contractId = created.id;
    }

    const existingPayments = await prisma.payment.findMany({ where: { contractId }, select: { dueDate: true } });
    const missingPayments = buildSeedPayments({ ...contract, id: contractId, startDate }, existingPayments);
    if (missingPayments.length) await prisma.payment.createMany({ data: missingPayments, skipDuplicates: true });
  }

  const maintenanceData: Array<{
    vehiclePlate: string; type: MaintenanceType; description: string; cost: number;
    daysAgo: number; mileage: number; nextServiceMileage?: number; nextServiceDays?: number; notes: string;
  }> = [
    { vehiclePlate: 'RND1A23', type: MaintenanceType.TROCA_OLEO, description: 'Troca de óleo e filtros', cost: 420, daysAgo: 24, mileage: 17200, nextServiceMileage: 27200, nextServiceDays: 156, notes: 'Óleo 5W30 e filtros de óleo e ar substituídos.' },
    { vehiclePlate: 'RNE2B34', type: MaintenanceType.PREVENTIVA, description: 'Revisão preventiva de 40 mil km', cost: 1180, daysAgo: 12, mileage: 40100, nextServiceMileage: 50100, nextServiceDays: 168, notes: 'Revisados suspensão, correias, fluidos e sistema elétrico.' },
    { vehiclePlate: 'RNF3C45', type: MaintenanceType.PNEUS, description: 'Substituição dos pneus dianteiros', cost: 1460, daysAgo: 36, mileage: 9800, nextServiceMileage: 19800, notes: 'Par de pneus novo; alinhamento e balanceamento realizados.' },
    { vehiclePlate: 'RNG4D56', type: MaintenanceType.FREIOS, description: 'Troca de pastilhas e discos dianteiros', cost: 1320, daysAgo: 5, mileage: 87630, nextServiceMileage: 97630, nextServiceDays: 180, notes: 'Veículo em oficina para revisão final do conjunto de freios.' },
    { vehiclePlate: 'RNH5E67', type: MaintenanceType.TROCA_OLEO, description: 'Troca de óleo do motor', cost: 390, daysAgo: 48, mileage: 25100, nextServiceMileage: 35100, notes: 'Manutenção concluída sem apontamentos adicionais.' },
    { vehiclePlate: 'RNI6F78', type: MaintenanceType.CORRETIVA, description: 'Substituição da bateria', cost: 690, daysAgo: 9, mileage: 51340, notes: 'Bateria testada e substituída; alternador em condições normais.' },
    { vehiclePlate: 'RND1A23', type: MaintenanceType.PREVENTIVA, description: 'Alinhamento e balanceamento', cost: 180, daysAgo: 83, mileage: 15100, notes: 'Geometria corrigida após inspeção dos pneus.' },
    { vehiclePlate: 'RNF3C45', type: MaintenanceType.TROCA_OLEO, description: 'Troca de óleo e filtro', cost: 410, daysAgo: 96, mileage: 6200, nextServiceMileage: 16200, notes: 'Revisão periódica de rotina.' },
    { vehiclePlate: 'RNG4D56', type: MaintenanceType.PREVENTIVA, description: 'Revisão de 80 mil km', cost: 980, daysAgo: 121, mileage: 80100, nextServiceMileage: 90100, nextServiceDays: 150, notes: 'Inspeção de suspensão, correias, fluidos e sistema de arrefecimento.' },
    { vehiclePlate: 'RNG4D56', type: MaintenanceType.TROCA_OLEO, description: 'Troca de óleo e filtros', cost: 460, daysAgo: 61, mileage: 84300, nextServiceMileage: 94300, notes: 'Óleo e filtros substituídos em revisão de rotina.' },
    { vehiclePlate: 'RNH5E67', type: MaintenanceType.PNEUS, description: 'Substituição dos pneus traseiros', cost: 1390, daysAgo: 132, mileage: 21100, nextServiceMileage: 61100, notes: 'Dois pneus substituídos; alinhamento conferido.' },
    { vehiclePlate: 'RNI6F78', type: MaintenanceType.PREVENTIVA, description: 'Revisão de 50 mil km', cost: 1120, daysAgo: 47, mileage: 49800, nextServiceMileage: 59800, nextServiceDays: 140, notes: 'Revisados freios, suspensão, filtros e fluidos.' },
    { vehiclePlate: 'RNJ7G89', type: MaintenanceType.TROCA_OLEO, description: 'Troca de óleo e filtro', cost: 520, daysAgo: 16, mileage: 34100, nextServiceMileage: 44100, nextServiceDays: 165, notes: 'Óleo sintético e filtro do motor substituídos.' },
    { vehiclePlate: 'RNJ7G89', type: MaintenanceType.FREIOS, description: 'Inspeção do sistema de freios', cost: 340, daysAgo: 104, mileage: 29800, nextServiceMileage: 39800, notes: 'Pastilhas dianteiras verificadas; sem necessidade de troca.' },
    { vehiclePlate: 'RNK8H90', type: MaintenanceType.PREVENTIVA, description: 'Revisão de 20 mil km', cost: 890, daysAgo: 31, mileage: 19800, nextServiceMileage: 29800, nextServiceDays: 160, notes: 'Revisão programada com troca de filtros e inspeção geral.' },
    { vehiclePlate: 'RNL9J01', type: MaintenanceType.PNEUS, description: 'Alinhamento e balanceamento', cost: 220, daysAgo: 72, mileage: 64100, nextServiceMileage: 74100, notes: 'Alinhamento ajustado e balanceamento das quatro rodas.' },
    { vehiclePlate: 'RNL9J01', type: MaintenanceType.TROCA_OLEO, description: 'Troca de óleo do motor', cost: 480, daysAgo: 143, mileage: 59200, nextServiceMileage: 69200, notes: 'Manutenção periódica concluída sem ressalvas.' },
    { vehiclePlate: 'RNM0K12', type: MaintenanceType.PREVENTIVA, description: 'Revisão de 40 mil km', cost: 1260, daysAgo: 39, mileage: 41200, nextServiceMileage: 51200, nextServiceDays: 152, notes: 'Inspecionados pneus, freios, suspensão e ar-condicionado.' },
    { vehiclePlate: 'RNM0K12', type: MaintenanceType.CORRETIVA, description: 'Reparo do ar-condicionado', cost: 740, daysAgo: 118, mileage: 36700, notes: 'Carga de gás e substituição do filtro de cabine.' },
    { vehiclePlate: 'RNN1L23', type: MaintenanceType.TROCA_OLEO, description: 'Troca de óleo e filtros', cost: 510, daysAgo: 22, mileage: 15800, nextServiceMileage: 25800, nextServiceDays: 170, notes: 'Troca antecipada antes de novo contrato de locação.' },
    { vehiclePlate: 'RNN1L23', type: MaintenanceType.PNEUS, description: 'Rodízio e inspeção dos pneus', cost: 160, daysAgo: 96, mileage: 12100, nextServiceMileage: 22100, notes: 'Rodízio realizado e calibragem ajustada.' },
    { vehiclePlate: 'RNO2M34', type: MaintenanceType.PREVENTIVA, description: 'Revisão de 70 mil km', cost: 1480, daysAgo: 8, mileage: 73210, nextServiceMileage: 83210, nextServiceDays: 155, notes: 'Veículo aguardando conclusão de reparos preventivos na oficina.' },
    { vehiclePlate: 'RNO2M34', type: MaintenanceType.FREIOS, description: 'Substituição das pastilhas traseiras', cost: 690, daysAgo: 87, mileage: 68400, nextServiceMileage: 78400, notes: 'Pastilhas substituídas e fluido de freio revisado.' },
    { vehiclePlate: 'RNP3N45', type: MaintenanceType.TROCA_OLEO, description: 'Troca de óleo e filtro', cost: 470, daysAgo: 27, mileage: 36100, nextServiceMileage: 46100, nextServiceDays: 160, notes: 'Revisão de rotina antes da renovação do contrato.' },
    { vehiclePlate: 'RNP3N45', type: MaintenanceType.PREVENTIVA, description: 'Revisão de 30 mil km', cost: 1050, daysAgo: 111, mileage: 30100, nextServiceMileage: 40100, notes: 'Inspeção geral e substituição dos filtros de ar e cabine.' },
    { vehiclePlate: 'RNQ4P56', type: MaintenanceType.PREVENTIVA, description: 'Revisão de 90 mil km', cost: 1640, daysAgo: 20, mileage: 90800, nextServiceMileage: 100800, nextServiceDays: 145, notes: 'Revisados correias, embreagem, suspensão e sistema de arrefecimento.' },
    { vehiclePlate: 'RNQ4P56', type: MaintenanceType.CORRETIVA, description: 'Reparo da suspensão dianteira', cost: 1180, daysAgo: 152, mileage: 84200, notes: 'Buchas e bieletas substituídas; teste de rodagem aprovado.' },
    { vehiclePlate: 'RNR5Q67', type: MaintenanceType.TROCA_OLEO, description: 'Troca de óleo e filtro', cost: 560, daysAgo: 10, mileage: 13200, nextServiceMileage: 23200, nextServiceDays: 172, notes: 'Primeira revisão após entrada na frota.' },
    { vehiclePlate: 'RNR5Q67', type: MaintenanceType.PNEUS, description: 'Alinhamento preventivo', cost: 190, daysAgo: 76, mileage: 9100, nextServiceMileage: 19100, notes: 'Geometria e balanceamento revisados.' },
    { vehiclePlate: 'RNS6R78', type: MaintenanceType.PREVENTIVA, description: 'Revisão de 30 mil km', cost: 990, daysAgo: 19, mileage: 30100, nextServiceMileage: 40100, nextServiceDays: 162, notes: 'Filtros, fluidos e freios inspecionados.' },
    { vehiclePlate: 'RNS6R78', type: MaintenanceType.CORRETIVA, description: 'Substituição da bateria', cost: 720, daysAgo: 128, mileage: 26700, notes: 'Bateria substituída e sistema de carga testado.' },
    { vehiclePlate: 'RNT7S89', type: MaintenanceType.TROCA_OLEO, description: 'Troca de óleo e filtro', cost: 490, daysAgo: 46, mileage: 58200, nextServiceMileage: 68200, notes: 'Manutenção periódica concluída.' },
    { vehiclePlate: 'RNT7S89', type: MaintenanceType.FREIOS, description: 'Revisão do sistema de freios', cost: 310, daysAgo: 109, mileage: 54100, nextServiceMileage: 64100, notes: 'Pastilhas e discos medidos dentro da faixa de uso.' },
    { vehiclePlate: 'RNU8T90', type: MaintenanceType.PREVENTIVA, description: 'Revisão de 10 mil km', cost: 760, daysAgo: 14, mileage: 9800, nextServiceMileage: 19800, nextServiceDays: 175, notes: 'Inspeção inicial da frota e troca dos filtros.' },
    { vehiclePlate: 'RNU8T90', type: MaintenanceType.PNEUS, description: 'Inspeção e calibragem dos pneus', cost: 120, daysAgo: 93, mileage: 6100, nextServiceMileage: 16100, notes: 'Pneus em boas condições; pressão calibrada conforme especificação.' },
  ];
  for (const item of maintenanceData) {
    const vehicle = vehicleByPlate.get(item.vehiclePlate)!;
    const date = daysAgo(item.daysAgo);
    const existing = await prisma.maintenance.findFirst({
      where: { userId: user.id, vehicleId: vehicle.id, description: item.description },
    });
    const data = {
      type: item.type, description: item.description, cost: item.cost, date: existing?.date ?? date,
      mileage: item.mileage, nextServiceMileage: item.nextServiceMileage,
      nextServiceDate: existing ? existing.nextServiceDate : item.nextServiceDays === undefined ? null : daysFromNow(item.nextServiceDays),
      notes: item.notes, userId: user.id, vehicleId: vehicle.id,
    };
    if (existing) await prisma.maintenance.update({ where: { id: existing.id }, data });
    else await prisma.maintenance.create({ data });
  }

  const expenseData = [
    { vehiclePlate: 'RND1A23', type: 'COMBUSTIVEL', description: 'Abastecimento para retorno de locação', value: 245.8, daysAgo: 2 },
    { vehiclePlate: 'RNE2B34', type: 'LIMPEZA', description: 'Lavagem completa e higienização', value: 135, daysAgo: 1 },
    { vehiclePlate: 'RNF3C45', type: 'PEDAGIO', description: 'Pedágios de deslocamento para revisão', value: 78.4, daysAgo: 4 },
    { vehiclePlate: 'RNG4D56', type: 'MANUTENCAO', description: 'Mão de obra do conjunto de freios', value: 380, daysAgo: 5 },
    { vehiclePlate: 'RNH5E67', type: 'LIMPEZA', description: 'Lavagem após devolução do veículo', value: 95, daysAgo: 3 },
    { vehiclePlate: 'RNI6F78', type: 'DOCUMENTACAO', description: 'Taxa de vistoria veicular', value: 185, daysAgo: 8 },
    { vehiclePlate: 'RNJ7G89', type: 'COMBUSTIVEL', description: 'Abastecimento para entrega ao cliente', value: 220.5, daysAgo: 2 },
    { vehiclePlate: 'RNK8H90', type: 'LIMPEZA', description: 'Higienização interna preventiva', value: 145, daysAgo: 6 },
    { vehiclePlate: 'RNL9J01', type: 'PEDAGIO', description: 'Pedágios de vistoria em outra unidade', value: 62.7, daysAgo: 9 },
    { vehiclePlate: 'RNM0K12', type: 'MANUTENCAO', description: 'Carga de gás do ar-condicionado', value: 260, daysAgo: 7 },
    { vehiclePlate: 'RNN1L23', type: 'COMBUSTIVEL', description: 'Abastecimento antes de nova locação', value: 198.3, daysAgo: 3 },
    { vehiclePlate: 'RNO2M34', type: 'PECAS', description: 'Peças para revisão preventiva', value: 520, daysAgo: 1 },
    { vehiclePlate: 'RNP3N45', type: 'LIMPEZA', description: 'Lavagem externa e aspiração', value: 110, daysAgo: 5 },
    { vehiclePlate: 'RNQ4P56', type: 'MANUTENCAO', description: 'Alinhamento após reparo da suspensão', value: 190, daysAgo: 11 },
    { vehiclePlate: 'RNR5Q67', type: 'COMBUSTIVEL', description: 'Abastecimento de preparação de entrega', value: 235, daysAgo: 2 },
    { vehiclePlate: 'RNS6R78', type: 'LIMPEZA', description: 'Higienização após devolução', value: 125, daysAgo: 4 },
    { vehiclePlate: 'RNT7S89', type: 'DOCUMENTACAO', description: 'Emissão de segunda via documental', value: 92, daysAgo: 13 },
    { vehiclePlate: 'RNU8T90', type: 'COMBUSTIVEL', description: 'Abastecimento para vistoria de entrada', value: 176.9, daysAgo: 1 },
  ];
  for (const item of expenseData) {
    const vehicle = vehicleByPlate.get(item.vehiclePlate)!;
    const date = daysAgo(item.daysAgo);
    const existing = await prisma.expense.findFirst({
      where: { userId: user.id, vehicleId: vehicle.id, description: item.description },
    });
    const data = { type: item.type, description: item.description, value: item.value, date: existing?.date ?? date, userId: user.id, vehicleId: vehicle.id };
    if (existing) await prisma.expense.update({ where: { id: existing.id }, data });
    else await prisma.expense.create({ data });
  }

  console.log(`Seed concluído: ${vehicles.length} veículos, ${drivers.length} motoristas, ${contractData.length} contratos, ${maintenanceData.length} manutenções e ${expenseData.length} despesas.`);
}

client.$transaction(async (transaction) => {
  // Serialize seed executions so fixtures cannot be inserted twice concurrently.
  await transaction.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(827406)`;
  await main(transaction);
}, { timeout: 120000, maxWait: 10000 })
  .catch((error) => {
    console.error('Falha ao executar seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.$disconnect();
  });
