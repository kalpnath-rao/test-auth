import nanoid from 'nanoid';

export class OpenId {
  static create(len: number): string {
    return nanoid.customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', len)();
  }
  static format(prefix: string, len = 10): string {
    return `${prefix}-${this.create(len)}`;
  }
}
