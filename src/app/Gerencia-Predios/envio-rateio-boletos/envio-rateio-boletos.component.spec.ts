import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvioRateioBoletosComponent } from './envio-rateio-boletos.component';

describe('EnvioRateioBoletosComponent', () => {
  let component: EnvioRateioBoletosComponent;
  let fixture: ComponentFixture<EnvioRateioBoletosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EnvioRateioBoletosComponent]
    });
    fixture = TestBed.createComponent(EnvioRateioBoletosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
