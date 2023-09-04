import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Note 1',
    description: "Note's title",
  })
  title: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Secret text',
    description: "Note's content",
  })
  content: string;
}
