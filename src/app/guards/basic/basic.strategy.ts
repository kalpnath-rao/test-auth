import { EnvService } from '@shared/env';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  #username!: string;
  #password!: string;
  constructor({ AUTH }: EnvService) {
    super();
    this.#username = AUTH.USERNAME;
    this.#password = AUTH.PASSWORD;
  }
  validate(username: string, password: string): boolean {
    return username === this.#username && password === this.#password;
  }
}
