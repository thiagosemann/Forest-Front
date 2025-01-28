import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeradorRateioComponent } from './gerador-rateio.component';

describe('GeradorRateioComponent', () => {
  let component: GeradorRateioComponent;
  let fixture: ComponentFixture<GeradorRateioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GeradorRateioComponent]
    });
    fixture = TestBed.createComponent(GeradorRateioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
