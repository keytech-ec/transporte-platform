import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(loginDto: LoginDto) {
    // TODO: Implement login logic
    return { message: 'Login endpoint - to be implemented' };
  }

  async register(registerDto: RegisterDto) {
    // TODO: Implement register logic
    return { message: 'Register endpoint - to be implemented' };
  }
}

