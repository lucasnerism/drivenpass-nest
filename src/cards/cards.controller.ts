import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
  Put,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { User } from '../decorators/user.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { User as UserPrisma } from '@prisma/client';

@ApiTags('cards')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new card' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Card was created',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Body was invalid',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Duplicate card title',
  })
  create(@Body() createCardDto: CreateCardDto, @User() user: UserPrisma) {
    return this.cardsService.create(createCardDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cards that belongs to user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Got the cards' })
  findAll(@User() user: UserPrisma) {
    return this.cardsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get said card if belongs to user' })
  @ApiParam({ name: 'id', description: "card's id", example: 1 })
  @ApiResponse({ status: HttpStatus.OK, description: 'Got the card' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Card didnt belong to user',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Card didnt exist',
  })
  findOne(@Param('id', ParseIntPipe) id: string, @User() user: UserPrisma) {
    return this.cardsService.findOne(+id, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update said card if belongs to user' })
  @ApiParam({ name: 'id', description: "card's id", example: 1 })
  @ApiResponse({ status: HttpStatus.OK, description: 'Updated the card' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Card didnt belong to user',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Card didnt exist',
  })
  update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateCardDto: CreateCardDto,
    @User() user: UserPrisma,
  ) {
    return this.cardsService.update(+id, updateCardDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete said card if belongs to user' })
  @ApiParam({ name: 'id', description: "card's id", example: 1 })
  @ApiResponse({ status: HttpStatus.OK, description: 'Deleted the card' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Card didnt belong to user',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Card didnt exist',
  })
  remove(@Param('id', ParseIntPipe) id: string, @User() user: UserPrisma) {
    return this.cardsService.remove(+id, user.id);
  }
}
