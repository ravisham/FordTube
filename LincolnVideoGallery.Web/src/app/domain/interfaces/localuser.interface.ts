export interface LocalUser {
  userName: string;
  firstName: string;
  lastName: string;
  dealerId: number;
  emailAddress: string;
  phoneNumber?: string;
  starsId?: string;
  pnaCode: string;
  userRoleId: number;
  userTypeId: number;
  starsDateChecked: Date;
  disclaimerDateChecked: Date;
  userRole?: {
    id: number;
    name: string;
    description: string;
  };
  userType?: {
    id: number;
    name: string;
    description: string;
  };
}
