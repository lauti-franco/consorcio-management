import { Strategy } from 'passport';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor() {
    super();
  }

  async validate(req: any): Promise<any> {
    const refreshToken = req.body.refreshToken;
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    return { refreshToken };
  }
}