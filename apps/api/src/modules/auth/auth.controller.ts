import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@transporte-platform/database';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Iniciar sesión' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar nuevo usuario (solo SUPER_ADMIN)' })
  async register(
    @Body() registerDto: RegisterDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.authService.register(registerDto, currentUser);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener datos del usuario actual' })
  async getCurrentUser(@CurrentUser() user: any) {
    return this.authService.getCurrentUser(user.id);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Renovar token JWT' })
  async refresh(@CurrentUser() user: any) {
    return this.authService.refresh(user);
  }
}

