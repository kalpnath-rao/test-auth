import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ResponseDto } from '@api/api.dto';

export class ResetPasswordDto {
  @ApiProperty({
    default: '{PWD}',
  })
  @IsNotEmpty()
  password!: string;
}

export class ResetPasswordResponseDto extends ResponseDto {
  @ApiProperty({
    description: 'Reset Status',
  })
  result!: boolean;
}
