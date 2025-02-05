import { SortFieldType } from '../enums/sortfieldtype.enum';
import { SortDirectionType } from '../enums/sortdirectiontype.enum';
import { SearchFieldType } from '../enums/searchfieldtype.enum';

export interface SearchInterface {
  query: string;
  categoryIds: string[];
  sortField: SortFieldType;
  sortDirection: SortDirectionType;
  tags: boolean;
}
