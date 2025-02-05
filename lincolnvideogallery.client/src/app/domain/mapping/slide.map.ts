import { CreateSlideRequestModel } from '../interfaces/createsliderequest.interface';
import { SlideModel } from '../interfaces/slide.interface';
import { Mapping } from './interfaces/mapping.interface';
import { environment } from '../../../environments/environment';
import { SlideDtoModel } from '../interfaces/slidedto.interface';

/**
 *
 *
 * @export
 * @class SlideMap
 * @implements {Mapping<CreateSlideRequestModel, SlideModel, SlideDtoModel>}
 */
export class SlideMap implements Mapping<CreateSlideRequestModel, SlideModel, SlideDtoModel> {
  public id?: number;
  public updatedOn?: Date;
  public createdOn?: Date;
  public activeDate?: Date;
  public activeTime?: string;
  public inactiveDate?: Date;
  public inactiveTime?: string;
  public franchise?: number = environment.franchise;
  public backgroundImageUrl?: string;
  public backgroundColor?: string;
  public link?: string;
  public text?: string;
  public textPosition?: number;
  public backgroundImage: any;
  public isNew?: boolean;
  public isModifying?: boolean;

  /**
   *
   *
   * @returns {CreateSlideRequestModel}
   * @memberof SlideMap
   */
  toModel?(): CreateSlideRequestModel {
    return {
      activeDate: this.activeDate,
      activeTime: this.activeTime,
      inactiveDate: this.inactiveDate,
      inactiveTime: this.inactiveTime,
      backgroundColor: this.backgroundColor || '',
      backgroundImage: this.backgroundImage,
      franchise: this.franchise || 0,
      link: this.link || '',
      text: this.text || '',
      textPosition: this.textPosition || 0
    };
  }

  /**
   *
   *
   * @param {CreateSlideRequestModel} requestModel
   * @memberof SlideMap
   */
  fromModel?(requestModel: CreateSlideRequestModel) {
    this.activeDate = requestModel.activeDate;
    this.activeTime = requestModel.activeTime;
    this.inactiveDate = requestModel.inactiveDate;
    this.inactiveTime = requestModel.inactiveTime;
    this.backgroundColor = requestModel.backgroundColor;
    this.backgroundImage = requestModel.backgroundImage;
    this.franchise = requestModel.franchise;
    this.link = requestModel.link;
    this.text = requestModel.text;
    this.textPosition = requestModel.textPosition;
  }

  /**
   *
   *
   * @returns {SlideModel}
   * @memberof SlideMap
   */
  toEntity?(): SlideModel {
    return {
      activeDate: this.activeDate,
      activeTime: this.activeTime,
      inactiveDate: this.inactiveDate,
      inactiveTime: this.inactiveTime,
      backgroundColor: this.backgroundColor || '', // Assign a default value if undefined
      backgroundImageUrl: this.backgroundImageUrl || '', // Assign a default value if undefined
      franchise: this.franchise || 0, // Assign a default value if undefined
      id: this.id || 0, // Assign a default value if undefined
      link: this.link || '', // Assign a default value if undefined
      text: this.text || '', // Assign a default value if undefined
      textPosition: this.textPosition || 0 // Assign a default value if undefined
    };
  }

  /**
   *
   *
   * @param {SlideModel} SlideModel
   * @memberof SlideMap
   */
  fromEntity?(slide: SlideModel) {
    this.activeDate = slide.activeDate;
    this.activeTime = slide.activeTime;
    this.inactiveDate = slide.inactiveDate;
    this.inactiveTime = slide.inactiveTime;
    this.backgroundColor = slide.backgroundColor;
    this.backgroundImageUrl = slide.backgroundImageUrl;
    this.franchise = slide.franchise;
    this.id = slide.id;
    this.link = slide.link;
    this.text = slide.text;
    this.textPosition = slide.textPosition;
  }

  /**
   *
   *
   * @returns {SlideDtoModel}
   * @memberof SlideMap
   */
  toDto?(): SlideDtoModel {
    return {
      id: this.id || 0,
      activeDate: this.activeDate,
      activeTime: this.activeTime,
      inactiveDate: this.inactiveDate,
      inactiveTime: this.inactiveTime,
      backgroundColor: this.backgroundColor || '',
      backgroundImageUrl: this.backgroundImageUrl || '',
      franchise: this.franchise || 0,
      backgroundImage: this.backgroundImage,
      link: this.link || '',
      text: this.text || '',
      textPosition: this.textPosition || 0
    };
  }

  /**
   *
   *
   * @param {SlideDtoModel} dto
   * @memberof SlideMap
   */
  fromDto?(dto: SlideDtoModel) {
    (this.id = dto.id || this.id), (this.activeDate = dto.activeDate), (this.inactiveDate = dto.inactiveDate);
    this.activeTime = dto.activeTime;
    this.inactiveTime = dto.inactiveTime;
    this.backgroundColor = dto.backgroundColor;
    this.backgroundImageUrl = dto.backgroundImageUrl;
    this.backgroundImage = dto.backgroundImage;
    this.franchise = dto.franchise;
    this.link = dto.link;
    this.text = dto.text;
    this.textPosition = dto.textPosition;
  }
}
