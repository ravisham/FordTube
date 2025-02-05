import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlaggedVideosComponent } from './flagged-videos.component';

describe('FlaggedVideosComponent', () => {
  let component: FlaggedVideosComponent;
  let fixture: ComponentFixture<FlaggedVideosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlaggedVideosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlaggedVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
