import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsJWT,
  IsObject,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { ResponseDto } from '@api/api.dto';
import { EmailCheckStep, MFAPlatform, NextStep } from '../enum/auth.enum';
import { Type } from 'class-transformer';
import { VALIDATIONS } from '@app/app.constants';

export class LoginPayloadDto {
  @ApiProperty({
    required: false,
    example: 'ashish@yopmail.com',
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiProperty({
    required: true,
    example: 'Admin@@321',
  })
  @IsDefined()
  @IsString()
  password!: string;

  @ApiProperty({
    required: false,
    example: '+91',
    minLength: VALIDATIONS.PHONE_CODE.LENGTH.MIN,
    maxLength: VALIDATIONS.PHONE_CODE.LENGTH.MAX,
  })
  @IsOptional()
  @Length(VALIDATIONS.PHONE_CODE.LENGTH.MIN, VALIDATIONS.PHONE_CODE.LENGTH.MAX)
  countryCode?: string;

  @ApiProperty({
    required: false,
    example: '7580072925',
    minLength: VALIDATIONS.PHONE_NO.LENGTH.MIN,
    maxLength: VALIDATIONS.PHONE_NO.LENGTH.MAX,
  })
  @IsOptional()
  @Length(VALIDATIONS.PHONE_NO.LENGTH.MIN, VALIDATIONS.PHONE_NO.LENGTH.MAX)
  phoneNumber?: string;
}

export class LoginResultDto {
  @ApiProperty({
    required: true,
    example: NextStep.None,
    description: 'Next Step',
    enum: NextStep,
  })
  @IsDefined()
  @IsString()
  @IsEnum(NextStep)
  nextStep!: NextStep;

  @ApiProperty({
    required: false,
    example: '{JWT_TOKEN}',
    description: 'Auth Token',
  })
  @IsString()
  @IsJWT()
  @IsOptional()
  authToken!: string;

  @ApiProperty({
    required: false,
    example: '{JWT_TOKEN}',
    description: 'Refresh Token',
  })
  @IsString()
  @IsJWT()
  @IsOptional()
  refreshToken!: string;

  @ApiProperty({
    required: false,
    example: '{JWT_TOKEN}',
    description: 'MFA Token',
  })
  @IsString()
  @IsJWT()
  @IsOptional()
  mfaToken!: string;

  @ApiProperty({
    required: false,
    example: MFAPlatform.GoogleAuth,
    description: `Authenticator App`,
    enum: MFAPlatform,
  })
  @IsString()
  @IsOptional()
  @IsEnum(MFAPlatform)
  platform!: MFAPlatform;

  @ApiProperty({
    required: false,
    example: 'data:image/png;base64,iVBORw0KGgoAAA',
    description: 'QR Code Base64 Url',
  })
  @IsString()
  @IsOptional()
  qrUrl!: string;
}

export class LoginResponseDto extends ResponseDto {
  @ApiProperty({
    required: true,
    type: LoginResultDto,
    description: 'Login Result',
  })
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => LoginResultDto)
  result!: LoginResultDto;
}

export class EmailStatusDto {
  @ApiProperty({
    required: true,
    example: 'ashish@yopmail.com',
  })
  @IsDefined()
  @IsString()
  @IsEmail()
  email!: string;
}
export class EmailStatusResultDto {
  @ApiProperty({
    required: true,
    example: true,
  })
  @IsDefined()
  exists!: boolean;

  @ApiProperty({
    required: true,
    example: false,
  })
  @IsDefined()
  isBlocked!: boolean;

  @ApiProperty({
    required: true,
    example: true,
  })
  @IsDefined()
  isActive!: boolean;

  @ApiProperty({
    required: true,
    example: EmailCheckStep.LOGIN,
    enum: EmailCheckStep,
    description: 'Next step in the authentication flow',
  })
  @IsDefined()
  @IsEnum(EmailCheckStep)
  nextStep!: EmailCheckStep;
}
export class EmailStatusResponseDto extends ResponseDto {
  @ApiProperty({
    required: true,
    type: EmailStatusResultDto,
  })
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => EmailStatusResultDto)
  result!: EmailStatusResultDto;
}
