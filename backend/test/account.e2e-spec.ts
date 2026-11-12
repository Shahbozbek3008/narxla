import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { SESSION_COOKIE } from '../src/auth/session-cookie.js';
import { ADMIN_KEY_HEADER } from '../src/common/admin-key.guard.js';
import { AppConfigService } from '../src/config/app-config.service.js';
import { type CapturingSmsSender, createTestApp } from './create-app.js';

const INPUT = {
  room: 'yotoq',
  L: 4.2,
  W: 3.5,
  H: 2.7,
  doors: 1,
  windows: 1,
  works: { pol: true, devor: true, shift: true, elektr: true, santex: false },
  quality: 'mid',
};

const randomPhone = () => `90${String(Math.floor(Math.random() * 1e7)).padStart(7, '0')}`;
const fullPhone = (local: string) => `+998${local}`;

describe('Accounts and estimates (e2e)', () => {
  let app: INestApplication<App>;
  let sms: CapturingSmsSender;
  let adminKey: string;

  async function signIn(local = randomPhone()) {
    const agent = request.agent(app.getHttpServer());
    await agent.post('/api/auth/otp').send({ phone: local }).expect(202);
    const response = await agent
      .post('/api/auth/otp/verify')
      .send({ phone: local, code: sms.lastCodeFor(fullPhone(local)) })
      .expect(200);
    return { agent, profile: response.body, local };
  }

  beforeAll(async () => {
    ({ app, sms } = await createTestApp());
    adminKey = app.get(AppConfigService).adminApiKey;
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects anonymous access with a machine-readable code', async () => {
    const response = await request(app.getHttpServer()).get('/api/me').expect(401);
    expect(response.body.code).toBe('UNAUTHENTICATED');
    await request(app.getHttpServer()).get('/api/estimates').expect(401);
  });

  it('validates phone numbers', async () => {
    await request(app.getHttpServer()).post('/api/auth/otp').send({ phone: '12345' }).expect(400);
  });

  it('signs in with a one-time code and guards against misuse', async () => {
    const local = randomPhone();
    const agent = request.agent(app.getHttpServer());

    const requested = await agent.post('/api/auth/otp').send({ phone: local }).expect(202);
    expect(requested.body).toMatchObject({ expiresIn: 300, resendIn: 60 });

    const cooldown = await agent.post('/api/auth/otp').send({ phone: local }).expect(429);
    expect(cooldown.body).toMatchObject({ code: 'OTP_COOLDOWN', retryAfter: expect.any(Number) });

    const code = sms.lastCodeFor(fullPhone(local));
    const wrong = code === '000000' ? '111111' : '000000';
    const invalid = await agent.post('/api/auth/otp/verify').send({ phone: local, code: wrong }).expect(400);
    expect(invalid.body).toMatchObject({ code: 'OTP_INVALID', attemptsLeft: 4 });

    const verified = await agent.post('/api/auth/otp/verify').send({ phone: local, code }).expect(200);
    const cookie = String(verified.headers['set-cookie']);
    expect(cookie).toContain(`${SESSION_COOKIE}=`);
    expect(cookie).toContain('HttpOnly');
    expect(verified.body).toMatchObject({ phone: fullPhone(local), plan: { kind: 'free' }, usage: { estimates: 0, limit: 3 } });

    const reused = await request(app.getHttpServer()).post('/api/auth/otp/verify').send({ phone: local, code }).expect(400);
    expect(reused.body.code).toBe('OTP_EXPIRED');

    await agent.get('/api/me').expect(200);
  });

  it('updates the profile with validation', async () => {
    const { agent } = await signIn();
    const updated = await agent.patch('/api/me').send({ name: 'Dilshod Rahimov', reserve: 15, quality: 'pre' }).expect(200);
    expect(updated.body).toMatchObject({ name: 'Dilshod Rahimov', reserve: 15, quality: 'pre' });
    await agent.patch('/api/me').send({ reserve: 12 }).expect(400);
    await agent.patch('/api/me').send({ plan: 'pro' }).expect(400);
  });

  it('manages estimates within plan limits and shares them publicly', async () => {
    const { agent, profile } = await signIn();

    const ids: string[] = [];
    for (const name of ['Yotoqxona', 'Oshxona', 'Hammom']) {
      const created = await agent.post('/api/estimates').send({ name, input: INPUT }).expect(201);
      ids.push(created.body.id);
    }
    const limited = await agent.post('/api/estimates').send({ name: 'Koridor', input: INPUT }).expect(403);
    expect(limited.body).toMatchObject({ code: 'PLAN_LIMIT', limit: 3 });

    await agent.post('/api/estimates').send({ name: 'Bad', input: { ...INPUT, L: 0 } }).expect(400);

    const list = await agent.get('/api/estimates').expect(200);
    expect(list.body.map((item: { name: string }) => item.name)).toEqual(['Hammom', 'Oshxona', 'Yotoqxona']);

    const patched = await agent.patch(`/api/estimates/${ids[0]}`).send({ status: 'sent' }).expect(200);
    expect(patched.body.status).toBe('sent');

    const shared = await agent.post(`/api/estimates/${ids[0]}/share`).expect(200);
    const token: string = shared.body.shareToken;
    const publicView = await request(app.getHttpServer()).get(`/api/shared/${token}`).expect(200);
    expect(publicView.body).toMatchObject({ name: 'Yotoqxona', input: INPUT });
    expect(publicView.body).not.toHaveProperty('shareToken');

    await agent.delete(`/api/estimates/${ids[0]}/share`).expect(200);
    await request(app.getHttpServer()).get(`/api/shared/${token}`).expect(404);

    const stranger = await signIn();
    await stranger.agent.get(`/api/estimates/${ids[1]}`).expect(404);
    await stranger.agent.delete(`/api/estimates/${ids[1]}`).expect(404);

    const granted = await request(app.getHttpServer())
      .post(`/api/admin/users/${profile.id}/plan`)
      .set(ADMIN_KEY_HEADER, adminKey)
      .send({ plan: 'pro' })
      .expect(201);
    expect(granted.body).toMatchObject({ plan: { kind: 'pro' }, usage: { limit: null } });

    await agent.post('/api/estimates').send({ name: 'Koridor', input: INPUT }).expect(201);
    const payments = await agent.get('/api/me/payments').expect(200);
    expect(payments.body).toEqual([expect.objectContaining({ plan: 'pro', amount: 129000, provider: 'manual' })]);

    await agent.delete(`/api/estimates/${ids[2]}`).expect(204);
    await agent.get(`/api/estimates/${ids[2]}`).expect(404);
  });

  it('signs out and deletes the account', async () => {
    const session = await signIn();
    await session.agent.post('/api/auth/logout').expect(204);
    await session.agent.get('/api/me').expect(401);

    const doomed = await signIn();
    await doomed.agent.post('/api/estimates').send({ name: 'Temp', input: INPUT }).expect(201);
    await doomed.agent.delete('/api/me').expect(204);
    await doomed.agent.get('/api/me').expect(401);
  });

  it('reports Telegram sign-in as unavailable without a bot token', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/telegram')
      .send({ id: 1, first_name: 'Test', auth_date: Math.floor(Date.now() / 1000), hash: 'a'.repeat(64) })
      .expect(503);
    expect(response.body.code).toBe('TELEGRAM_DISABLED');
  });
});
