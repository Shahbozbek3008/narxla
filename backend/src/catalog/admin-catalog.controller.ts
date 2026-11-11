import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../common/admin.decorator.js';
import { ApiZodBody } from '../common/api-zod-body.decorator.js';
import {
  codeSchema,
  createListingSchema,
  createMaterialSchema,
  createStoreSchema,
  idSchema,
  listListingsQuerySchema,
  manualObservationSchema,
  updateListingSchema,
  updateMaterialSchema,
  updateStoreSchema,
  type CreateListing,
  type CreateMaterial,
  type CreateStore,
  type ListListingsQuery,
  type ManualObservation,
  type UpdateListing,
  type UpdateMaterial,
  type UpdateStore,
} from './catalog.schemas.js';
import { CatalogService } from './catalog.service.js';

@ApiTags('admin / catalog')
@AdminOnly()
@Controller('admin')
export class AdminCatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('materials')
  listMaterials() {
    return this.catalog.listMaterials();
  }

  @Post('materials')
  @ApiZodBody(createMaterialSchema)
  createMaterial(@Body({ schema: createMaterialSchema }) body: CreateMaterial) {
    return this.catalog.createMaterial(body);
  }

  @Patch('materials/:code')
  @ApiZodBody(updateMaterialSchema)
  updateMaterial(@Param('code', { schema: codeSchema }) code: string, @Body({ schema: updateMaterialSchema }) body: UpdateMaterial) {
    return this.catalog.updateMaterial(code, body);
  }

  @Get('stores')
  listStores() {
    return this.catalog.listStores();
  }

  @Post('stores')
  @ApiZodBody(createStoreSchema)
  createStore(@Body({ schema: createStoreSchema }) body: CreateStore) {
    return this.catalog.createStore(body);
  }

  @Patch('stores/:code')
  @ApiZodBody(updateStoreSchema)
  updateStore(@Param('code', { schema: codeSchema }) code: string, @Body({ schema: updateStoreSchema }) body: UpdateStore) {
    return this.catalog.updateStore(code, body);
  }

  @Get('listings')
  listListings(@Query({ schema: listListingsQuerySchema }) query: ListListingsQuery) {
    return this.catalog.listListings(query);
  }

  @Post('listings')
  @ApiZodBody(createListingSchema)
  createListing(@Body({ schema: createListingSchema }) body: CreateListing) {
    return this.catalog.createListing(body);
  }

  @Patch('listings/:id')
  @ApiZodBody(updateListingSchema)
  updateListing(@Param('id', { schema: idSchema }) id: string, @Body({ schema: updateListingSchema }) body: UpdateListing) {
    return this.catalog.updateListing(id, body);
  }

  @Delete('listings/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteListing(@Param('id', { schema: idSchema }) id: string) {
    return this.catalog.deleteListing(id);
  }

  @Post('listings/:id/observations')
  @ApiZodBody(manualObservationSchema)
  recordManualPrice(@Param('id', { schema: idSchema }) id: string, @Body({ schema: manualObservationSchema }) body: ManualObservation) {
    return this.catalog.recordManualPrice(id, body);
  }
}
