import { CategoryModel } from './category.interface';
import { BackgroundImageModel } from './backgroundimage.interface';
import { CustomFieldModel } from './customfield.interface';


/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.EventModel
  */
export interface EventModel {

  id: string;  // JSON property: id
  title: string;  // JSON property: title
  description: string;  // JSON property: description
  startDate: string;  // JSON property: startDate
  endDate: string;  // JSON property: endDate
  listingType: string;  // JSON property: listingType
  eventUrl: string;  // JSON property: eventUrl
  backgroundImages: BackgroundImageModel[];  // JSON property: backgroundImages
  categories: CategoryModel[];  // JSON property: categories
  tags: string[];  // JSON property: tags
  unlisted: boolean;  // JSON property: unlisted
  estimatedAttendees: number;  // JSON property: estimatedAttendees
  lobbyTimeMinutes: number;  // JSON property: lobbyTimeMinutes
/*  preProduction: PreProductionModel;  // JSON property: preProduction*/
  shortcutName: string;  // JSON property: shortcutName
  shortcutNameUrl: string;  // JSON property: shortcutNameUrl
  linkedVideoId: string;  // JSON property: linkedVideoId
  autoAssociateVod: boolean;  // JSON property: autoAssociateVod
  redirectVod: boolean;  // JSON property: redirectVod
  customFields: CustomFieldModel[];  // JSON property: customFields
  webcastType: string;  // JSON property: webcastType
  presenterId: string;  // JSON property: presenterId
  presenterIds: string[];  // JSON property: presenterIds
  attendeeJoinMethod: string;  // JSON property: attendeeJoinMethod
/*  externalPresenters: ExternalPresenterModel[];  // JSON property: externalPresenters*/
}

