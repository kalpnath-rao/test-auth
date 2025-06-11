import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { VChannel } from '../verification.enum';
import { OTP_EXPIRE_TIME } from '../verification.constants';

@Schema({
  timestamps: true,
  autoIndex: true,
})
export class Verification {
  @Prop({
    type: String,
    required: true,
  })
  email!: string;

  @Prop({
    type: String,
    required: false,
  })
  to?: string;

  @Prop({
    type: String,
    required: true,
    enum: VChannel,
  })
  channel!: VChannel;

  @Prop({
    type: String,
    required: true,
  })
  otp!: string;

  @Prop({
    type: Number,
    required: true,
    default: 0,
    min: 0,
  })
  loginAttempts!: number;

  @Prop({
    type: Date,
    required: false,
  })
  loginAttemptAt?: Date;

  @Prop({
    type: Date,
  })
  updatedAt: Date = new Date();

  @Prop({
    type: Date,
  })
  createdAt: Date = new Date();
}

export type IVerificationDocument = HydratedDocument<Verification>;

export type IVerificationModel = Model<IVerificationDocument>;

export const VerificationSchema = SchemaFactory.createForClass(Verification);

VerificationSchema.index(
  {
    createdAt: 1,
  },
  {
    expireAfterSeconds: OTP_EXPIRE_TIME * 60,
  },
);
VerificationSchema.index({ createdAt: -1, email: 1 });
