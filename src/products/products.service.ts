import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from 'generated/prisma/client';
import { PaginationDto } from '../common/dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');

  async onModuleInit() {
    this.$connect();
    this.logger.debug('database connection started');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const totalProducts = await this.product.count({
      where: { available: true },
    });
    const lastPage = Math.ceil(totalProducts / limit);

    return {
      data: await this.product.findMany({
        take: limit,
        skip: (page - 1) * limit,
        where: { available: true },
      }),
      meta: {
        totalProducts,
        lastPage,
        page,
      },
    };
  }

  async findOne(id: number) {
    const producto = await this.product.findUnique({
      where: { id, available: true },
    });

    if (!producto) {
      throw new NotFoundException(`Product with id #${id} not found`);
    }
    return producto;
  }

  async update( updateProductDto: UpdateProductDto) {
    const { id, ...data } = updateProductDto;

    await this.findOne(id);

    return this.product.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.product.update({
      where: { id },
      data: {
        available: false,
      },
    });
  }
}
