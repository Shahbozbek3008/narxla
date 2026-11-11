import { Controller, Get, Header, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { AppConfigService } from '../config/app-config.service.js';
import { PricesService } from './prices.service.js';

const codeSchema = z.string().regex(/^[a-z0-9-]{2,64}$/);

@ApiTags('prices')
@Controller('prices')
export class PricesController {
  constructor(
    private readonly prices: PricesService,
    private readonly config: AppConfigService,
  ) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
  @ApiOkResponse({ description: 'Current price quotes for every material' })
  async list() {
    const items = await this.prices.quotes();
    return {
      generatedAt: new Date().toISOString(),
      freshDays: this.config.pricing.freshDays,
      minSources: this.config.pricing.minSources,
      items,
    };
  }

  @Get(':code')
  @ApiOkResponse({ description: 'Price quote for a single material with its sources' })
  @ApiNotFoundResponse()
  quote(@Param('code', { schema: codeSchema }) code: string) {
    return this.prices.quote(code);
  }
}
