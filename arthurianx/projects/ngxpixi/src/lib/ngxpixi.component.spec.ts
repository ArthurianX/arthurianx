import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxpixiComponent } from './ngxpixi.component';

describe('NgxpixiComponent', () => {
  let component: NgxpixiComponent;
  let fixture: ComponentFixture<NgxpixiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxpixiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxpixiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
