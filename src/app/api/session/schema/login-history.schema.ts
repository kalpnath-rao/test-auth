import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({
  timestamps: true,
  autoIndex: true,
  collection: 'login-histories',
})
export class LoginHistory {
  @Prop({
    type: String,
    required: false,
  })
  platform!: string;

  @Prop({
    type: String,
    required: false,
  })
  token!: string;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'accounts',
  })
  account!: string;

  @Prop({
    type: Date,
  })
  updatedAt: Date = new Date();

  @Prop({
    type: Date,
  })
  createdAt: Date = new Date();
}

export type LoginHistoryDocument = HydratedDocument<LoginHistory>;

export const LoginHistorySchema = SchemaFactory.createForClass(LoginHistory);
