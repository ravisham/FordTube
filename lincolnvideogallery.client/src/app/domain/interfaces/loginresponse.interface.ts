

import { UserModel } from './user.interface';

/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.LoginResponseModel
  */
export interface LoginResponseModel {

  token: string;
  issuer: string;
  expiration: Date;
  email: string;
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  language: string;
  user: UserModel;
}

