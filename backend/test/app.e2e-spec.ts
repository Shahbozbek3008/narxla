import { type INestApplication, StandardSchemaValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { ADMIN_KEY_HEADER } from '../src/common/admin-key.guard.js';
import { PrismaExceptionFilter } from '../src/common/prisma-exception.filter.js';
import { AppConfigService } from '../src/config/app-config.service.js';

describe('Smetachi API (e2e)', () => {
  let app: INestApplication<App>;
  let adminKey: string;

  beforeAll(async () => {
    process.env.SCRAPER_ENABLED = 'false';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new StandardSchemaValidationPipe());
    app.useGlobalFilters(new PrismaExceptionFilter());
    await app.init();
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
