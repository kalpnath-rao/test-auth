import { hash, compare, genSalt } from 'bcryptjs';

class PasswordUtil {
  #salt!: string;
  async genSalt(): Promise<void> {
    if (!this.#salt) {
      this.#salt = await genSalt(+process.env.SALT_ROUND);
    }
  }
  async hash(pwd: string): Promise<string> {
    await this.genSalt();
    return await hash(pwd, this.#salt);
  }
  async compare(pwd: string, hash: string) {
    return await compare(pwd, hash);
  }
  async misMatch(pwd: string, hash: string) {
    return !(await this.compare(pwd, hash));
  }
}

export const passwordUtil = new PasswordUtil();
