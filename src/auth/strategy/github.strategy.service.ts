import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-github2';
import { ENV } from 'src/common/util/env.constants';

@Injectable()
export class GithubStrategyService extends PassportStrategy(
  Strategy,
  'github',
) {
  constructor(private readonly configService: ConfigService) {
    const clientId = configService.get(ENV.GITHUB_CLIENT_ID) as string;
    const clientSecret = configService.get(ENV.GITHUB_SECRET) as string;
    const callbackUrl = configService.get(ENV.GITHUB_CALLBACK) as string;

    super({
      clientID: clientId,
      clientSecret: clientSecret,
      scope: ['user:email'],
      callbackURL: callbackUrl,
    });
  }
  validate(accessToken: string, refreshToken: string, profile: Profile) {
    // verifying user have a name
    const userFullName = profile?.displayName?.split(' ');

    return {
      email: profile?.emails?.[0],
      firstName: userFullName?.length > 0 ? userFullName[0] : '',
      lastName: userFullName?.length > 1 ? userFullName[1] : '',
      picture: profile?.photos?.[0]?.value,
      userName: profile?.username,
      provider: 'github',
    };
  }
}
