import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

import * as bcrypt from 'bcrypt';
import {  CreateUserDto, LoginUserDto } from './dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    
  ) {}

  async create(createUserDto: CreateUserDto) {
    
    try {

      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      
      });

      await this.userRepository.save(user)
      delete user.password;
      
      return user;
      
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true },
    });

    if (!user) 
      throw new BadRequestException('Invalid credentials(Email)');
    
    if (!bcrypt.compareSync(password, user.password))
      throw new BadRequestException('Invalid credentials(Pass)');

    return user;
  }


  private handleDBError(error: any) : never{
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    } else {
      console.log(error);
      throw new InternalServerErrorException('Please check server logs');
    }
  }

  
}
