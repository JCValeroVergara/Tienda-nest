import { Reflector } from '@nestjs/core';
import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from 'src/auth/entities';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    const validRoles = this.reflector.get<string[]>('roles', context.getHandler());
    
    // valida el rol del usuario
    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user)
      throw new BadRequestException('User not found');
    
    for (const role of user.roles) {
      if ( validRoles.includes(role) ) {
        return true;
      }
    }

    throw new ForbiddenException(
      `User with role ${user.fullName} need a valid role: ${validRoles.join(', ')}`,
    )
  }
}
