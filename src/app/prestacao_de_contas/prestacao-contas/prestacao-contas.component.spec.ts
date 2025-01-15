import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestacaoContasComponent } from './prestacao-contas.component';

describe('PrestacaoContasComponent', () => {
  let component: PrestacaoContasComponent;
  let fixture: ComponentFixture<PrestacaoContasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrestacaoContasComponent]
    });
    fixture = TestBed.createComponent(PrestacaoContasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
