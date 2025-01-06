import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseTypeControllComponent } from './expense-type-controll.component';

describe('ExpenseTypeControllComponent', () => {
  let component: ExpenseTypeControllComponent;
  let fixture: ComponentFixture<ExpenseTypeControllComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpenseTypeControllComponent]
    });
    fixture = TestBed.createComponent(ExpenseTypeControllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
