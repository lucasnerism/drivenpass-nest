import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { CredentialsRepository } from './credentials.repository';

@Injectable()
export class CredentialsService {
  constructor(private readonly credentialsRepository: CredentialsRepository) {}

  async create(createCredentialDto: CreateCredentialDto, userId: number) {
    const credential = await this.findOneByTitle(
      createCredentialDto.title,
      userId,
    );
    if (credential)
      throw new ConflictException('Credential with this title already exists!');
    return this.credentialsRepository.create(createCredentialDto, userId);
  }

  findAll(userId: number) {
    return this.credentialsRepository.findAll(userId);
  }

  async findOne(id: number, userId: number) {
    const credential = await this.credentialsRepository.findOne(id);
    if (!credential) throw new NotFoundException();
    if (credential.userId !== userId) throw new ForbiddenException();
    return credential;
  }

  findOneByTitle(title: string, userId: number) {
    return this.credentialsRepository.findOneByTitle(title, userId);
  }

  update(id: number, updateCredentialDto: UpdateCredentialDto) {
    return `This action updates a #${id} credential`;
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    this.credentialsRepository.remove(id);
  }
}
