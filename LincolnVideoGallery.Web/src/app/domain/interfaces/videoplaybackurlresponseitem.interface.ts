

import { CategoryModel } from './category.interface';

/**
  * Model/Interface for: FordTube.VBrick.Wrapper.Models.VideoPlaybackUrlResponseItemModel
  */
export interface VideoPlaybackUrlResponseItemModel {

  id: string;
  title: string;
  categories: CategoryModel[];
  featuredCategories: string[];
  description: string;
  htmlDescription: string;
  tags: string[];
  thumbnailUrl: string;
  playbackUrl: string;
}

