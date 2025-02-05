
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
  dealerId: number;
  emailAddress: string;
  pnaCode: string;
  userTypeId: number;
  userRoleId: number;
  id: number;
  createdOn: string;
  updatedOn: string;
}
