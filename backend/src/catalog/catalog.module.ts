import { Module } from '@nestjs/common';
import { PricesModule } from '../prices/prices.module.js';
import { AdminCatalogController } from './admin-catalog.controller.js';
import { CatalogService } from './catalog.service.js';
import { ProductsService } from './products.service.js';

@Module({
  imports: [PricesModule],
  controllers: [AdminCatalogController],
  providers: [CatalogService, ProductsService],
})
export class CatalogModule {}
