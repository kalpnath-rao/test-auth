import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { Writable } from 'stream';

class MFAUtil {
  create(user_name: string) {
    const secretCode = speakeasy.generateSecret({
      name: `Accelerator (${user_name})`,
      issuer: `Accelerator`,
    });
    return {
      url: secretCode.otpauth_url as string,
      secret: secretCode.base32,
    };
  }
  async respond(res: Writable, url: string) {
    await QRCode.toFileStream(res, url);
  }
  async toBuffer(url: string): Promise<Buffer> {
    return await QRCode.toBuffer(url);
  }
  async toUrl(url: string) {
    return await QRCode.toDataURL(url);
  }
  async generate(user_name: string) {
    const result = this.create(user_name);
    return {
      secret: result.secret,
      qr_url: await this.toUrl(result.url),
    };
  }
  verify(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      token,
      secret,
      encoding: 'base32',
    });
  }
}
export const mfaUtil = new MFAUtil();
