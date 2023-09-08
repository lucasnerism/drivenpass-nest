import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  private SALT: number = 10;

  hash(data: string): string {
    return bcrypt.hashSync(data, this.SALT);
  }

  async compare(pass: string, dbPass: string): Promise<boolean> {
    return bcrypt.compare(pass, dbPass);
  }
}
