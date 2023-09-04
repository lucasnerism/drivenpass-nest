import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { Request, Response } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { authorization } = request.headers;
    const token = authorization?.split(' ')[1];

    try {
      const data = this.authService.checkToken(token);
      const user = await this.usersService.findOne(parseInt(data.id));
      response.locals.user = user;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
      return false;
    }

    return true;
  }
}
