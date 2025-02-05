import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { CategoriesService } from '../../../../domain/services/categories.service';
import { GetCategoryModel } from '../../../../domain/interfaces/getcategory.interface';

@Injectable({
  providedIn: 'root'
})
export class FranchiseListResolverService implements Resolve<GetCategoryModel[]> {
  constructor(private categoriesService: CategoriesService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<GetCategoryModel[]> {
    return this.categoriesService.getFranchise().pipe(response => response);
  }
}
