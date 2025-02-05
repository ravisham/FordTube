



/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.EventDetailsModel
  */
export interface EventDetailsModel {

  eventId: string;
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
  forceAnonymousQuestions: string;
  questionAndAnswerEnabled: boolean;
  userIds: string[];
  groupIds: string[];
  password: string;
  accessControl: string;
  eventUrl: string;
  icsFileUrl: string;
  vcSipAddress: string;
  unlisted: boolean;
}

