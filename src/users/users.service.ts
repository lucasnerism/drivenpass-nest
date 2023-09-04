import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    return this.usersRepository.create(createUserDto);
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

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
