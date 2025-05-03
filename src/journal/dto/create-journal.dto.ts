import { IsNotEmpty } from 'class-validator';

export class CreateJournalDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;
}