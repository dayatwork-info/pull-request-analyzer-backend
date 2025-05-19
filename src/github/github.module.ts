import { Module, forwardRef } from '@nestjs/common';
import { GitHubController } from './github.controller';
import { GitHubService } from './github.service';
import { AnthropicModule } from '../anthropic/anthropic.module';
import { JournalModule } from '../journal/journal.module';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  PullRequestSummary,
  PullRequestSummarySchema,
} from './schemas/pull-request-summary.schema';
import { User, UserSchema } from 'src/auth/schemas/user.schema';

@Module({
  imports: [
    AnthropicModule,
    forwardRef(() => JournalModule),
    MongooseModule.forFeature([
      { name: PullRequestSummary.name, schema: PullRequestSummarySchema },
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('app.auth.jwtSecret'),
        signOptions: {
          expiresIn: configService.get<string>('app.auth.jwtExpiresIn'),
        },
      }),
    }),
  ],
  controllers: [GitHubController],
  providers: [GitHubService],
  exports: [GitHubService],
})
export class GitHubModule {}
