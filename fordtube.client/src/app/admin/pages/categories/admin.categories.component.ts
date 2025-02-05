import { Component, OnInit } from '@angular/core';
import { CategoriesService } from '../../../domain/services/categories.service';
import { CategoryModel } from '../../../domain/interfaces/category.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { FranchiseType } from '../../../domain/enums/franchisetype.enum';
import { AdminMenuItems } from '../../layout/admin-nav/enum/menu-items';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin.categories.component.html',
  styleUrls: ['./admin.categories.component.scss']
})
export class AdminCategoriesComponent implements OnInit {
  fordCategories: CategoryModel[] = [];
  lincolnCategories: CategoryModel[] = [];
  categories: CategoryModel[] = [];
  franchiseCategories: string[] = [];
  franchise = environment.franchise;
  currentMenuItem = AdminMenuItems.Categories;
  reverseSort = false;
  sortField = 'fullpath';

  constructor(private router: Router, private categoriesService: CategoriesService, private activatedRoute: ActivatedRoute) {}

  setSortField(field: string) {
    if (field !== this.sortField) {
      this.reverseSort = false;
      this.sortField = field;
      return;
    }
    this.reverseSort = !this.reverseSort;
  }

  removeCategory(categoryId: string) {
    this.categoriesService.delete(categoryId).subscribe(
      result => {
        const filtered = this.categories.filter(category => {
          return category.categoryId !== categoryId;
        });
        this.categories = filtered;
      },
      error => console.log('Error: ', error)
    );
    return false;
  }

  franchiseChanged() {
    if (this.franchise === 0) {
      this.categories = this.fordCategories;
    } else {
      this.categories = this.lincolnCategories;
    }
  }

  ngOnInit() {
    const franchiseParam = this.activatedRoute.snapshot.paramMap.get('franchise');
    this.franchise = parseInt(franchiseParam == null ? this.franchise.toString() : franchiseParam, 10);
    this.franchiseCategories = ['Ford', 'Lincoln'];
    this.categoriesService.franchiseCategories(FranchiseType.Ford).subscribe(
      resultArray => {
        this.fordCategories = resultArray.filter(function(element: CategoryModel) {
          return element.categoryId != null;
        });
        if (this.franchise === 0) {
          this.categories = this.fordCategories;
        }
      },
      error => console.log('Error: ', error)
    );
    this.categoriesService.franchiseCategories(FranchiseType.Lincoln).subscribe(
      resultArray => {
        this.lincolnCategories = resultArray.filter(function(element: CategoryModel) {
          return element.categoryId != null;
        });
        if (this.franchise === 1) {
          this.categories = this.lincolnCategories;
        }
      },
      error => console.log('Error: ', error)
    );
  }
}
