import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { ADMIN_KEY_HEADER } from '../src/common/admin-key.guard.js';
import { AppConfigService } from '../src/config/app-config.service.js';
import { createTestApp } from './create-app.js';

describe('Smetachi API (e2e)', () => {
  let app: INestApplication<App>;
  let adminKey: string;

  beforeAll(async () => {
    ({ app } = await createTestApp());
    adminKey = app.get(AppConfigService).adminApiKey;
  });

  afterAll(async () => {
    await app.close();
  });

  it('reports a healthy database', async () => {
    const response = await request(app.getHttpServer()).get('/api/health').expect(200);
    expect(response.body.info.database.status).toBe('up');
  });

  it('lists price quotes for seeded materials', async () => {
    const response = await request(app.getHttpServer()).get('/api/prices').expect(200);
    expect(response.headers['cache-control']).toContain('max-age=300');
    expect(response.body.items.length).toBeGreaterThan(0);
    expect(response.body.items[0]).toMatchObject({
      code: expect.any(String),
      price: expect.any(Number),
      status: expect.stringMatching(/^(verified|partial|estimated)$/),
    });
  });

  it('returns a single quote and 404 for unknown materials', async () => {
    await request(app.getHttpServer()).get('/api/prices/rotband-30').expect(200);
    await request(app.getHttpServer()).get('/api/prices/unknown-material').expect(404);
  });

  it('rejects admin requests without a valid key', async () => {
    await request(app.getHttpServer()).get('/api/admin/materials').expect(401);
    await request(app.getHttpServer()).get('/api/admin/materials').set(ADMIN_KEY_HEADER, 'wrong').expect(401);
    await request(app.getHttpServer()).get('/api/admin/materials').set(ADMIN_KEY_HEADER, adminKey).expect(200);
  });

  it('validates price reports', async () => {
    await request(app.getHttpServer()).post('/api/price-reports').send({ comment: 'missing estimate' }).expect(400);
    await request(app.getHttpServer()).post('/api/price-reports').send({ estimateId: 'demo', materialCode: 'rotband-30' }).expect(202);
  });

  it('enforces store hosts on listings', async () => {
    await request(app.getHttpServer())
      .post('/api/admin/listings')
      .set(ADMIN_KEY_HEADER, adminKey)
      .send({ materialCode: 'rotband-30', storeCode: 'prom-uz', url: 'https://evil.example.com/rotband' })
      .expect(400);
  });

  it('manages products of a material and links listings to them', async () => {
    const admin = (method: 'get' | 'post' | 'patch' | 'delete', path: string) =>
      request(app.getHttpServer())[method](`/api/admin${path}`).set(ADMIN_KEY_HEADER, adminKey);
    const brand = `Probe ${Date.now()}`;

    const created = await admin('post', '/products')
      .send({ materialCode: 'rotband-30', brand: `  ${brand} `, name: 'Rotband   30 kg', packSize: 30, tier: 'mid' })
      .expect(201);
    expect(created.body).toMatchObject({ brand, name: 'Rotband 30 kg', packSize: 30, tier: 'mid', listings: 0, price: null });

    await admin('post', '/products').send({ materialCode: 'rotband-30', brand: brand.toUpperCase(), name: 'rotband 30 KG' }).expect(409);

    const listing = await admin('post', '/listings')
      .send({ materialCode: 'rotband-30', storeCode: 'prom-uz', productId: created.body.id, url: `https://prom.uz/probe-${Date.now()}` })
      .expect(201);
    expect(Number(listing.body.packSize)).toBe(30);
    expect(listing.body.productId).toBe(created.body.id);

    const products = await admin('get', '/materials/rotband-30/products').expect(200);
    expect(products.body.find((item: { id: string }) => item.id === created.body.id)).toMatchObject({ listings: 1 });

    await admin('patch', `/products/${created.body.id}`).send({ active: false }).expect(200);
    await admin('delete', `/products/${created.body.id}`).expect(204);
    const orphan = await admin('get', '/listings?materialCode=rotband-30').expect(200);
    expect(orphan.body.find((item: { id: string }) => item.id === listing.body.id)).toMatchObject({ product: null });
    await admin('delete', `/listings/${listing.body.id}`).expect(204);
  });

  it('publishes labour rates with their range', async () => {
    const response = await request(app.getHttpServer()).get('/api/labour-rates').expect(200);
    const tiling = response.body.items.find((item: { code: string }) => item.code === 'floor-tiling');
    expect(tiling).toMatchObject({ unit: 'm²', min: expect.any(Number), price: expect.any(Number), max: expect.any(Number) });
    expect(tiling.min).toBeLessThanOrEqual(tiling.price);
    expect(tiling.price).toBeLessThanOrEqual(tiling.max);
  });

  it('rejects labour rate updates that break the range', async () => {
    await request(app.getHttpServer())
      .patch('/api/admin/labour-rates/floor-tiling')
      .set(ADMIN_KEY_HEADER, adminKey)
      .send({ price: 999_999_999 })
      .expect(400);
  });
});
