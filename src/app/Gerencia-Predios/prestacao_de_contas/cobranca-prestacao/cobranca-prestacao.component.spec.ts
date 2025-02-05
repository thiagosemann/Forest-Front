import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CobrancaPrestacaoComponent } from './cobranca-prestacao.component';

describe('CobrancaPrestacaoComponent', () => {
  let component: CobrancaPrestacaoComponent;
  let fixture: ComponentFixture<CobrancaPrestacaoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CobrancaPrestacaoComponent]
    });
    fixture = TestBed.createComponent(CobrancaPrestacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
