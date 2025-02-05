import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { EditComponent } from './edit.component';

describe('EditComponent',
  () => {
    let comp: EditComponent;
    let fixture: ComponentFixture<EditComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [EditComponent],
        schemas: [NO_ERRORS_SCHEMA]
      });
      fixture = TestBed.createComponent(EditComponent);
      comp = fixture.componentInstance;
    });

    it('can load instance',
      () => {
        expect(comp).toBeTruthy();
      });

  });
