import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import googleOauthConfig from '../config/google-oauth.config';
import { ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrattegy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private readonly googleConfig: ConfigType<typeof googleOauthConfig>,
    private readonly authSevice: AuthService,
  ) {
    super({
      clientID: googleConfig.clientId || '',
      clientSecret: googleConfig.clientSecret || '',
      callbackURL: googleConfig.callbackUrl || '',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const user = await this.authSevice.validateGoogleUser({
      email: profile.emails[0].value,
      name: profile.displayName,
      password: '',
    });

    done(null, user);
  }
}
