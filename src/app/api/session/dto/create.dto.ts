import { IsDefined, IsJWT, IsString } from 'class-validator';
import { ResponseDto } from '@api/api.dto';
import { UserType } from '@app/app.constants';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDto {
  id: string;
  type: UserType;
  mfaToggleEnable?: boolean;
}

export class CreateResponseDto extends ResponseDto {
  @ApiProperty({
    required: true,
    example: '{{TOKEN}}',
    description: 'Access Token',
  })
  @IsDefined()
  @IsString()
  @IsJWT()
  result!: boolean;
}
