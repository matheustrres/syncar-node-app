import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { setup, teardown } from '../setup.ts';

let server;
let prisma;
let origin;
let logs = '';

async function freePort() {
  const socket = createServer();
  await new Promise((resolve) => socket.listen(0, '127.0.0.1', resolve));
  const port = socket.address().port;
  await new Promise((resolve) => socket.close(resolve));
  return port;
}

async function ready(url) {
  for (let attempt = 0; attempt < 90; attempt++) {
    if (server.exitCode !== null) throw new Error(`Next encerrou antes de iniciar:\n${logs}`);
    try {
      const response = await fetch(`${url}/api/auth/providers`);
      if (response.ok) return;
    } catch { /* servidor ainda iniciando */ }
    await delay(1000);
  }
  throw new Error(`Next não iniciou em 90s:\n${logs}`);
}

async function post(path, body, ip) {
  return fetch(`${origin}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-real-ip': ip },
    body: JSON.stringify(body),
  });
}

async function login(email, password, ip) {
  const csrfResponse = await fetch(`${origin}/api/auth/csrf`);
  assert.equal(csrfResponse.status, 200);
  const { csrfToken } = await csrfResponse.json();
  const cookies = csrfResponse.headers.getSetCookie().map((cookie) => cookie.split(';')[0]).join('; ');
  const form = new URLSearchParams({ csrfToken, email, password, callbackUrl: `${origin}/dashboard`, json: 'true' });
  const response = await fetch(`${origin}/api/auth/callback/credentials?json=true`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', cookie: cookies, 'x-real-ip': ip },
    body: form,
    redirect: 'manual',
  });
  const result = await response.json();
  return result.url;
}

test.before(async () => {
  await setup();
  prisma = new PrismaClient();
  const port = await freePort();
  origin = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '-p', String(port)], {
    cwd: process.cwd(),
    env: { ...process.env, NEXTAUTH_URL: origin, NEXT_TELEMETRY_DISABLED: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  for (const stream of [server.stdout, server.stderr]) {
    stream.on('data', (chunk) => { logs = (logs + chunk.toString()).slice(-12000); });
  }
  await ready(origin);
});

test.after(async () => {
  server?.kill();
  await prisma?.$disconnect();
  await teardown();
});

test('cadastro: 5 tentativas por IP e Retry-After na sexta', async () => {
  const ip = `register-${randomUUID()}`;
  const id = randomUUID();
  const registration = {
    name: 'Cadastro Test', email: `register-${id}@example.test`,
    password: 'Strong!Pass2!', confirmPassword: 'Strong!Pass2!',
    companyName: `Register ${id}`, phone: id.replaceAll('-', '').slice(0, 20),
  };
  assert.equal((await post('/api/register', registration, ip)).status, 200);
  assert.equal((await prisma.user.findUnique({ where: { email: registration.email } })).email, registration.email);
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await post('/api/register', {}, ip);
    assert.equal(response.status, 400);
  }
  const blocked = await post('/api/register', {}, ip);
  assert.equal(blocked.status, 429);
  assert.ok(Number(blocked.headers.get('retry-after')) > 0);
  assert.equal((await post('/api/register', {}, `register-${randomUUID()}`)).status, 400);
});

test('recuperação: limite por conta preserva resposta genérica; limite por IP retorna 429', async () => {
  const ip = `forgot-${randomUUID()}`;
  const email = `absent-${randomUUID()}@example.test`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await post('/api/auth/forgot-password', { email }, ip);
    assert.equal(response.status, 200);
    assert.match((await response.json()).message, /Se o email estiver cadastrado/);
  }
  assert.equal((await post('/api/auth/forgot-password', { email: `other-${randomUUID()}@example.test` }, ip)).status, 200);
  const blocked = await post('/api/auth/forgot-password', { email: `last-${randomUUID()}@example.test` }, ip);
  assert.equal(blocked.status, 429);
  assert.ok(Number(blocked.headers.get('retry-after')) > 0);
});

test('reset: limite por token funciona entre IPs e bloqueia antes de consultar o banco', async () => {
  const token = randomUUID().replaceAll('-', '').padEnd(64, '0');
  for (let attempt = 0; attempt < 5; attempt++) {
    const response = await post('/api/auth/reset-password', { token, password: 'Strong!Pass2!' }, `reset-${randomUUID()}`);
    assert.equal(response.status, 400);
  }
  const blocked = await post('/api/auth/reset-password', { token, password: 'Strong!Pass2!' }, `reset-${randomUUID()}`);
  assert.equal(blocked.status, 429);
  assert.ok(Number(blocked.headers.get('retry-after')) > 0);
});

test('reset válido altera o hash e consome o token', async () => {
  const id = randomUUID();
  const user = await prisma.user.create({ data: {
    name: 'Reset Test', email: `reset-${id}@example.test`,
    password: await bcrypt.hash('Old!Password2', 10),
    companyName: `Reset ${id}`, phone: id.replaceAll('-', '').slice(0, 20),
  } });
  const token = randomUUID().replaceAll('-', '').padEnd(64, '0');
  await prisma.passwordResetToken.create({ data: {
    token, userId: user.id, expires: new Date(Date.now() + 60000),
  } });
  const response = await post('/api/auth/reset-password', { token, password: 'New!Password2!' }, `reset-${randomUUID()}`);
  assert.equal(response.status, 200);
  assert.equal(await bcrypt.compare('New!Password2!', (await prisma.user.findUnique({ where: { id: user.id } })).password), true);
  assert.equal(await prisma.passwordResetToken.findUnique({ where: { token } }), null);
});

test('login: dez falhas por conta impedem senha correta de autenticar', async () => {
  const id = randomUUID();
  const email = `login-${id}@example.test`;
  const password = 'Strong!Pass2!';
  await prisma.user.create({ data: {
    name: 'Login Test', email, password: await bcrypt.hash(password, 10),
    companyName: `Company ${id}`, phone: id.replaceAll('-', '').slice(0, 20),
  } });
  assert.match(await login(email, password, `login-${randomUUID()}`), /\/dashboard/);
  for (let attempt = 0; attempt < 10; attempt++) {
    const url = await login(email, 'wrong-password', `login-${randomUUID()}`);
    assert.match(url, /CredentialsSignin/);
  }
  const blocked = await login(email, password, `login-${randomUUID()}`);
  assert.match(blocked, /CredentialsSignin/);
});
