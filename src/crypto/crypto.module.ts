import { Global, Module } from '@nestjs/common';
import { BcryptService } from './bcrypt.service';
import { CryptrService } from './cryptr.service';

@Global()
@Module({
  providers: [BcryptService, CryptrService],
  exports: [BcryptService, CryptrService],
})
export class CryptoModule {}
