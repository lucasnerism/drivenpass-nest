import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';

enum CardTypes {
  credit = 'credit',
  debit = 'debit',
  both = 'both',
}

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Card 1', description: "Card's title" })
  title: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'John Doe', description: 'Name printed on card' })
  name: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '1234 5678 9123 4567', description: "Card's number" })
  number: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '123', description: "Card's CVV" })
  cvv: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '10/26', description: "Card's expiration date" })
  expirationDate: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '1234', description: "Card's password" })
  password: string;
  @IsBoolean()
  @ApiProperty({ example: true, description: 'Is it a virtual card' })
  isVirtual: boolean;
  @IsString()
  @IsEnum(CardTypes)
  @ApiProperty({ example: 'credit', description: "Card's type" })
  type: CardTypes;
}
