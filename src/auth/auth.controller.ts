import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, SetMetadata } from '@nestjs/common';
<<<<<<< HEAD
import { ApiTags } from '@nestjs/swagger';
=======
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

>>>>>>> 7b42464aa706ac545888615d4b2aa2c0e9c3e98b
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';

import { AuthGuard } from '@nestjs/passport';
import { User } from './entities';
import { RawHeaders, GetUser, Auth } from './decorators';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';


@ApiTags('Auth')
<<<<<<< HEAD
=======
@ApiBearerAuth()
>>>>>>> 7b42464aa706ac545888615d4b2aa2c0e9c3e98b
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User,
  ) {
    return this.authService.checkAuthStatus( user);
  }

  @Get('private')
  @UseGuards(AuthGuard()) // 👈 Add this line
  testingPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,

    @RawHeaders() rawHeaders: string[],
  ) {
    return {
      ok: true,
      message: 'You have access to this route',
      user,
      userEmail,
      rawHeaders,
    };
  }

  // @SetMetadata('roles', ['admin']) // 👈 Add this line
  @Get('private2')
  @RoleProtected(ValidRoles.ADMIN) // 👈 Add this line
  @UseGuards(AuthGuard(), UserRoleGuard) // 👈 Add this line
  testingPrivateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }

  @Get('private3')
  @Auth( ValidRoles.ADMIN) // 👈 Add this line
  testingPrivateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }
}