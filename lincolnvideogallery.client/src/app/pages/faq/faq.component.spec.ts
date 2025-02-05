import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FaqService } from '../../domain/services/faq.service';
import { FaqComponent } from './faq.component';

describe('FaqComponent',
  () => {
    let comp: FaqComponent;
    let fixture: ComponentFixture<FaqComponent>;

    beforeEach(() => {
      const faqServiceStub = {
        get: () => ({
          subscribe: () => ({})
        })
      };
      TestBed.configureTestingModule({
        declarations: [FaqComponent],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          { provide: FaqService, useValue: faqServiceStub }
        ]
      });
      fixture = TestBed.createComponent(FaqComponent);
      comp = fixture.componentInstance;
    });

    it('can load instance',
      () => {
        expect(comp).toBeTruthy();
      });

    describe('ngOnInit',
      () => {
        it('makes expected calls',
          () => {
            const faqServiceStub = fixture.debugElement.injector.get(FaqService);
            spyOn(faqServiceStub, 'get');
            comp.ngOnInit();
            expect(faqServiceStub.get).toHaveBeenCalled();
          });
      });

  });
