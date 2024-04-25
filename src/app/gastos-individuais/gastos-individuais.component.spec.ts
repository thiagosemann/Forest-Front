import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GastosIndividuaisComponent } from './gastos-individuais.component';

describe('GastosIndividuaisComponent', () => {
  let component: GastosIndividuaisComponent;
  let fixture: ComponentFixture<GastosIndividuaisComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GastosIndividuaisComponent]
    });
    fixture = TestBed.createComponent(GastosIndividuaisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
