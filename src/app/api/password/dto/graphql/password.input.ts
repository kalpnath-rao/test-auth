import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, Length } from 'class-validator';
import { VALIDATIONS } from '@app/app.constants';

@InputType()
export class ForgetPasswordInput {
  @Field({ description: 'Email address for password reset' })
  @IsEmail({}, { message: 'Invalid email format' })
  @Length(VALIDATIONS.EMAIL.LENGTH.MIN, VALIDATIONS.EMAIL.LENGTH.MAX, {
    message: 'Email must be within valid length',
  })
  email!: string;
}

@InputType()
export class ResetPasswordInput {
  @Field({
    description: 'New password for the user',
  })
  @Length(VALIDATIONS.PASSWORD.LENGTH.MIN, VALIDATIONS.PASSWORD.LENGTH.MAX, {
    message: 'Password must be within valid length',
  })
  password!: string;
}

@InputType()
export class ChangePasswordInput {
  @Field({ description: 'Current password of the user' })
  @Length(VALIDATIONS.PASSWORD.LENGTH.MIN, VALIDATIONS.PASSWORD.LENGTH.MAX, {
    message: 'Password must be within valid length',
  })
  currentPassword!: string;

  @Field({ description: 'New password for the user' })
  @Length(VALIDATIONS.PASSWORD.LENGTH.MIN, VALIDATIONS.PASSWORD.LENGTH.MAX, {
    message: 'Password must be within valid length',
  })
  newPassword!: string;
}

@InputType()
export class VerifyPasswordInput {
  @Field({ description: 'Current password of the user' })
  @Length(VALIDATIONS.PASSWORD.LENGTH.MIN, VALIDATIONS.PASSWORD.LENGTH.MAX, {
    message: 'Password must be within valid length',
  })
  currentPassword!: string;
}
