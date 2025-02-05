
export interface IUser {
  userRole: {
    id: number;
    name: string;
    description: string;
  };
  userType: {
    id: number;
    name: string;
    description: string;
  };
  lazyLoader: any;
  userName: string;
  firstName: string;
  lastName: string;
  starsId: string;
  dealerId: number;
  emailAddress: string;
  franchise: number;
  pnaCode: string;
  userTypeId: number;
  userRoleId: number;
  id: number;
  createdOn: string;
  updatedOn: string;
}
