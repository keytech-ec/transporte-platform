import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserRole } from '@transporte-platform/database';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: UserRole;
  providerId: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    // Verify user still exists and is active
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { provider: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      providerId: user.providerId,
      provider: user.provider,
    };
  }
}

