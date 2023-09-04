import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateCredentialDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Credential 1',
    description: 'Title of the credential',
  })
  title: string;
  @IsUrl()
  @ApiProperty({
    example: 'https://example.com',
    description: 'Url of the credential',
  })
  url: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Username',
    description: 'Username of the credential',
  })
  username: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'password',
    description: 'Password of the credential',
  })
  password: string;
}
