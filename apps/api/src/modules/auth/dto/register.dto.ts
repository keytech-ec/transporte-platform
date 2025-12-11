import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { UserRole } from '@transporte-platform/database';

export class RegisterDto {
  @ApiProperty({ example: 'admin@platform.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Test123!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '0190123456001', description: 'Provider ID (null for platform admin)' })
  @IsOptional()
  @IsUUID()
  providerId?: string | null;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.OPERATOR })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

