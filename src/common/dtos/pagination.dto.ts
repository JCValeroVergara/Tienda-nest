import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min} from 'class-validator';


export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number) //Transforms the value into a number
  limit?: number;

  @IsOptional()
  @Min(0)
  @Type(() => Number) //Transforms the value into a number
  offset?: number;
}