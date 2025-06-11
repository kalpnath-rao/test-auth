import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { EmailCheckStep, MFAPlatform, NextStep } from '../../enum/auth.enum';
import { IsBoolean, IsEmail, IsEnum, IsJWT } from 'class-validator';
import { UserType } from '@app/app.constants';

registerEnumType(UserType, {
  name: 'UserType',
});
registerEnumType(NextStep, {
  name: 'NextStep',
});
registerEnumType(MFAPlatform, {
  name: 'MFAPlatform',
});

registerEnumType(EmailCheckStep, {
  name: 'EmailCheckStep',
});
@ObjectType()
class Name {
  @Field()
  first: string;

  @Field()
  last: string;
}
@ObjectType()
export class AccountType {
  @Field(() => ID, { description: 'MongoDB ID for the User Document' })
  _id: string;

  @Field({ description: 'Email address of the user' })
  @IsEmail()
  email: string;

  @Field({ description: 'User type (enum)' })
  @IsEnum(UserType)
  type: UserType;

  @Field({ nullable: true, description: 'Password of the user' })
  password?: string;

  @Field({ nullable: true, description: 'Blocked at' })
  blockedAt?: string;

  @Field(() => Name, { description: 'Full name of the user' })
  name?: Name;
}

@ObjectType()
export class LoginResponse {
  @Field({ nullable: true, description: 'MFA Token' })
  @IsJWT()
  mfaToken?: string;

  @Field({ nullable: true, description: 'QR Code URL for MFA Setup' })
  qrUrl?: string;

  @Field({ nullable: true, description: 'MFA Platform (enum)' })
  @IsEnum(MFAPlatform)
  platform?: MFAPlatform;

  @Field({ nullable: true, description: 'Access Token' })
  @IsJWT()
  accessToken?: string;

  @Field({ nullable: true, description: 'Refresh Token' })
  @IsJWT()
  refreshToken?: string;

  @Field({ nullable: true, description: 'Auth Token' })
  @IsJWT()
  authToken?: string;
}

@ObjectType()
export class AdminLoginResponse extends LoginResponse {
  @Field({ description: 'Next step (enum)' })
  @IsEnum(NextStep)
  nextStep: NextStep;
}
@ObjectType()
export class MFAVerifyResponse {
  @Field({ description: 'JWT Authentication Token' })
  @IsJWT()
  authToken: string;

  @Field({ description: 'JWT Refresh Token' })
  @IsJWT()
  refreshToken: string;
}

@ObjectType()
export class SocialResult {
  @Field({ description: 'Next Step (enum)' })
  @IsEnum(NextStep)
  nextStep!: NextStep;

  @Field(() => String, {
    nullable: true,
    description: 'JWT Authentication Token',
    defaultValue: '{JWT_TOKEN}',
  })
  @IsJWT()
  authToken?: string;

  @Field(() => String, {
    nullable: true,
    description: 'JWT Refresh Token',
    defaultValue: '{JWT_TOKEN}',
  })
  @IsJWT()
  refreshToken?: string;
}

@ObjectType()
export class PermissionsResult {
  /**
   * List of permissions
   */
  @Field(() => [String], {
    nullable: true,
    description: 'List of permissions',
  })
  PERMISSIONS?: string[];

  /**
   * List of roles
   */
  @Field(() => [String], {
    nullable: true,
    description: 'List of roles',
  })
  ROLES?: string[];
}

@ObjectType()
export class CheckEmailResponse {
  @Field(() => Boolean)
  readonly exists!: boolean;

  @Field(() => Boolean)
  readonly isBlocked!: boolean;

  @Field(() => Boolean)
  readonly deletedAt!: boolean;

  @Field(() => String, { nullable: true })
  readonly socialId?: string;

  @Field(() => String, { nullable: true })
  readonly socialType?: string;

  @Field(() => String, { nullable: true })
  readonly socialTypeName?: string;

  @Field(() => EmailCheckStep)
  readonly nextStep!: EmailCheckStep;
}

@ObjectType()
export class OnboardingResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  mfaToken: string;
}

@ObjectType()
export class VerifyOnboardOutput {
  @Field({ description: 'Success' })
  @IsBoolean()
  success: boolean;

  @Field({ description: 'Next step' })
  @IsEnum(NextStep)
  nextStep: NextStep;

  @Field({ description: 'JWT Authentication Token' })
  @IsJWT()
  authToken: string;

  @Field({ description: 'JWT Refresh Token' })
  @IsJWT()
  refreshToken: string;
}
