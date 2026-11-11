import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiAcceptedResponse, ApiConflictResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { codeSchema } from '../catalog/catalog.schemas.js';
import { AdminOnly } from '../common/admin.decorator.js';
import { ApiZodBody } from '../common/api-zod-body.decorator.js';
import { ScraperService } from './scraper.service.js';

const idSchema = z.cuid();
const previewSchema = z.object({ storeCode: codeSchema, url: z.url({ protocol: /^https$/ }) });

@ApiTags('admin / scraper')
@AdminOnly()
@Controller('admin/scraper')
export class AdminScraperController {
  constructor(private readonly scraper: ScraperService) {}

  @Post('runs')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse({ description: 'Scrape run started in the background' })
  @ApiConflictResponse({ description: 'Another scrape run is in progress' })
  start() {
    return this.scraper.start();
  }

  @Get('runs')
  @ApiOkResponse({ description: 'Latest scrape runs' })
  runs() {
    return this.scraper.listRuns();
  }

  @Post('preview')
  @HttpCode(HttpStatus.OK)
  @ApiZodBody(previewSchema)
  @ApiOkResponse({ description: 'Fetches a product page and extracts its price without saving anything' })
  preview(@Body({ schema: previewSchema }) { storeCode, url }: z.infer<typeof previewSchema>) {
    return this.scraper.preview(storeCode, url);
  }

  @Post('listings/:id/check')
  @ApiOkResponse({ description: 'Scrapes a single listing immediately and records the observation' })
  check(@Param('id', { schema: idSchema }) id: string) {
    return this.scraper.checkListing(id);
  }
}
