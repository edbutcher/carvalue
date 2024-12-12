import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const users: User[] = [];
    const fakeUserService: Partial<UsersService> = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of the service', () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.singUp('test@test.com', 'test');

    expect(user.password).not.toEqual('test');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throw an error if user signs up with email that is use', async () => {
    await service.singUp('test@test.com', 'test');
    await expect(service.singUp('test@test.com', 'test')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if sign in is called with an unused email', async () => {
    await expect(service.singIn('test2@test.com', 'test')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throw if an invalid password is provided', async () => {
    await service.singUp('test@test.com', 'test');

    await expect(service.singIn('test@test.com', 'invalid')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('returns a user if correct password is provided', async () => {
    await service.singUp('test@test.com', 'password');

    const user = await service.singIn('test@test.com', 'password');
    expect(user).toBeDefined();
  });
});
