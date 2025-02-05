import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { WatchComponent } from './watch.component';

describe('WatchComponent',
  () => {
    let comp: WatchComponent;
    let fixture: ComponentFixture<WatchComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [WatchComponent],
        schemas: [NO_ERRORS_SCHEMA]
      });
      fixture = TestBed.createComponent(WatchComponent);
      comp = fixture.componentInstance;
    });

    it('can load instance',
      () => {
        expect(comp).toBeTruthy();
      });

  });
