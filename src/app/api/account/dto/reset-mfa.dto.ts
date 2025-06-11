import { ApiProperty } from '@nestjs/swagger';

export class ResetMFAResponseDto {
  @ApiProperty({
    description: 'HTTP Status',
    default: 200,
  })
  statusCode!: number;
  @ApiProperty({
    description: 'Message',
    default: 'ACCOUNT.MFA_RESET',
  })
  message!: string;
}

export class SubadminResetMFAResponseDto {
  @ApiProperty({
    description: 'HTTP Status',
    default: 200,
  })
  statusCode!: number;
  @ApiProperty({
    description: 'Message',
    default: 'ACCOUNT.SUBADMIN_RESET',
  })
  message!: string;
}
