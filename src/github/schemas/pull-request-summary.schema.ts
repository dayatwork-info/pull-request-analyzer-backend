import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PullRequestSummaryDocument = PullRequestSummary & Document;

@Schema({ timestamps: true })
export class PullRequestSummary {
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  organization: string;

  @Prop({ required: true })
  repository: string;

  @Prop({ required: true })
  pullRequestNumber: number;

  @Prop({ required: true })
  pullRequestTitle: string;

  @Prop({ required: true })
  githubUserId: number;

  @Prop({ required: true })
  githubUsername: string;

  @Prop()
  summary: string;
}

export const PullRequestSummarySchema =
  SchemaFactory.createForClass(PullRequestSummary);

// Create indexes for frequently queried fields
PullRequestSummarySchema.index({ organization: 1, repository: 1 });
PullRequestSummarySchema.index({ githubUserId: 1 });
PullRequestSummarySchema.index(
  { pullRequestNumber: 1, repository: 1, organization: 1 },
  { unique: true },
);
