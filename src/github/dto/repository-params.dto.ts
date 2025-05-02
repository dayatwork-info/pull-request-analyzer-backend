import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class RepositoryParamsDto {
  @IsNotEmpty()
  @IsString()
  owner: string;

  @IsNotEmpty()
  @IsString()
  repo: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  perPage?: number;

  @IsOptional()
  @IsString()
  state?: string;
}