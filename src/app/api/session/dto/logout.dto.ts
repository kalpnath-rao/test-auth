import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from '@api/api.dto';

export class LogoutResponseDto extends ResponseDto {
  @ApiProperty({
    default: true,
    description: 'Result',
  })
  result!: boolean;
}
