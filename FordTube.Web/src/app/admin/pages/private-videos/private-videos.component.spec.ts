import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateVideosComponent } from './private-videos.component';

describe('PrivateVideosComponent', () => {
  let component: PrivateVideosComponent;
  let fixture: ComponentFixture<PrivateVideosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivateVideosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivateVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
