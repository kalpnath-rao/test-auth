import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ResponseDto } from '@api/api.dto';

export class ForgetPasswordDto {
  @ApiProperty({
    default: 'ashish@yopmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class ForgetPasswordResponseDto extends ResponseDto {
  @ApiProperty({
    description: 'Mail Status',
  })
  result!: boolean;
}
