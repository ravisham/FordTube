
import { UserTeamModel } from './userteam.interface';

/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.UserModel
  */
export interface UserModel {

  userName: string;

  firstName: string;

  lastName: string;

  email: string;

  title: string;

  phoneNumber: string;

  language: string;

  groupIds: string[];

  roleIds: string[];

  teams: UserTeamModel[];

}
