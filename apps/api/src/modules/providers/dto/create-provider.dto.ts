import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateProviderDto {
  @ApiProperty({ example: '0190123456001' })
  @IsString()
  ruc: string;

  @ApiProperty({ example: 'Cotratudossa S.A.' })
  @IsString()
  businessName: string;

  @ApiProperty({ example: 'contacto@cotratudossa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+593 7 1234567' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 5.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate?: number;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  bankAccount?: string;
}

