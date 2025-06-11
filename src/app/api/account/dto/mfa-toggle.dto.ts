import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { ResponseDto } from '@api/api.dto';

export class ToggleMfaDto {
  @ApiProperty({
    description: 'Indicates whether MFA should be enabled or disabled',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  enabled: boolean;
}

export class ToggleMfaResponseDto extends ResponseDto {
  @ApiProperty({
    description: 'Change  Toggle Status',
  })
  result!: boolean;
}
