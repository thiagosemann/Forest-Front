import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GastoIndividual } from '../utilitarios/gastoIndividual';

@Injectable({
  providedIn: 'root'
})
export class GastosIndividuaisService {
  private apiUrl = 'http://localhost:80/individualexpenses';

  constructor(private http: HttpClient) { }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  getAllGastosIndividuais(): Observable<GastoIndividual[]> {
    return this.http.get<GastoIndividual[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getGastoIndividualById(id: number): Observable<GastoIndividual> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<GastoIndividual>(url, { headers: this.getHeaders() });
  }

  createGastoIndividual(expense: GastoIndividual): Observable<GastoIndividual> {
    return this.http.post<GastoIndividual>(this.apiUrl, expense, { headers: this.getHeaders() });
  }

  updateGastoIndividual(expense: GastoIndividual): Observable<GastoIndividual> {
    const url = `${this.apiUrl}/${expense.id}`;
    return this.http.put<GastoIndividual>(url, expense, { headers: this.getHeaders() });
  }

  deleteGastoIndividual(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, { headers: this.getHeaders() });
  }

  getGastosIndividuaisByApartment(apt_id: number): Observable<GastoIndividual[]> {
    const url = `${this.apiUrl}/apartment/${apt_id}`;
    return this.http.get<GastoIndividual[]>(url, { headers: this.getHeaders() });
  }

  getIndividualExpensesByAptMonthAndYear(predio_id: number, month: number, year: number): Observable<GastoIndividual[]> {
    const url = `${this.apiUrl}/predios/${predio_id}/month/${month}/year/${year}`;
    return this.http.get<GastoIndividual[]>(url, { headers: this.getHeaders() });
  }
}
