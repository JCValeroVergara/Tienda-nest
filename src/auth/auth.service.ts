import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

import * as bcrypt from 'bcrypt';
import {  CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    
    private jwtService: JwtService,
    
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
      
      return {
        ...user,
        token: this.getJwtToken({  id: user.id}),
      };
      
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true},
    });

    if (!user) 
      throw new BadRequestException('Invalid credentials(Email)');
    
    if (!bcrypt.compareSync(password, user.password))
      throw new BadRequestException('Invalid credentials(Pass)');

    return {
      ...user,
      token: this.getJwtToken({ id: user.id}),
    };
  }

  async checkAuthStatus( user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id}),
    };
  }

  private getJwtToken(payload : JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
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
