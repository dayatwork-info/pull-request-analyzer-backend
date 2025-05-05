import { IsNotEmpty, IsString } from 'class-validator';

export class GitHubTokenDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}
