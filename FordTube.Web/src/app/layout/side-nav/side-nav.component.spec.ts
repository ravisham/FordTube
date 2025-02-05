import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ElementRef } from '@angular/core';
import { SideNavService } from './services/side-nav.service';
import { SideNavComponent } from './side-nav.component';

describe('SideNavComponent',
  () => {
    let comp: SideNavComponent;
    let fixture: ComponentFixture<SideNavComponent>;

    beforeEach(() => {
      const elementRefStub = {
        nativeElement: {
          contains: () => ({})
        }
      };
      const sideNavServiceStub = {
        getToggleMenu: () => ({
          subscribe: () => ({})
        }),
        IsMenuOpen: {},
        setToggleMenu: () => ({})
      };
      TestBed.configureTestingModule({
        declarations: [SideNavComponent],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          { provide: ElementRef, useValue: elementRefStub },
          { provide: SideNavService, useValue: sideNavServiceStub }
        ]
      });
      fixture = TestBed.createComponent(SideNavComponent);
      comp = fixture.componentInstance;
    });

    it('can load instance',
      () => {
        expect(comp).toBeTruthy();
      });

    it('state defaults to: void',
      () => {
        expect(comp.state).toEqual('void');
      });

    describe('ngOnInit',
      () => {
        it('makes expected calls',
          () => {
            const sideNavServiceStub = fixture.debugElement.injector.get(SideNavService);
            spyOn(sideNavServiceStub, 'getToggleMenu');
            comp.ngOnInit();
            expect(sideNavServiceStub.getToggleMenu).toHaveBeenCalled();
          });
      });

    describe('toggleMenu',
      () => {
        it('makes expected calls',
          () => {
            const sideNavServiceStub = fixture.debugElement.injector.get(SideNavService);
            spyOn(sideNavServiceStub, 'setToggleMenu');
            comp.toggleMenu();
            expect(sideNavServiceStub.setToggleMenu).toHaveBeenCalled();
          });
      });

  });
