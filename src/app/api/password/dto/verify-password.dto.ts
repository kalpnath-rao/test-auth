import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { ResponseDto } from '@api/api.dto';

export class VerifyPasswordDto {
  @ApiProperty({
    description: 'Current Password',
    required: true,
    example: 'Admin@@321',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  currentPassword!: string;
}

export class VerifyPasswordResponseDto extends ResponseDto {
  @ApiProperty({
    description: 'Change Status',
  })
  result!: boolean;
}
