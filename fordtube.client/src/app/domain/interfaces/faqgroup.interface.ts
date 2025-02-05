import { FaqModel } from './faq.interface';

/**
 * Model/Interface for: FordTube.DB.Models.FaqGroupModel
 */
export interface FaqGroupModel {
  id: number;
  name: string;
  faqs: FaqModel[];
}
