import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LiveComponent } from './live.component';

describe('LiveComponent',
  () => {
    let comp: LiveComponent;
    let fixture: ComponentFixture<LiveComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [LiveComponent],
        schemas: [NO_ERRORS_SCHEMA]
      });
      fixture = TestBed.createComponent(LiveComponent);
      comp = fixture.componentInstance;
    });

    it('can load instance',
      () => {
        expect(comp).toBeTruthy();
      });

  });
