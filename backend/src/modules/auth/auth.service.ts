import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { DatabaseService } from '../../database/database.service';

import { RegisterDto } from './dto/register.dto';

import { AuthResponse } from './interfaces/auth-response.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<AuthResponse> {
    const { name, email, password } = registerDto;

    const existingUser =
      await this.databaseService.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      throw new BadRequestException(
        'Email already exists',
      );
    }

    const passwordHash = await bcrypt.hash(
      password,
      10,
    );

    const user =
      await this.databaseService.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });

    await this.databaseService.profile.create({
      data: {
        userId: user.id,
      },
    });

    return {
      success: true,
      message: 'User registered successfully',
    };
  }
}