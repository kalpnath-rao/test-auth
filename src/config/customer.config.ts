import { IsBoolean, IsOptional } from 'class-validator';

export class CustomerConfig {
  @IsOptional()
  @IsBoolean()
  readonly SIGNUP_VERIFY: boolean = false;
}
