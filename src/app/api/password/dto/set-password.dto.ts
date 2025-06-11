import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ResponseDto } from '@api/api.dto';

export class SetPasswordDto {
  @ApiProperty({
    default: '{PWD}',
  })
  @IsNotEmpty()
  password!: string;
}

export class SetPasswordResponseDto extends ResponseDto {
  @ApiProperty({
    description: 'Set Status',
  })
  result!: boolean;
}
