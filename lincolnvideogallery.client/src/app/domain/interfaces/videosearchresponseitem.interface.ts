

import { SpeechResultModel } from './speechresult.interface';

/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.VideoSearchResponseItemModel
  */
export interface VideoSearchResponseItemModel {

  id: string;
  title: string;
  description: string;
  categories: string[];
  tags: string[];
  thumbnailUrl: string;
  playbackUrl: string;
  duration: string;
  viewCount: number;
  status: string;
  approvalStatus: string;
  approvalProcessName: string;
  approvalProcessStepName: string;
  approvalProcessStepNumber: number;
  approvalProcessStepsCount: number;
  uploadedBy: string;
  whenUploaded: Date;
  whenModified: Date;
  averageRating: number;
  ratingsCount: number;
  speechResult: SpeechResultModel[];
  partOfSeries: boolean;
  uploadLater: boolean;
  uploadDate: Date;
}

