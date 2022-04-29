import {Authority} from "../../auth/model/authority.model";

export class UserInfo {
  constructor(public username: string,
              public email: string,
              public enabledAt: Date | null,
              public authorities: Authority[]) {
  }
}

export interface UserAchievements {
  username: string,
  achievements: Achievement[]
}

export interface Achievement {
  name: string,
  value: string
}
