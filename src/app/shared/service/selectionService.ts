import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  // BehaviorSubject will allow other components to subscribe to changes in the values
  private selecaoSource = new BehaviorSubject<{ predioID: number, month: number, year: number }>({
    predioID: 0, 
    month: 0, 
    year: 0
  });

  // Observable that components can subscribe to
  selecao$ = this.selecaoSource.asObservable();

  // Update method to change the values
  setSelecao(selecao: { predioID: number, month: number, year: number }) {
    this.selecaoSource.next(selecao);
  }
}
