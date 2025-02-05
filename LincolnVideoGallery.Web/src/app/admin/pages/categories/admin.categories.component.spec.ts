import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AdminCategoriesComponent } from './admin.categories.component';

describe('AdminCategoriesComponent',
  () => {
    let comp: AdminCategoriesComponent;
    let fixture: ComponentFixture<AdminCategoriesComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [AdminCategoriesComponent],
        schemas: [NO_ERRORS_SCHEMA]
      });
      fixture = TestBed.createComponent(AdminCategoriesComponent);
      comp = fixture.componentInstance;
    });

    it('can load instance',
      () => {
        expect(comp).toBeTruthy();
      });

  });
