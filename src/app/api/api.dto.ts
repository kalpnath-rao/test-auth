import { ApiHeaderOptions, ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDefined } from 'class-validator';
import { Language, Timezone } from '../../app/app.constants';

export enum Platform {
  Ios = '1',
  Android = '2',
  Web = '3',
}

export class ResponseDto {
  @ApiProperty({
    description: 'HTTP Status',
    default: 200,
  })
  statusCode!: number;
  @ApiProperty({
    description: 'Message',
    default: 'Success',
  })
  message!: string;
}

export class ErrorReasonDto {
  @ApiProperty({
    description: 'Error Reason',
  })
  message!: string;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP Status',
    default: 422,
  })
  statusCode!: number;
  @ApiProperty({
    description: 'Error Message',
    default: 'Something went wrong',
  })
  message!: string;
  @ApiProperty({
    description: 'HTTP Message',
    default: 'Unprocessable Entity',
  })
  error!: string;
  @ApiProperty({
    isArray: true,
    type: ErrorReasonDto,
    description: 'Possible Error Reasons',
  })
  reasons!: ErrorReasonDto[];
}

export const COMMON_HEADERS: ApiHeaderOptions[] = [
  {
    name: 'Accept-Language',
    required: true,
    enum: Language,
    example: Language.En,
  },
  {
    name: 'Timezone',
    required: true,
    enum: Timezone,
    example: 'Asia/Kolkata',
  },

  {
    name: 'Platform',
    required: true,
    enum: Platform,
    example: Platform.Web,
  },
  {
    name: 'Device-Token',
    required: false,
    example: 'hejkqdcy2chhb',
  },
];

export class CacheClearDto {
  @ApiProperty({
    type: [String],
    example: ['key1', 'key2'],
    description: 'Please provide array of tags',
  })
  @IsDefined()
  @IsArray()
  keys: string[];
}
