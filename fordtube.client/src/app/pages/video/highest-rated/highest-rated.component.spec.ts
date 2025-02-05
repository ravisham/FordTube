import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HighestRatedComponent } from './highest-rated.component';

describe('HighestRatedComponent',
  () => {
    let component: HighestRatedComponent;
    let fixture: ComponentFixture<HighestRatedComponent>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
          declarations: [HighestRatedComponent]
        })
        .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(HighestRatedComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create',
      () => {
        expect(component).toBeTruthy();
      });
  });
