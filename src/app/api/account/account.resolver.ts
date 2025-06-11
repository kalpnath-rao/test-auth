import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AccountService } from './account.service';
import {
  CheckEmailInput,
  GoogleLoginInput,
  LoginInput,
  MFAInput,
  OnboardingInput,
  SocialPayloadInput,
  VerifyOnboardingInput,
} from './dto/graphql/account.input';
import {
  AccountType,
  AdminLoginResponse,
  CheckEmailResponse,
  MFAVerifyResponse,
  OnboardingResponse,
  PermissionsResult,
  SocialResult,
  VerifyOnboardOutput,
} from './dto/graphql/account.output';
import { UseGuards } from '@nestjs/common';
import { AuthGuard, BasicGuard, MFAGuard } from '@app/guards';
import { User } from '@app/decorators';
import { EmailCheckStep } from './enum/auth.enum';
import { AccountAuthService } from './services/account.auth.service';
import { AccountMfaService } from './services/account.mfa.service';
import { AccountSocialService } from './services/account.social.service';
import { AccountLoginService } from './services/account.login.service';

@Resolver(() => AccountType)
export class AccountResolver {
  constructor(
    private readonly accountService: AccountService,
    private readonly accountAuthService: AccountAuthService,
    private readonly accountMfaService: AccountMfaService,
    private readonly accountSocialService: AccountSocialService,
    private readonly accountLoginService: AccountLoginService,
  ) {}

  @Mutation(() => AdminLoginResponse, {
    description: 'ADMIN Login using email || phone and password',
  })
  @UseGuards(BasicGuard)
  /**
   * @description
   * Login with email and password. If the user has MFA enabled but not setup, the API will return the QR code
   * of the MFA secret to be used for the setup. The QR code is returned as a PNG image.
   * @param input - Body payload containing the email and password
   * @returns The login result, which can be either a JSON object or a PNG image (if the user needs to setup MFA)
   */
  async login(@Args('input') input: LoginInput): Promise<AdminLoginResponse> {
    return this.accountLoginService.login(input);
  }

  @Mutation(() => MFAVerifyResponse, {
    description: 'ADMIN verify OTP for MFA',
  })
  @UseGuards(MFAGuard)
  /**
   * @description
   * Verify MFA with the given OTP.
   *
   * @param input - Body payload containing the OTP
   *
   * @returns The verify MFA result, which is JSON object
   */
  async verifyMFA(
    @Args('input') input: MFAInput,
    @User() user: IUser,
  ): Promise<MFAVerifyResponse> {
    input.type = user.type;
    input.secret = user.secret;
    return this.accountMfaService.verifyMFA(input, user.id);
  }

  @Query(() => AccountType, {
    description: 'Find account by email',
  })
  @UseGuards(BasicGuard)
  /**
   * @description
   * Finds an account using the provided email address.
   *
   * @param email - The email address to search for.
   *
   * @returns The account associated with the given email address.
   */
  async findByEmail(@Args('email') email: string): Promise<AccountType> {
    return this.accountService.findByEmail(email);
  }

  @Mutation(() => SocialResult, {
    description: 'User social login',
  })
  @UseGuards(BasicGuard)
  /**
   * @description
   * Login with social providers (google, facebook, etc) with the given payload.
   *
   * @param input - Body payload containing the social provider, id and email
   *
   * @returns The social login result, which is JSON object .
   */
  async socialLogin(
    @Args('input') input: SocialPayloadInput,
  ): Promise<SocialResult> {
    return this.accountSocialService.socialLogin(input);
  }

  @Mutation(() => Boolean, {
    description: 'User reset MFA',
  })
  @UseGuards(AuthGuard)
  /**
   * @description
   * Resets the MFA for the given user ID.
   */
  async resetMfa(@Args('id') id: string): Promise<boolean> {
    await this.accountMfaService.resetMfa(id);
    return true;
  }

  @Query(() => PermissionsResult, {
    description: 'Get permissions of admin',
  })
  @UseGuards(AuthGuard)
  /**
   * @description
   * Fetches the permissions for the given user.
   *
   * @returns A promise that resolves to the user's permissions.
   */
  async permissions(@User() user: IUser): Promise<PermissionsResult> {
    const result = await this.accountService.permissions(user.id);
    return result;
  }

  @Query(() => CheckEmailResponse)
  @UseGuards(BasicGuard)
  /**
   * @description
   * Checks the email status for the given email address.
   * @param input - Body payload containing the email address
   * @returns The email status, which is JSON object
   */
  async checkEmail(
    @Args('input') input: CheckEmailInput,
  ): Promise<CheckEmailResponse> {
    const status = await this.accountAuthService.checkEmailStatus(input.email);
    return {
      ...status,
      nextStep: status.exists ? EmailCheckStep.LOGIN : EmailCheckStep.REGISTER,
    };
  }

  //onbaording user with email and password
  @Mutation(() => OnboardingResponse, {
    description: 'User onboarding with OTP verification',
  })
  /**
   * @description
   * Onboard a user with email and password.
   * @param input - The input payload containing the email and password.
   * @returns The onboarding response.
   */
  @UseGuards(BasicGuard)
  async onboarding(
    @Args('input') input: OnboardingInput,
  ): Promise<OnboardingResponse> {
    return this.accountAuthService.onboarding(input);
  }

  /**
   * @description
   * Verify the email of the user.
   * @param input - The input payload containing the otp.
   * @returns The verify email response.
   */

  @Mutation(() => VerifyOnboardOutput, {
    description: 'User verify email',
  })
  @UseGuards(MFAGuard)
  async verifyEmail(
    @Args('input') input: VerifyOnboardingInput,
    @User() user: IUser,
  ): Promise<VerifyOnboardOutput> {
    return this.accountAuthService.verifyEmail(input, user);
  }

  @Mutation(() => SocialResult, {
    description: 'Google login',
  })
  /**
   * @description
   * Login with google.
   * @param input - The input payload containing the token and isAuthorizationCode.
   * @returns The social login result.
   */
  @UseGuards(BasicGuard)
  async googleLogin(
    @Args('input') input: GoogleLoginInput,
  ): Promise<SocialResult> {
    const socialPayload = await this.accountSocialService.validateGoogleToken(
      input.token,
      input.isAuthorizationCode,
    );

    return this.accountSocialService.socialLogin(socialPayload);
  }
}
