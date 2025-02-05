

import { RoleModel } from './role.interface';
import { UserGroupModel } from './usergroup.interface';
import { UserTeamModel } from './userteam.interface';


/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.UserModel
  */
export interface UserModel {

  userId: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  phoneNumber: string;
  language: string;
  groupIds: string[];
  groups: UserGroupModel[];
  roles: RoleModel[];
  teams: UserTeamModel[];
  expiration: Date;
}
