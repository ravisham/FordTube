import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { SearchPanelInterface } from '../../../domain/interfaces/search-panel.interface';
import { CategoriesService } from '../../../domain/services/categories.service';

@Component({
  selector: 'app-search-panel',
  templateUrl: './search-panel.component.html',
  styleUrls: ['./search-panel.component.scss']
})
export class SearchPanelComponent implements OnInit {
  filter: SearchPanelInterface;
  categories;
  query: string;
  category = 'all';
  categoryIds: string[];
  @Output()
  searchEvent = new EventEmitter<SearchPanelInterface>();

  constructor(private categoriesService: CategoriesService) {}

  callSearch() {
    if (this.category === 'all') {
      this.filter.categoryIds = this.categoryIds;
    } else {
      this.filter.categoryIds = [this.category];
    }
    this.filter.query = this.query;
    this.searchEvent.emit(this.filter);

    const categoryFullPath = this.categories.find((c: { categoryId: string; }) => c.categoryId === this.category);

    window["dataLayer"].push({
      event: "category",
      title: categoryFullPath.fullpath
    });

    return false;
  }

  ngOnInit() {
    this.filter = {
      query: '',
      categoryIds: []
    };
    this.categoriesService.get().subscribe(
      response => {
        this.categories = response;
        this.categoryIds = this.categories.map(c => c.categoryId);
        this.categories.unshift({
          name: 'All',
          fullpath: 'All',
          categoryId: 'all'
        });
      },
      error => console.log('Error: ', error)
    );
  }
}
