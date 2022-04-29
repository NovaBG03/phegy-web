import {Jwt} from "./jwt.model";
import {Authority} from "./authority.model";

export class PhegyUser {
  public readonly token: string;
  public readonly refreshToken: string;

  public readonly username: string;
  public readonly authorities: Authority[];

  private readonly issuedAt: Date;
  private readonly expiration: Date;

  constructor(authToken: string, refreshToken: string) {
    this.token = authToken;
    this.refreshToken = refreshToken;

    const jwt = PhegyUser.parseJwt(authToken);
    this.username = jwt.sub;
    this.authorities = jwt.authorities.map(x => x.authority as Authority);
    this.issuedAt = new Date(jwt.iat * 1000);
    this.expiration = new Date(jwt.exp * 1000);
  }

  get isModeratorOrAdmin(): boolean {
    return this.hasAnyAuthority([Authority.Admin, Authority.Moderator]);
  }

  get isNotConfirmed(): boolean {
    return this.hasAnyAuthority([Authority.NotConfirmedUser]);
  }

  get isExpired(): boolean {
    return this.secondsUntilExpiration <= 0;
  }

  get secondsUntilExpiration(): number {
    return this.expiration.getTime() - new Date().getTime();
  }

  hasAnyAuthority(authorities: Authority[]): boolean {
    for (const currentAuthority of authorities) {
      if (this.authorities.includes(currentAuthority)) {
        return true;
      }
    }
    return false;
  }

  private static parseJwt(token: string): Jwt {
    const base64Url = token.split('.')[1];

    const base64 = base64Url.replace(/-/g, '+')
      .replace(/_/g, '/');

    const jsonPayload = decodeURIComponent(atob(base64).split('')
      .map(x => '%' + ('00' + x.charCodeAt(0).toString(16)).slice(-2))
      .join(''));

    return JSON.parse(jsonPayload);
  }
}
