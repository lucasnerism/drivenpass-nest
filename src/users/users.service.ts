import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { BcryptService } from '../crypto/bcrypt.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly BcryptService: BcryptService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hash = this.BcryptService.hash(createUserDto.password);
    return this.usersRepository.create({ ...createUserDto, password: hash });
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.usersRepository.findOneByEmail(email);
    return user;
  }

  async eraseUserData(userId: number, password: string) {
    const user = await this.findOne(userId);
    const valid = await this.BcryptService.compare(password, user.password);
    if (!valid) throw new UnauthorizedException();
    return this.usersRepository.deleteUserData(userId);
  }
}
