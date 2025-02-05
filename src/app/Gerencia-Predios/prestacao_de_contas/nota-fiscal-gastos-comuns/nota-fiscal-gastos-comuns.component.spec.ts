import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotaFiscalGastosComunsComponent } from './nota-fiscal-gastos-comuns.component';

describe('NotaFiscalGastosComunsComponent', () => {
  let component: NotaFiscalGastosComunsComponent;
  let fixture: ComponentFixture<NotaFiscalGastosComunsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotaFiscalGastosComunsComponent]
    });
    fixture = TestBed.createComponent(NotaFiscalGastosComunsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
