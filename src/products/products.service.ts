import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Query } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';
import {validate as isUUID} from 'uuid'
import { Product, ProductImage } from './entities';
import { User } from '../auth/entities';

@Injectable()
export class ProductsService {

  //Manejo de errores
  private readonly logger = new Logger('ProductsService')


  
  constructor(
    
  @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

  @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
  
    private readonly dataSource: DataSource,
  
  ){}
    
  async create(createProductDto: CreateProductDto, user: User) {

    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        user,
        images: images.map( image => this.productImageRepository.create({url: image})),
      });
      await this.productRepository.save(product);
      return {...product, images};
      
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset=0 } = paginationDto;

    const product = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      }
    });

    return product.map( product => ({...product, images: product.images.map( image => image.url)}));
  }

  async findOne(term: string) {
    let product: Product;
    if(isUUID(term)){
      product = await this.productRepository.findOneBy({ id: term });
    // } else {
    //   product = await this.productRepository.findOneBy({ slug: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('product');
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('product.images', 'images')
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`Product with ${term} not found`);
    }
    return product;
  }

  async findOnePlain( term: string) {
    const { images = [], ...product } = await this.findOne(term);
    return {
      ...product,
      images: images.map( image => image.url),
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {

    const { images, ...toUpdate } = updateProductDto;


    const product = await this.productRepository.preload({ id, ...toUpdate });

    if (!product) {
      throw new NotFoundException(`Product with id: ${id} not found`);
    }

    product.user = user;

    //Query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        
        product.images = images.map(
          image => this.productImageRepository.create({ url: image }));
      }


      await queryRunner.manager.save(product);
      // await this.productRepository.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);

    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBExceptions(error);
    }

  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return `This action removes a ${id} product`;
  }


  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Error creating product, check server logs');
  }


  //Delete todos los productos, solo para pruebas de desarrollo, no se debe usar en producción
  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
        .delete()
        .where({})
        .execute();

    } catch (error) {
      this.handleDBExceptions(error);
    }

  }
}
