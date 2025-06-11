import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { ResponseDto } from '@api/api.dto';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current Password',
    required: true,
    example: 'Admin@@321',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  currentPassword!: string;

  @ApiProperty({
    description: 'New Password',
    required: true,
    example: 'Admin@@321',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  newPassword!: string;
}

export class ChangePasswordResponseDto extends ResponseDto {
  @ApiProperty({
    description: 'Change Status',
  })
  result!: boolean;
}
