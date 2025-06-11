import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  MinLength,
  MaxLength,
  IsDefined,
  IsObject,
  ValidateNested,
  IsString,
  IsJWT,
  IsEnum,
} from 'class-validator';
import { ResponseDto } from '@api/api.dto';
import { UserType } from '@app/app.constants';
import { Type, plainToInstance } from 'class-transformer';
import { MFAPlatform } from '../enum/auth.enum';

export class VerifyMFAPayloadDto {
  @ApiProperty({
    required: false,
    description: 'Platform (First Time Only)',
    example: MFAPlatform.GoogleAuth,
    enum: MFAPlatform,
  })
  @IsString()
  @IsOptional()
  @IsEnum(MFAPlatform)
  platform?: MFAPlatform;

  @ApiProperty({
    required: true,
    example: '000000',
    minLength: 6,
    maxLength: 6,
  })
  @IsDefined()
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  otp!: string;

  type?: UserType;
  secret?: string;
}

export class VerifyMFAResultDto {
  static parse(partial: Partial<VerifyMFAResultDto>): VerifyMFAResultDto {
    return plainToInstance(this, partial);
  }
  @ApiProperty({
    required: true,
    example: '{JWT_TOKEN}',
    description: 'Auth Token',
  })
  @IsDefined()
  @IsString()
  @IsJWT()
  authToken!: string;

  @ApiProperty({
    required: true,
    example: '{JWT_TOKEN}',
    description: 'Refresh Token',
  })
  @IsDefined()
  @IsString()
  @IsJWT()
  refreshToken!: string;
}

export class VerifyMFAResponseDto extends ResponseDto {
  @ApiProperty({
    required: true,
    type: VerifyMFAResultDto,
    description: 'Verify MFA Result',
  })
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => VerifyMFAResultDto)
  result!: VerifyMFAResultDto;
}
