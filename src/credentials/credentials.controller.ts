import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { User } from '../decorators/user.decorator';
import { User as UserPrisma } from '@prisma/client';

@ApiTags('credentials')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new credential' })
  create(
    @Body() createCredentialDto: CreateCredentialDto,
    @User() user: UserPrisma,
  ) {
    return this.credentialsService.create(createCredentialDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users credentials' })
  findAll(@User() user: UserPrisma) {
    return this.credentialsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get said credential if belongs to user' })
  @ApiParam({ name: 'id', description: "credential's id", example: 1 })
  findOne(@Param('id', ParseIntPipe) id: string, @User() user: UserPrisma) {
    return this.credentialsService.findOne(+id, user.id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateCredentialDto: UpdateCredentialDto,
    @User() user: UserPrisma,
  ) {
    return this.credentialsService.update(+id, updateCredentialDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete said credential if belongs to user' })
  @ApiParam({ name: 'id', description: "credential's id", example: 1 })
  remove(@Param('id', ParseIntPipe) id: string, @User() user: UserPrisma) {
    return this.credentialsService.remove(+id, user.id);
  }
}
