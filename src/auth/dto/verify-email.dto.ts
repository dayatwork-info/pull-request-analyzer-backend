import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @IsNotEmpty()
  @IsString()
  verificationToken: string;
}
