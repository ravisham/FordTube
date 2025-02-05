import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FooterComponent } from './footer.component';

describe('FooterComponent',
  () => {
    let comp: FooterComponent;
    let fixture: ComponentFixture<FooterComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [FooterComponent],
        schemas: [NO_ERRORS_SCHEMA]
      });
      fixture = TestBed.createComponent(FooterComponent);
      comp = fixture.componentInstance;
    });

    it('can load instance',
      () => {
        expect(comp).toBeTruthy();
      });

  });
