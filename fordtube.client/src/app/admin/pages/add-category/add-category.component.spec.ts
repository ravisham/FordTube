import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriesService } from '../../../domain/services/categories.service';
import { AddCategoryComponent } from './add-category.component';

describe('AddCategoryComponent',
  () => {
    let comp: AddCategoryComponent;
    let fixture: ComponentFixture<AddCategoryComponent>;

    beforeEach(() => {
      const routerStub = {
        navigate: () => ({})
      };
      const categoriesServiceStub = {
        add: () => ({
          subscribe: () => ({})
        }),
        get: () => ({
          subscribe: () => ({})
        })
      };
      TestBed.configureTestingModule({
        declarations: [AddCategoryComponent],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          { provide: Router, useValue: routerStub },
          { provide: CategoriesService, useValue: categoriesServiceStub }
        ]
      });
      fixture = TestBed.createComponent(AddCategoryComponent);
      comp = fixture.componentInstance;
    });

    it('can load instance',
      () => {
        expect(comp).toBeTruthy();
      });

    it('selected_parent defaults to: none',
      () => {
        expect(comp.selected_parent).toEqual('none');
      });

    describe('saveChanges',
      () => {
        it('makes expected calls',
          () => {
            const routerStub = fixture.debugElement.injector.get(Router);
            const categoriesServiceStub = fixture.debugElement.injector.get(CategoriesService);
            spyOn(routerStub, 'navigate');
            spyOn(categoriesServiceStub, 'add');
            comp.saveChanges();
            expect(routerStub.navigate).toHaveBeenCalled();
            expect(categoriesServiceStub.add).toHaveBeenCalled();
          });
      });

    describe('ngOnInit',
      () => {
        it('makes expected calls',
          () => {
            const categoriesServiceStub = fixture.debugElement.injector.get(CategoriesService);
            spyOn(categoriesServiceStub, 'get');
            comp.ngOnInit();
            expect(categoriesServiceStub.get).toHaveBeenCalled();
          });
      });

  });
