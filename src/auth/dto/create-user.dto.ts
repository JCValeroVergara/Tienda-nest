import { IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';



export class CreateUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;
  
  @IsString()
  @MaxLength(50)
  @MinLength(3)
  fullName: string;

  @IsString()
  @IsIn(['admin', 'user', 'super-user'])
  @IsOptional()
  role: string;
}