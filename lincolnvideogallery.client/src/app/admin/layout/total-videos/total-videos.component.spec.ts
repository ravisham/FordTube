import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalVideosComponent } from './total-videos.component';

describe('TotalVideosComponent', () => {
  let component: TotalVideosComponent;
  let fixture: ComponentFixture<TotalVideosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TotalVideosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
