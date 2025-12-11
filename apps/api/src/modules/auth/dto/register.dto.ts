import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'admin@platform.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Test123!' })
  @IsString()
  @MinLength(6)
  password: string;
}

