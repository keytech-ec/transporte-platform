import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole, UserStatus } from '@transporte-platform/database';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { provider: true },
    });

    if (!user) {
      return null;
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('User account is not active');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      providerId: user.providerId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        providerId: user.providerId,
        provider: user.provider,
      },
    };
  }

  async register(registerDto: RegisterDto, currentUser?: any) {
    // Only SUPER_ADMIN can create users
    if (currentUser && currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only SUPER_ADMIN can create users');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate provider if provided
    if (registerDto.providerId) {
      const provider = await this.prisma.provider.findUnique({
        where: { id: registerDto.providerId },
      });

      if (!provider) {
        throw new NotFoundException('Provider not found');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash,
        role: registerDto.role || UserRole.OPERATOR,
        providerId: registerDto.providerId || null,
      },
      include: { provider: true },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { provider: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async refresh(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      providerId: user.providerId,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

