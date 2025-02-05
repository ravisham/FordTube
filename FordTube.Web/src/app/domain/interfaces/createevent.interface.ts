



/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.CreateEventModel
  */
export interface CreateEventModel {

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
  ggroupIds: string[];
  moderatorIds: string[];
  password: string;
  accessControl: string;
  vcSipAddress: string;
  questionOption: string;
  presentationFileDownloadAllowed: boolean;
}

