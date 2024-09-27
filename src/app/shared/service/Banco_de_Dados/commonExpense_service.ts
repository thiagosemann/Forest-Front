import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonExpense } from '../../utilitarios/commonExpense';
import { environment } from 'enviroments';

@Injectable({
  providedIn: 'root'
})
export class CommonExpenseService {
  private apiUrl = environment.backendUrl + '/commonexpenses';

  constructor(private http: HttpClient) { }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  getAllCommonExpenses(): Observable<CommonExpense[]> {
    return this.http.get<CommonExpense[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getCommonExpenseById(id: number): Observable<CommonExpense> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<CommonExpense>(url, { headers: this.getHeaders() });
  }

  createCommonExpense(expense: CommonExpense): Observable<CommonExpense> {
    return this.http.post<CommonExpense>(this.apiUrl, expense, { headers: this.getHeaders() });
  }

  createCommonExpenses(expenses: CommonExpense[]): Observable<CommonExpense[]> {
    return this.http.post<CommonExpense[]>(`${this.apiUrl}/array`, expenses, { headers: this.getHeaders() });
  }

  updateCommonExpense(expense: CommonExpense): Observable<CommonExpense> {
    const url = `${this.apiUrl}/${expense.id}`;
    return this.http.put<CommonExpense>(url, expense, { headers: this.getHeaders() });
  }

  deleteCommonExpense(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, { headers: this.getHeaders() });
  }
  
  getExpensesByBuildingAndMonth(predio_id: number, month: number, year: number): Observable<CommonExpense[]> {
    const url = `${this.apiUrl}/building/${predio_id}/month/${month}/year/${year}`;
    return this.http.get<CommonExpense[]>(url, { headers: this.getHeaders() });
  }
  getProvisoesByBuilding(predio_id: number): Observable<CommonExpense[]> {
    const url = `${this.apiUrl}/provisoes/${predio_id}`;
    return this.http.get<CommonExpense[]>(url, { headers: this.getHeaders() });
  }
}
