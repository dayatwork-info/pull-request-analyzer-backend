import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

export interface RefreshToken {
  token: string;
  expires: Date;
  createdAt: Date;
  createdByIp: string;
  revoked?: Date;
  revokedByIp?: string;
  replacedByToken?: string;
  isActive: boolean;
}

const RefreshTokenSchema = new MongooseSchema<RefreshToken>(
  {
    token: { type: String, required: true },
    expires: { type: Date, required: true },
    createdAt: { type: Date, required: true },
    createdByIp: { type: String, required: true },
    revoked: { type: Date },
    revokedByIp: { type: String },
    replacedByToken: { type: String },
    isActive: { type: Boolean, required: true },
  },
  { _id: false },
);

@Schema({ timestamps: true })
export class User {
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ type: [RefreshTokenSchema], default: [] })
  refreshTokens: RefreshToken[];
  
  @Prop({ type: Map, of: String, default: {} })
  prJournalMap: Map<string, string>;
}

export const UserSchema = SchemaFactory.createForClass(User);
