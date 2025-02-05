



/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.EditEventModel
  */
export interface EditEventModel {

  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  presentationProfileId: string;
  eventAdminId: string;
  eventAdminIds: string[];
  automatedWebcast: boolean;
  closedCaptionsEnabled: boolean;
  pollsEnabled: boolean;
  chatEnabled: boolean;
  questionAndAnswerEnabled: boolean;
  userIds: string[];
  groupIds: string[];
  moderatorIds: string[];
  password: string;
  accessControl: string;
  vcSipAddress: string;
  questionOption: string;
  presentationFileDownloadAllowed: boolean;
}

