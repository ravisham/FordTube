

import { TeamMemberModel } from './teammember.interface';

/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.AddTeamModel
  */
export interface AddTeamModel {

  name: string;
  description: string;
  teamMembers: TeamMemberModel[];
  userIds: string[];
  groupIds: string[];
}

