import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HomeComponent } from './home.component';

describe('HomeComponent',
  () => {
    let comp: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [HomeComponent],
        schemas: [NO_ERRORS_SCHEMA]
      });
      fixture = TestBed.createComponent(HomeComponent);
      comp = fixture.componentInstance;
    });

    it('can load instance',
      () => {
        expect(comp).toBeTruthy();
      });

  });
