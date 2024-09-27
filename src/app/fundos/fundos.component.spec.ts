import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundosComponent } from './fundos.component';

describe('FundosComponent', () => {
  let component: FundosComponent;
  let fixture: ComponentFixture<FundosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FundosComponent]
    });
    fixture = TestBed.createComponent(FundosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
