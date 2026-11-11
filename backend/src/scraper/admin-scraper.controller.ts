import { Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiAcceptedResponse, ApiConflictResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { AdminOnly } from '../common/admin.decorator.js';
import { ScraperService } from './scraper.service.js';

const idSchema = z.cuid();

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

  @Post('listings/:id/check')
  @ApiOkResponse({ description: 'Scrapes a single listing immediately and records the observation' })
  check(@Param('id', { schema: idSchema }) id: string) {
    return this.scraper.checkListing(id);
  }
}
