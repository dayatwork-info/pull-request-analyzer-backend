import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';
import { GitHubModule } from '../github/github.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => GitHubModule),
    ConfigModule,
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
  controllers: [JournalController],
  providers: [JournalService],
  exports: [JournalService],
})
export class JournalModule {}
