import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { UserType } from '@app/app.constants';
import { passwordUtil } from '@utils/password.util';

@Schema({ _id: false })
class Name {
  @Prop({
    type: String,
    required: true,
    minlength: 3,
    maxlength: 320,
  })
  first!: string;
  @Prop({
    type: String,
    required: false,
    minlength: 3,
    maxlength: 320,
  })
  last?: string;
}

@Schema({ _id: false })
class TOTP {
  @Prop({
    type: String,
    required: true,
  })
  platform: string;
  @Prop({
    type: String,
    required: true,
  })
  secret!: string;
}
@Schema({ _id: false })
class Phone {
  @Prop({
    type: String,
    required: true,
    minlength: 1,
    maxlength: 5,
  })
  code!: string;
  @Prop({
    type: String,
    required: true,
    minlength: 6,
    maxlength: 14,
  })
  number!: string;
}

@Schema({ timestamps: true, collection: 'accounts' })
export class Account {
  @Prop({
    type: Name,
    required: false,
  })
  name?: Name;

  @Prop({
    type: String,
    lowercase: true,
    required: false,
    minlength: 3,
    maxlength: 320,
  })
  email: string;

  @Prop({
    type: String,
    required: false,
  })
  password: string;

  @Prop({
    type: String,
    required: true,
    enum: UserType,
  })
  type!: UserType;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  isRoot: boolean;

  @Prop({
    type: SchemaTypes.Map,
    required: false,
    of: [String],
  })
  permissions?: Record<string, string[]>;

  @Prop({
    type: TOTP,
    required: false,
  })
  totp?: TOTP;

  @Prop({
    type: Phone,
    required: false,
  })
  phone?: Phone;

  @Prop({
    type: SchemaTypes.Map,
    required: true,
    on: String,
    default: {},
  })
  social!: Types.Map<string>;

  @Prop({
    type: Date,
    required: false,
  })
  blockedAt?: Date;

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
    type: Boolean,
    required: false,
  })
  isSetupDone?: boolean;

  @Prop({
    type: Boolean,
  })
  isActive: boolean;

  @Prop({
    type: Boolean,
    required: false,
  })
  isMfaVerified: boolean;

  @Prop({
    type: Boolean,
    required: true,
    default: true,
  })
  mfaToggleEnable: boolean;

  @Prop({
    type: Date,
    required: false,
  })
  deletedAt?: Date;

  @Prop({
    type: Boolean,
    required: false,
    default: false,
  })
  isEmailVerified: boolean;

  @Prop({
    type: Date,
    required: false,
  })
  lastLogin?: Date;
}

export type AccountDocument = HydratedDocument<Account>;

export const AccountSchema = SchemaFactory.createForClass(Account);

AccountSchema.index({ email: 1 }, { unique: true, sparse: true });

AccountSchema.pre('save', async function () {
  const isPasswordPresent = this.get('password');
  if (isPasswordPresent) {
    this.set('password', await passwordUtil.hash(this.get('password')));
  }
});

AccountSchema.pre('updateOne', async function () {
  const password = this.get('password');
  if (password) {
    this.set('password', await passwordUtil.hash(password));
  }
});
