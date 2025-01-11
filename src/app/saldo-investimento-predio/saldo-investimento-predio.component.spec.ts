import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaldoInvestimentoPredioComponent } from './saldo-investimento-predio.component';

describe('SaldoInvestimentoPredioComponent', () => {
  let component: SaldoInvestimentoPredioComponent;
  let fixture: ComponentFixture<SaldoInvestimentoPredioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SaldoInvestimentoPredioComponent]
    });
    fixture = TestBed.createComponent(SaldoInvestimentoPredioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
