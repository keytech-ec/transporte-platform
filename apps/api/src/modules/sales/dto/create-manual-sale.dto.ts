import { IsString, IsArray, IsObject, IsEnum, IsOptional, IsNumber, IsBoolean, IsEmail, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ContactDto {
  @ApiProperty({ enum: ['CEDULA', 'PASSPORT', 'RUC'] })
  @IsEnum(['CEDULA', 'PASSPORT', 'RUC'])
  documentType: 'CEDULA' | 'PASSPORT' | 'RUC';

  @ApiProperty()
  @IsString()
  documentNumber: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class PaymentDto {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: ['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD'] })
  @IsEnum(['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD'])
  method: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @ApiProperty()
  @IsBoolean()
  isPartial: boolean;
}

export class CreateManualSaleDto {
  @ApiProperty()
  @IsString()
  tripId: string;

  // Flexible booking: either seatIds OR quantity
  @ApiProperty({ type: [String], required: false, description: 'For REQUIRED/OPTIONAL seat selection modes' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seatIds?: string[];

  @ApiProperty({ required: false, description: 'For NONE seat selection mode (quantity-based booking)' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty({ required: false, description: 'Floor number for multi-floor vehicles when using quantity-based booking' })
  @IsOptional()
  @IsNumber()
  floorNumber?: number;

  @ApiProperty({ type: ContactDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ContactDto)
  contact: ContactDto;

  @ApiProperty({ type: PaymentDto })
  @IsObject()
  @ValidateNested()
  @Type(() => PaymentDto)
  payment: PaymentDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ enum: ['WHATSAPP', 'EMAIL', 'NONE'], required: false })
  @IsOptional()
  @IsEnum(['WHATSAPP', 'EMAIL', 'NONE'])
  sendFormVia?: 'WHATSAPP' | 'EMAIL' | 'NONE';
}
