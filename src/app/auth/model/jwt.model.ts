export interface Jwt {
  sub: string;
  authorities: { authority: string }[];
  iat: number;
  exp: number;
}

export interface AuthTokens {
  authToken: string;
  refreshToken: string;
}
