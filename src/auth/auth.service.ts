import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { hash, verify } from 'argon2';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import { JwtService } from '@nestjs/jwt';
import refreshConfig from './config/refresh.config';
import { ConfigType } from '@nestjs/config';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(refreshConfig.KEY)
    private readonly refreshTokenConfig: ConfigType<typeof refreshConfig>,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    const user = await this.userService.findByEmail(createUserDto.email);
    if (user) throw new ConflictException('User already exists!');
    return this.userService.create(createUserDto);
  }

  async validateLocalUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) throw new UnauthorizedException('User not found!');
    if (user.blockedAt) throw new UnauthorizedException('User blocked!');
    if (user.deletedAt) throw new UnauthorizedException('User deleted!');

    const isPasswordMatched = await verify(user.password, password);

    if (!isPasswordMatched)
      throw new UnauthorizedException('Invalid Credentials!');

    return { id: user.id, name: user.name, role: user.role };
  }

  async login(userId: string, name: string, role: Role) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);

    const hashedRT = await hash(refreshToken);

    await this.userService.updateHashedRefreshToken(userId, hashedRT);

    return {
      id: userId,
      name,
      role,
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(userId: string) {
    const payload: AuthJwtPayload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);

    return { accessToken, refreshToken };
  }

  async validateJwtUser(userId: string) {
    const user = await this.userService.findOne(userId);

    if (!user) throw new UnauthorizedException('User not found!');
    if (user.blockedAt) throw new UnauthorizedException('User blocked!');
    if (user.deletedAt) throw new UnauthorizedException('User deleted!');

    const currentUser = { id: user.id, role: user.role };
    return currentUser;
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userService.findOne(userId);

    if (!user) throw new UnauthorizedException('User not found!');
    if (user.blockedAt) throw new UnauthorizedException('User blocked!');
    if (user.deletedAt) throw new UnauthorizedException('User deleted!');

    if (!user.hashedRefreshToken)
      throw new UnauthorizedException('User was signed out');

    const refreshTokenMatched = await verify(
      user.hashedRefreshToken,
      refreshToken,
    );

    if (!refreshTokenMatched)
      throw new UnauthorizedException('Invalid refresh token!');

    const currentUser = { id: user.id, role: user.role };
    return currentUser;
  }

  async refreshToken(userId: string, name: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);

    const hashedRT = await hash(refreshToken);

    await this.userService.updateHashedRefreshToken(userId, hashedRT);

    return {
      id: userId,
      name,
      accessToken,
      refreshToken,
    };
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.userService.findByEmail(googleUser.email);

    if (user) return user;

    return await this.userService.create(googleUser);
  }

  async signOut(userId: string) {
    return await this.userService.updateHashedRefreshToken(userId, null);
  }
}
