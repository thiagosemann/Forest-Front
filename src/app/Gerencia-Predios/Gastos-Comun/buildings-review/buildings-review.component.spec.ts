import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingsReviewComponent } from './buildings-review.component';

describe('BuildingsReviewComponent', () => {
  let component: BuildingsReviewComponent;
  let fixture: ComponentFixture<BuildingsReviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BuildingsReviewComponent]
    });
    fixture = TestBed.createComponent(BuildingsReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
