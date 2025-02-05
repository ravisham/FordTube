import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AdminUploadComponent } from './admin.upload.component';

describe('AdminUploadComponent',
  () => {
    let comp: AdminUploadComponent;
    let fixture: ComponentFixture<AdminUploadComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [AdminUploadComponent],
        schemas: [NO_ERRORS_SCHEMA]
      });
      fixture = TestBed.createComponent(AdminUploadComponent);
      comp = fixture.componentInstance;
    });

    it('can load instance',
      () => {
        expect(comp).toBeTruthy();
      });

  });
