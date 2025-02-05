import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApartamentosControlComponent } from './apartamentos-control.component';

describe('ApartamentosControlComponent', () => {
  let component: ApartamentosControlComponent;
  let fixture: ComponentFixture<ApartamentosControlComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApartamentosControlComponent]
    });
    fixture = TestBed.createComponent(ApartamentosControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
