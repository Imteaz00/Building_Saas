import { ClassConstructor, plainToInstance } from 'class-transformer';

export function convertToResponseDto<T, V>(
  dtoClass: ClassConstructor<T>,
  data: V,
): T {
  return plainToInstance(dtoClass, data, { excludeExtraneousValues: true });
}
