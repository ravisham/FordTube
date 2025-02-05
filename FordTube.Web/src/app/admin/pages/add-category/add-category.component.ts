import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { CategoryModel } from '../../../domain/interfaces/category.interface';
import { CategoriesService } from '../../../domain/services/categories.service';
import { FranchiseType } from '../../../domain/enums/franchisetype.enum';
import { AdminMenuItems } from '../../layout/admin-nav/enum/menu-items';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent implements OnInit {
  categories;
  selected_parent = 'none';
  name: string;
  franchise: string;
  currentMenuItem = AdminMenuItems.Categories;

  constructor(private categoriesService: CategoriesService, private router: Router, private activatedRoute: ActivatedRoute) {}

  saveChanges() {
    this.categoriesService
      .add({ name: this.name, parentCategoryId: this.selected_parent === 'none' ? null : this.selected_parent, franchise: this.franchise === '0' ? FranchiseType.Ford : FranchiseType.Lincoln })
      .subscribe(
        result => {
          this.router.navigate(['admin/categories', this.franchise]);
        },
        error => console.log('Error: ', error)
      );
  }

  ngOnInit() {
    this.franchise = this.activatedRoute.snapshot.paramMap.get('franchise');
    console.log(this.franchise);
    this.categoriesService.franchiseCategories(this.franchise === '0' ? FranchiseType.Ford : FranchiseType.Lincoln).subscribe(
      response => {
        this.categories = response.filter((element: CategoryModel) => {
          return element.categoryId != null;
        });
        const firstElement = {
          name: 'None',
          fullpath: 'None',
          categoryId: 'none'
        };
        this.categories.unshift(firstElement);
      },
      error => console.log('Error: ', error)
    );
  }
}
