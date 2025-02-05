import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AdminArchivesComponent } from './admin.archives.component';

describe('AdminArchivesComponent',
  () => {
    let comp: AdminArchivesComponent;
    let fixture: ComponentFixture<AdminArchivesComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [AdminArchivesComponent],
        schemas: [NO_ERRORS_SCHEMA]
      });
      fixture = TestBed.createComponent(AdminArchivesComponent);
      comp = fixture.componentInstance;
    });

    it('can load instance',
      () => {
        expect(comp).toBeTruthy();
      });

  });
