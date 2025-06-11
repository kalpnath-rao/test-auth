import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum PasswordMethod {
  Reset = '1',
  Change = '2',
}

@Schema({
  timestamps: true,
  autoIndex: true,
  collection: 'passwords',
})
export class Password {
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'Account',
  })
  account!: Types.ObjectId;

  /** Keep old password (When reset request is fulfilled) */
  @Prop({
    type: String,
    required: false,
  })
  oldPassword?: string;

  @Prop({
    type: String,
    required: true,
    enum: [PasswordMethod.Reset, PasswordMethod.Change],
  })
  method!: PasswordMethod;

  @Prop({
    type: Date,
  })
  updatedAt: Date = new Date();

  @Prop({
    type: Date,
  })
  createdAt: Date = new Date();
}

export type PasswordDocument = HydratedDocument<Password>;

export const PasswordSchema = SchemaFactory.createForClass(Password);
