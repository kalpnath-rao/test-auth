import { Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@ObjectType()
export class GCPSignedUrlOutput {
  @Field(() => String)
  @IsNotEmpty()
  url: string;

  @Field(() => String)
  @IsNotEmpty()
  name: string;

  @Field(() => String)
  @IsNotEmpty()
  path: string;
}
