export interface LoadMore {
  id?: string;

  scrollId?: string;

  currentPage: number;

  totalItems?: number;

  itemsPerPage: number;

  loadMore?: Function;
}
