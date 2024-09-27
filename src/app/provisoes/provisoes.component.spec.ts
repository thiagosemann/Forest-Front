import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvisoesComponent } from './provisoes.component';

describe('ProvisoesComponent', () => {
  let component: ProvisoesComponent;
  let fixture: ComponentFixture<ProvisoesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProvisoesComponent]
    });
    fixture = TestBed.createComponent(ProvisoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
