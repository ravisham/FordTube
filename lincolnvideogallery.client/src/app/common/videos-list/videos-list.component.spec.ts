import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { VideosListComponent } from './videos-list.component';

describe('VideosListComponent',
  () => {
    let comp: VideosListComponent;
    let fixture: ComponentFixture<VideosListComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [VideosListComponent],
        schemas: [NO_ERRORS_SCHEMA]
      });
      fixture = TestBed.createComponent(VideosListComponent);
      comp = fixture.componentInstance;
    });

    it('can load instance',
      () => {
        expect(comp).toBeTruthy();
      });

  });
