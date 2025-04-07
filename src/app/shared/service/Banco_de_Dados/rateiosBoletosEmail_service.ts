// rateio-boleto-email.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'enviroments';
import { RateioBoletoEmail } from '../../utilitarios/rateioBoletoEmail';

@Injectable({
  providedIn: 'root'
})
export class RateioBoletoEmailService {
  private apiUrl = environment.backendUrl + '/rateioBoletoEmails';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  // Operações Básicas
  getAll(): Observable<RateioBoletoEmail[]> {
    return this.http.get<RateioBoletoEmail[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getById(id: number): Observable<RateioBoletoEmail> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<RateioBoletoEmail>(url, { headers: this.getHeaders() });
  }

  create(payload: any): Observable<RateioBoletoEmail> {
    return this.http.post<RateioBoletoEmail>(this.apiUrl, payload, {
      headers: this.getHeaders()
    });
  }

  update(
    id: number,
    payload: { rateioPdf?: string; boletoPdf?: string; dataEnvio: string }
  ): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<void>(url, payload, {
      headers: this.getHeaders()
    });
  }

  /**
   * Deleta parcialmente ou totalmente um registro, conforme o tipo.
   * @param id ID do registro
   * @param tipo 'rateio' ou 'boleto'
   */
  delete(id: number, tipo: 'rateio' | 'boleto'): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    const params = new HttpParams().set('tipo', tipo);
    return this.http.delete<void>(url, {
      headers: this.getHeaders(),
      params
    });
  }
}
