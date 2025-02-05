import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateioComponent } from './rateio.component';

describe('RateioComponent', () => {
  let component: RateioComponent;
  let fixture: ComponentFixture<RateioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RateioComponent]
    });
    fixture = TestBed.createComponent(RateioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
