import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SideNavService } from '../side-nav/services/side-nav.service';
import { HeaderComponent } from './header.component';

describe('HeaderComponent',
  () => {
    let comp: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;

    beforeEach(() => {
      const sideNavServiceStub = {
        setToggleMenu: () => ({})
      };
      TestBed.configureTestingModule({
        declarations: [HeaderComponent],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          { provide: SideNavService, useValue: sideNavServiceStub }
        ]
      });
      fixture = TestBed.createComponent(HeaderComponent);
      comp = fixture.componentInstance;
    });

    it('can load instance',
      () => {
        expect(comp).toBeTruthy();
      });

    describe('toggle',
      () => {
        it('makes expected calls',
          () => {
            const sideNavServiceStub = fixture.debugElement.injector.get(SideNavService);
            spyOn(sideNavServiceStub, 'setToggleMenu');
            comp.toggle();
            expect(sideNavServiceStub.setToggleMenu).toHaveBeenCalled();
          });
      });

  });
