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
import { NextStep, SocialType } from '../enum/auth.enum';
import { Type, plainToInstance } from 'class-transformer';
import { UserType, VALIDATIONS } from '@app/app.constants';

const formatEnum = (target: { [key: string]: string }): string => {
  return Object.entries(target)
    .map(([k, v]) => `${v}:${k}`)
    .join(' | ');
};

export class NameDto {
  @ApiProperty({
    description: 'First Name',
    required: true,
    example: 'Abhijeet',
    minLength: VALIDATIONS.NAME.LENGTH.MIN,
    maxLength: VALIDATIONS.NAME.LENGTH.MAX,
  })
  @IsDefined()
  @IsString()
  @Length(VALIDATIONS.NAME.LENGTH.MIN, VALIDATIONS.NAME.LENGTH.MAX)
  first!: string;

  @ApiProperty({
    required: false,
    example: 'Singh',
    description: 'Last Name',
    minLength: VALIDATIONS.NAME.LENGTH.MIN,
    maxLength: VALIDATIONS.NAME.LENGTH.MAX,
  })
  @IsOptional()
  @IsString()
  @Length(VALIDATIONS.NAME.LENGTH.MIN, VALIDATIONS.NAME.LENGTH.MAX)
  last?: string;
}

export class SocialPayloadDto {
  @ApiProperty({
    required: true,
    example: UserType.User,
    enum: [UserType.User],
    description: `User Type (${formatEnum(UserType)})`,
  })
  @IsDefined()
  @IsString()
  @IsEnum(UserType)
  userType!: UserType;

  @ApiProperty({
    required: false,
    example: '+91',
    minLength: VALIDATIONS.PHONE_CODE.LENGTH.MIN,
    maxLength: VALIDATIONS.PHONE_CODE.LENGTH.MAX,
  })
  @IsOptional()
  @IsString()
  @Length(VALIDATIONS.PHONE_CODE.LENGTH.MIN, VALIDATIONS.PHONE_CODE.LENGTH.MAX)
  countryCode?: string;

  @ApiProperty({
    required: false,
    example: '7580072925',
    minLength: VALIDATIONS.PHONE_NO.LENGTH.MIN,
    maxLength: VALIDATIONS.PHONE_NO.LENGTH.MAX,
  })
  @IsOptional()
  @IsString()
  @Length(VALIDATIONS.PHONE_NO.LENGTH.MIN, VALIDATIONS.PHONE_NO.LENGTH.MAX)
  phoneNumber?: string;

  @ApiProperty({
    description: `Social Login Type (${formatEnum(SocialType)})`,
    required: true,
    example: SocialType.Apple,
    enum: SocialType,
  })
  @IsDefined()
  @IsString()
  @IsEnum(SocialType)
  socialType!: SocialType;

  @ApiProperty({
    required: true,
    example: 'a122dff2ffg23vc',
    description: 'Social ID',
    minLength: VALIDATIONS.SOCIAL_ID.LENGTH.MIN,
    maxLength: VALIDATIONS.SOCIAL_ID.LENGTH.MAX,
  })
  @IsDefined()
  @IsString()
  @Length(VALIDATIONS.SOCIAL_ID.LENGTH.MIN, VALIDATIONS.SOCIAL_ID.LENGTH.MAX)
  socialId!: string;

  @ApiProperty({
    required: false,
    type: NameDto,
    description: 'Full Name',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => NameDto)
  name!: NameDto;

  @ApiProperty({
    required: false,
    example: 'abhijeet@yopmail.com',
    minLength: VALIDATIONS.EMAIL.LENGTH.MIN,
    maxLength: VALIDATIONS.EMAIL.LENGTH.MAX,
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  @Length(VALIDATIONS.EMAIL.LENGTH.MIN, VALIDATIONS.EMAIL.LENGTH.MAX)
  email?: string;
}

export class SocialResultDto {
  static parse(partial: Partial<SocialResultDto>): SocialResultDto {
    return plainToInstance(this, partial);
  }

  @ApiProperty({
    required: true,
    example: NextStep.None,
    description: `Next Step ((${formatEnum(NextStep)}))`,
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
  @IsOptional()
  @IsString()
  @IsJWT()
  authToken?: string;

  @ApiProperty({
    required: false,
    example: '{JWT_TOKEN}',
    description: 'Refresh Token',
  })
  @IsOptional()
  @IsString()
  @IsJWT()
  refreshToken?: string;
}

export class SocialResponseDto extends ResponseDto {
  @ApiProperty({
    required: true,
    type: SocialResultDto,
    description: 'Social Login Result',
  })
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => SocialResultDto)
  result!: SocialResultDto;
}
