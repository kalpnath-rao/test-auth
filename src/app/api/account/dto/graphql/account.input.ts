import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { MFAPlatform, SocialType } from '../../enum/auth.enum';
import { UserType, VALIDATIONS } from '@app/app.constants';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsBoolean,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

registerEnumType(SocialType, {
  name: 'SocialType',
});

registerEnumType(UserType, {
  name: 'UserType',
});

@InputType()
export class LoginInput {
  @Field({ description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field({ description: 'Password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(VALIDATIONS.PASSWORD.LENGTH.MIN)
  @MaxLength(VALIDATIONS.PASSWORD.LENGTH.MAX)
  password: string;
}

@InputType()
export class MFAInput {
  @Field({ description: 'One-time password for MFA' })
  @Length(6, 6)
  otp: string;

  @Field({
    nullable: true,
    description: 'Secret key for MFA, required for setup',
  })
  secret?: string;

  @Field({ nullable: true, description: 'MFA platform being used' })
  @IsEnum(MFAPlatform)
  platform?: MFAPlatform;

  @Field({
    nullable: true,
    description: 'User type associated with the MFA request',
  })
  type?: UserType;
}

@InputType()
class NameInput {
  @Field()
  first: string;

  @Field()
  last: string;
}

@InputType()
export class SocialPayloadInput {
  @Field(() => String, {
    description: 'User Type',
    defaultValue: UserType.User,
  })
  userType!: UserType;

  @Field(() => String, {
    nullable: true,
    description: 'Country code (e.g., +91)',
    defaultValue: '+91',
  })
  countryCode?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Phone number (e.g., 7580072925)',
  })
  phoneNumber?: string;

  @Field(() => SocialType, {
    description: 'Social Login Type',
    defaultValue: SocialType.Apple,
  })
  socialType!: SocialType;

  @Field(() => String, {
    description: 'Social ID',
    defaultValue: 'a122dff2ffg23vc',
  })
  @Length(VALIDATIONS.SOCIAL_ID.LENGTH.MIN, VALIDATIONS.SOCIAL_ID.LENGTH.MAX)
  socialId!: string;

  @Field(() => NameInput, {
    nullable: true,
    description: 'Full name',
  })
  name!: NameInput;

  @Field(() => String, {
    nullable: true,
    description: 'Email address (optional)',
  })
  @IsEmail()
  email?: string;
}

@InputType()
export class OnboardPayloadInput {
  @Field(() => UserType, {
    description: 'User Type (enum)',
    defaultValue: UserType.User,
  })
  @IsEnum(UserType)
  userType!: UserType;

  @Field(() => String, {
    description: 'Country code (e.g., +91)',
    nullable: true,
  })
  countryCode: string;

  @Field(() => String, {
    description: 'Phone number (e.g., 7580072925)',
    nullable: true,
  })
  phoneNumber: string;

  @Field(() => SocialPayloadInput, {
    nullable: true,
    description: 'Social login profile',
  })
  profile?: SocialPayloadInput;
}

@InputType()
export class CheckEmailInput {
  @Field(() => String)
  @IsEmail()
  readonly email!: string;
}

@InputType()
export class OnboardingInput {
  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String)
  @IsString()
  @MinLength(8)
  @MaxLength(15)
  password: string;
}

@InputType()
export class VerifyOnboardingInput {
  @Field({ description: 'OTP' })
  @IsString()
  @Length(6, 6)
  otp!: string;
}

@InputType()
export class GoogleLoginInput {
  @Field(() => String, {
    description: 'Google ID token or authorization code',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @Field(() => Boolean, {
    description: 'Whether the token is an authorization code',
    defaultValue: false,
  })
  @IsBoolean()
  isAuthorizationCode: boolean;
}
