import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExpenseType } from '../../utilitarios/expenseType';
import { environment } from 'enviroments';

@Injectable({
  providedIn: 'root'
})
export class ExpenseTypeService {
  private apiUrl = environment.backendUrl + '/expensetypes';

  constructor(private http: HttpClient) { }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  getAllExpenseTypes(): Observable<ExpenseType[]> {
    return this.http.get<ExpenseType[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getExpenseTypeById(id: number): Observable<ExpenseType> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<ExpenseType>(url, { headers: this.getHeaders() });
  }

  createExpenseType(expenseType: ExpenseType): Observable<ExpenseType> {
    return this.http.post<ExpenseType>(this.apiUrl, expenseType, { headers: this.getHeaders() });
  }

  updateExpenseType(expenseType: ExpenseType): Observable<ExpenseType> {
    const url = `${this.apiUrl}/${expenseType.id}`;
    return this.http.put<ExpenseType>(url, expenseType, { headers: this.getHeaders() });
  }

  deleteExpenseType(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, { headers: this.getHeaders() });
  }
}
