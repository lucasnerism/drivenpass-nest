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
  HttpStatus,
} from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
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
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Credential was created',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Body was invalid',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Duplicate credential title',
  })
  create(
    @Body() createCredentialDto: CreateCredentialDto,
    @User() user: UserPrisma,
  ) {
    return this.credentialsService.create(createCredentialDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all credentials that belongs to user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Got the credentials' })
  findAll(@User() user: UserPrisma) {
    return this.credentialsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get said credential if belongs to user' })
  @ApiParam({ name: 'id', description: "credential's id", example: 1 })
  @ApiResponse({ status: HttpStatus.OK, description: 'Got the credential' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Credential didnt belong to user',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Credential didnt exist',
  })
  findOne(@Param('id', ParseIntPipe) id: string, @User() user: UserPrisma) {
    return this.credentialsService.findOne(+id, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update said credential if belongs to user' })
  @ApiParam({ name: 'id', description: "credential's id", example: 1 })
  @ApiResponse({ status: HttpStatus.OK, description: 'Updated the credential' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Credential didnt belong to user',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Credential didnt exist',
  })
  update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateCredentialDto: CreateCredentialDto,
    @User() user: UserPrisma,
  ) {
    return this.credentialsService.update(+id, updateCredentialDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete said credential if belongs to user' })
  @ApiParam({ name: 'id', description: "credential's id", example: 1 })
  @ApiResponse({ status: HttpStatus.OK, description: 'Deleted the credential' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Credential didnt belong to user',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Credential didnt exist',
  })
  remove(@Param('id', ParseIntPipe) id: string, @User() user: UserPrisma) {
    return this.credentialsService.remove(+id, user.id);
  }
}
