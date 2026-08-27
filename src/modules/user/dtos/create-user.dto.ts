import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsUUID()
  companyId: string;

  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  @MinLength(11)
  phone?: string;

  @IsOptional()
  @IsString()
  role?:
    | 'admin'
    | 'building_manager'
    | 'accountant'
    | 'maintenance_manager'
    | 'tenant'
    | 'technician'
    | 'vendor';

  //state: needs mandatory activation

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  @MinLength(8)
  password: string;
}
