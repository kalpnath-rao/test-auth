import { GraphQLResultDto } from '@app/app.dto';
import { Field, ObjectType } from '@nestjs/graphql';
import { IsJWT, IsString } from 'class-validator';

@ObjectType()
export class OtpVerifyResponseDto extends GraphQLResultDto {
  @Field(() => String, {
    description:
      'Password Token when verify OTP at the time of forget password',
  })
  @IsString()
  @IsJWT()
  passwordToken!: string;
}
