import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAccessDeniedComponent } from './edit-access-denied.component';

describe('EditAccessDeniedComponent', () => {
  let component: EditAccessDeniedComponent;
  let fixture: ComponentFixture<EditAccessDeniedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAccessDeniedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAccessDeniedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
