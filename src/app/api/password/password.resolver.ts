import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PasswordService } from './password.service';
import {
  ForgetPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  VerifyPasswordInput,
} from './dto/graphql/password.input';
import { AuthGuard, BasicGuard, PasswordGuard } from '@guards/index';
import { GraphQLResultDto } from '@app/app.dto';
import { User } from '@app/decorators';

@Resolver()
export class PasswordResolver {
  constructor(private readonly passwordService: PasswordService) {}

  @Mutation(() => GraphQLResultDto, {
    description: 'ADMIN & USER | Send Reset Link to Email',
  })
  @UseGuards(BasicGuard)
  async forgetPassword(
    @Args('input') input: ForgetPasswordInput,
  ): Promise<boolean> {
    await this.passwordService.forget(input.email);
    return true;
  }

  @Mutation(() => GraphQLResultDto, {
    description: 'ADMIN | Reset Password with Token',
  })
  @UseGuards(PasswordGuard)
  async resetPassword(
    @Args('input') input: ResetPasswordInput,
    @User() user: IUser,
  ): Promise<boolean> {
    await this.passwordService.reset(input.password, user.token.id);
    return true;
  }

  @Mutation(() => GraphQLResultDto, {
    description: 'ADMIN | Change Password After Login',
  })
  @UseGuards(AuthGuard)
  async changePassword(
    @Args('input') input: ChangePasswordInput,
    @User() user: IUser,
  ): Promise<boolean> {
    if (input.currentPassword === input.newPassword) {
      throw new Error('PASSWORD.USED_PWD');
    }
    await this.passwordService.change(input, user.id);
    return true;
  }

  @Mutation(() => GraphQLResultDto, {
    description: 'ADMIN | Verify Password while Editing Profile',
  })
  @UseGuards(AuthGuard)
  async verifyPassword(
    @Args('input') input: VerifyPasswordInput,
    @User() user: IUser,
  ): Promise<boolean> {
    await this.passwordService.verify(input, user.id);
    return true;
  }
}
