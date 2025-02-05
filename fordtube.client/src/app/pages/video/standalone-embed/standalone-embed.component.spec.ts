import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StandaloneEmbedComponent } from './standalone-embed.component';

describe('StandaloneEmbedComponent', () => {
  let component: StandaloneEmbedComponent;
  let fixture: ComponentFixture<StandaloneEmbedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StandaloneEmbedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StandaloneEmbedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
