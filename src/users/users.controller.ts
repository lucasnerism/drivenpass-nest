import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { User } from '../decorators/user.decorator';
import { User as UserPrisma } from '@prisma/client';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { DeleteUserDto } from './dto/delete-user.dto';

@ApiTags('erase')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('erase')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete all user data' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Everything was deleted',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Wrong password',
  })
  remove(@Body() deleteUserDto: DeleteUserDto, @User() user: UserPrisma) {
    return this.usersService.eraseUserData(user.id, deleteUserDto.password);
  }
}
