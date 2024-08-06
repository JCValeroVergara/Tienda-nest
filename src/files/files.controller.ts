import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, fileNamer } from './helpers';
import { diskStorage } from 'multer';
import { Response } from 'express';
<<<<<<< HEAD
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files - Get and Upload')
=======
import { ConfigService } from '@nestjs/config';

@ApiTags('Files Upload')
>>>>>>> 7b42464aa706ac545888615d4b2aa2c0e9c3e98b
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) { }
  
  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string) {
    
    const path = this.filesService.getStaticProductImage(imageName);
    
    res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors( FileInterceptor('file',
    {
      fileFilter: fileFilter,
      // limits: { fileSize: 1024 * 1024 * 5 },
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer
      })
    }))
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File
  ) {

    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
      }
    
    // const secureUrl = `${file.filename}`
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`

    return {
      secureUrl
    }
  }

} 
