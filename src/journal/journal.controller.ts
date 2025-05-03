import { Body, Controller, Post, Headers, UseGuards } from '@nestjs/common';
import { JournalService } from './journal.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('journal')
@UseGuards(JwtAuthGuard)
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post('create')
  async createJournal(
    @Body() createJournalDto: CreateJournalDto,
    @Headers('X-GitHub-Token') githubToken: string
  ) {
    return this.journalService.createJournal(createJournalDto, githubToken);
  }
}