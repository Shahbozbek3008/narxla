import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiError } from '../common/api-error.js';
import type { Prisma } from '../generated/prisma/client.js';
import { PricesService } from '../prices/prices.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateProduct, UpdateProduct } from './catalog.schemas.js';

const productInclude = {
  listings: {
    where: { active: true },
    select: {
      observations: {
        where: { status: 'ACCEPTED' },
        orderBy: { observedAt: 'desc' },
        take: 1,
        select: { unitPrice: true },
      },
    },
  },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function toView({ listings, packSize, materialId: _materialId, ...product }: ProductRow) {
  const prices = listings.flatMap(({ observations: [latest] }) => (latest ? [latest.unitPrice] : []));
  return {
    ...product,
    packSize: packSize.toNumber(),
    listings: listings.length,
    price: prices.length > 0 ? { min: Math.min(...prices), max: Math.max(...prices), sources: prices.length } : null,
  };
}

export type ProductView = ReturnType<typeof toView>;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prices: PricesService,
  ) {}

  async listByMaterial(materialCode: string) {
    const material = await this.prisma.material.findUniqueOrThrow({ where: { code: materialCode }, select: { id: true } });
    const products = await this.prisma.product.findMany({
      where: { materialId: material.id },
      orderBy: [{ active: 'desc' }, { brand: 'asc' }, { name: 'asc' }],
      include: productInclude,
    });
    return products.map(toView);
  }

  async create({ materialCode, ...data }: CreateProduct) {
    const material = await this.prisma.material.findUniqueOrThrow({ where: { code: materialCode }, select: { id: true } });
    await this.assertUnique(material.id, data.brand, data.name);
    const product = await this.prisma.product.create({ data: { ...data, materialId: material.id }, include: productInclude });
    return toView(product);
  }

  async update(id: string, data: UpdateProduct) {
    const current = await this.prisma.product.findUniqueOrThrow({ where: { id } });
    if (data.brand !== undefined || data.name !== undefined) {
      await this.assertUnique(current.materialId, data.brand ?? current.brand, data.name ?? current.name, id);
    }
    const product = await this.prisma.product.update({ where: { id }, data, include: productInclude });
    this.prices.invalidate();
    return toView(product);
  }

  async remove(id: string) {
    await this.prisma.product.delete({ where: { id } });
    this.prices.invalidate();
  }

  async assertBelongs(productId: string, materialId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId }, select: { materialId: true, packSize: true } });
    if (!product || product.materialId !== materialId) {
      throw new ApiError(HttpStatus.BAD_REQUEST, 'PRODUCT_MISMATCH', 'The product does not belong to this material');
    }
    return product;
  }

  private async assertUnique(materialId: string, brand: string, name: string, exceptId?: string) {
    const duplicate = await this.prisma.product.findFirst({
      where: {
        materialId,
        brand: { equals: brand, mode: 'insensitive' },
        name: { equals: name, mode: 'insensitive' },
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
      select: { id: true },
    });
    if (duplicate) throw new ApiError(HttpStatus.CONFLICT, 'PRODUCT_EXISTS', 'This product already exists for the material');
  }
}
