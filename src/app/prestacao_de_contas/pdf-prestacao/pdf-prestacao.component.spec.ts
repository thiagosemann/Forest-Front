import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfPrestacaoComponent } from './pdf-prestacao.component';

describe('PdfPrestacaoComponent', () => {
  let component: PdfPrestacaoComponent;
  let fixture: ComponentFixture<PdfPrestacaoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PdfPrestacaoComponent]
    });
    fixture = TestBed.createComponent(PdfPrestacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
