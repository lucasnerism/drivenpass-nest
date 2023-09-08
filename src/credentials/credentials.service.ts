import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { CredentialsRepository } from './credentials.repository';
import { CryptrService } from '../crypto/cryptr.service';
import { Credential } from '@prisma/client';

@Injectable()
export class CredentialsService {
  constructor(
    private readonly credentialsRepository: CredentialsRepository,
    private readonly CryptrService: CryptrService,
  ) {}

  async create(createCredentialDto: CreateCredentialDto, userId: number) {
    const credential = await this.findOneByTitle(
      createCredentialDto.title,
      userId,
    );
    if (credential)
      throw new ConflictException('Credential with this title already exists!');
    const hash = this.CryptrService.encrypt(createCredentialDto.password);
    return this.credentialsRepository.create(
      { ...createCredentialDto, password: hash },
      userId,
    );
  }

  async findAll(userId: number) {
    const credentials = await this.credentialsRepository.findAll(userId);
    return this.decryptCredentials(credentials);
  }

  async findOne(id: number, userId: number) {
    const credential = await this.credentialsRepository.findOne(id);
    if (!credential) throw new NotFoundException();
    if (credential.userId !== userId) throw new ForbiddenException();
    return this.decryptCredentials([credential])[0];
  }

  findOneByTitle(title: string, userId: number) {
    return this.credentialsRepository.findOneByTitle(title, userId);
  }

  async update(
    id: number,
    updateCredentialDto: CreateCredentialDto,
    userId: number,
  ) {
    const hash = this.CryptrService.encrypt(updateCredentialDto.password);
    await this.findOne(id, userId);
    await this.credentialsRepository.update(id, {
      ...updateCredentialDto,
      password: hash,
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    await this.credentialsRepository.remove(id);
  }

  private decryptCredentials(credentials: Credential[]) {
    return credentials.map((credential) => {
      return {
        ...credential,
        password: this.CryptrService.decrypt(credential.password),
      };
    });
  }
}
