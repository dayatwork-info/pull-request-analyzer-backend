import {
  Body,
  Controller,
  Post,
  Get,
  Headers,
  UseGuards,
  Param,
} from '@nestjs/common';
import { JournalService } from './journal.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('journal')
@UseGuards(JwtAuthGuard)
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post('create')
  async createJournal(
    @Body() createJournalDto: CreateJournalDto,
    @Headers('X-GitHub-Token') githubToken: string,
  ) {
    return this.journalService.createJournal(createJournalDto, githubToken);
  }

  @Get('by-pr/:prRef')
  async getJournalByPrRef(
    @CurrentUser() user: { sub: string },
    @Param('prRef') prRef: string,
  ) {
    return this.journalService.getJournalByPrRef(user.sub, prRef);
  }
}
