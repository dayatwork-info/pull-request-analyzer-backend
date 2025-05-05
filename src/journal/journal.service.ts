import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateJournalDto } from './dto/create-journal.dto';
import { CryptoUtil } from '../auth/utils/crypto.util';
import { GitHubService } from '../github/github.service';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../auth/schemas/user.schema';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class JournalService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly githubService: GitHubService,
    private readonly configService: ConfigService,
  ) {}
  
  async getJournalByPrRef(userId: string, prRef: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    
    const user = await this.userModel.findById(userId).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create a cryptographic hash of the PR reference for better security and uniqueness
    const hashedPrRef = crypto.createHash('sha256').update(prRef).digest('hex');
    
    const journalId = user.prJournalMap?.get(hashedPrRef);
    
    if (!journalId) {
      return { found: false, journalId: null };
    }
    
    return { 
      found: true,
      journalId
    };
  }

  async createJournal(createJournalDto: CreateJournalDto, githubToken: string) {
    const { email, password, title, content, prRef } = createJournalDto;

    try {
      // Step 1: Decrypt email and password (since we're receiving them encrypted)
      // Note: In a real app, you'd need to first determine if the credentials are encrypted,
      // but for this example, we'll assume they are always encrypted
      const decryptedEmail = CryptoUtil.decrypt(email);
      const decryptedPassword = CryptoUtil.decrypt(password);

      // Step 2: Fetch user's GitHub emails
      const githubEmailsResponse =
        await this.githubService.getUserEmails(githubToken);

      // Step 3: Check if the decrypted email matches any verified GitHub email
      const verifiedGithubEmails = githubEmailsResponse.emails.filter(
        (e) => e.verified,
      );
      const isEmailVerifiedOnGithub = verifiedGithubEmails.some(
        (e) => e.email.toLowerCase() === decryptedEmail.toLowerCase(),
      );

      if (!isEmailVerifiedOnGithub) {
        throw new BadRequestException(
          'Email is not verified on GitHub. Please use a verified GitHub email.',
        );
      }

      // Step 3.5: Find the user by email and set isVerified to true in our database
      const user = await this.userModel
        .findOne({ email: decryptedEmail })
        .exec();

      if (user) {
        // Update the user's verification status if not already verified
        if (!user.isVerified) {
          user.isVerified = true;
          await user.save();
        }
      }

      // Step 4: Email is verified, send a POST request to the work journal API
      const workJournalApiUrl = `${this.configService.get<string>('app.journal.origin')}/api/vendor/import-journal`;

      // Make the login request to the work journal API
      const importJournalResponse = await axios.post(
        workJournalApiUrl,
        {
          email: decryptedEmail,
          password: decryptedPassword,
          title,
          content,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      // If login successful, create and store the journal entry
      if (
        importJournalResponse.status === 200 ||
        importJournalResponse.status === 201
      ) {
        const createdJournalId = importJournalResponse.data.journalId;
        
        // Store the journalId in the user document using prRef as key
        if (user && prRef) {
          // Create a cryptographic hash of the PR reference for better security and uniqueness
          const hashedPrRef = crypto.createHash('sha256').update(prRef).digest('hex');

          await this.userModel.findByIdAndUpdate(
            user._id,
            { $set: { [`prJournalMap.${hashedPrRef}`]: createdJournalId } },
            { new: true }
          );
        }
        
        return {
          journalId: createdJournalId,
        };
      } else {
        throw new UnauthorizedException(
          'Failed to authenticate with Work Journal API',
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error.response) {
        if (error.response.status === 401) {
          if (error.config?.url?.includes('/api/auth/login')) {
            throw new UnauthorizedException(
              'Invalid credentials for Work Journal API',
            );
          } else {
            throw new UnauthorizedException('Invalid GitHub token');
          }
        }

        // Handle other API error responses
        throw new BadRequestException(
          error.response.data?.message ||
            'Error communicating with external service',
        );
      }

      // For decryption errors or other issues
      if (error.message && error.message.includes('decrypt')) {
        throw new BadRequestException('Invalid encrypted credentials');
      }

      // For connection issues or other unexpected errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new InternalServerErrorException(
          'Could not connect to Work Journal service',
        );
      }

      throw new UnauthorizedException('Invalid credentials');
    }
  }
}