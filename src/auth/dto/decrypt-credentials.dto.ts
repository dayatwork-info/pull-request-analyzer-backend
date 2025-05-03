import { IsNotEmpty } from 'class-validator';

export class DecryptCredentialsDto {
  @IsNotEmpty()
  encryptedEmail: string;

  @IsNotEmpty()
  encryptedPassword: string;
}

export class DecryptedCredentialsResponseDto {
  email: string;
  password: string;
}