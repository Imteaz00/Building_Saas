import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class UserPermissionDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  permissionCode: string;
}
