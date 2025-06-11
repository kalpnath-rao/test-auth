import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { GCPAction as Action , FileExtension } from '../storage.constants';

registerEnumType(Action, {
  name: 'GCPAction',
});

registerEnumType(FileExtension, {
  name: 'FileExtension',
});

@InputType()
export class GCPSignedUrlInput {
  @Field(() => Action, {
    description: 'Action (enum)',
  })
  @IsNotEmpty()
  @IsEnum(Action)
  action!: Action;

  @Field(() => FileExtension, {
    description: 'File extension (enum)',
  })
  @IsNotEmpty()
  @IsEnum(FileExtension)
  extension!: FileExtension;
}
