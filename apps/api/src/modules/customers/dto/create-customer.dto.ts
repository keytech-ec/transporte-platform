import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';

export enum DocumentType {
  CEDULA = 'CEDULA',
  RUC = 'RUC',
  PASSPORT = 'PASSPORT',
}

export class CreateCustomerDto {
  @ApiProperty({ enum: DocumentType, default: DocumentType.CEDULA })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  documentNumber: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'juan.perez@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+593 99 1234567' })
  @IsString()
  phone: string;
}

