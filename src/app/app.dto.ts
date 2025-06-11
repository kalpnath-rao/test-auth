import { ApiHeaderOptions, ApiProperty } from '@nestjs/swagger';
import { Language } from 'src/app/app.constants';
import { Field, Int, ObjectType } from '@nestjs/graphql';

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
    example: 'Asia/Kolkata',
  },
];

export class grpcRequestDto {
  id: string;
}

export interface ProfileDetail {
  msg: string;
}

@ObjectType()
export class GraphQLResponseDto {
  @Field(() => Int, {
    description: 'HTTP Status',
    defaultValue: 200,
  })
  statusCode!: number;

  @Field(() => String, {
    description: 'Message',
    defaultValue: 'Success',
  })
  message!: string;
}

@ObjectType()
export class GraphQLResultDto extends GraphQLResponseDto {
  @Field(() => String, {
    description: 'Result',
    defaultValue: 'Result',
  })
  result!: string;
}
