import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'enviroments';
import { PrestacaoCobrancaBoleto } from '../../utilitarios/prestacaoCobrancaBoleto';

@Injectable({
  providedIn: 'root'
})
export class PrestacaoCobrancaBoletoService {
  private apiUrl = environment.backendUrl + '/prestacaoCobrancaBoletos';

  constructor(private http: HttpClient) { }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  // Retorna todos os boletos
  getAllPrestacaoCobrancaBoleto(): Observable<PrestacaoCobrancaBoleto[]> {
    return this.http.get<PrestacaoCobrancaBoleto[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Retorna um boleto pelo ID
  getPrestacaoCobrancaBoletoById(id: number): Observable<PrestacaoCobrancaBoleto> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<PrestacaoCobrancaBoleto>(url, { headers: this.getHeaders() });
  }

  // Cria um novo boleto
  createPrestacaoCobrancaBoleto(boleto: PrestacaoCobrancaBoleto): Observable<PrestacaoCobrancaBoleto> {
    return this.http.post<PrestacaoCobrancaBoleto>(this.apiUrl, boleto, { headers: this.getHeaders() });
  }

  // Atualiza um boleto existente
  updatePrestacaoCobrancaBoleto(boleto: PrestacaoCobrancaBoleto): Observable<PrestacaoCobrancaBoleto> {
    const url = `${this.apiUrl}/${boleto.id}`;
    return this.http.put<PrestacaoCobrancaBoleto>(url, boleto, { headers: this.getHeaders() });
  }

  // Deleta um boleto pelo ID
  deletePrestacaoCobrancaBoleto(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, { headers: this.getHeaders() });
  }

  // Obtém boletos filtrados por prédio, mês e ano
  getPrestacaoCobrancaBoletoByBuildingAndMonth(predio_id: number, month: number, year: number): Observable<PrestacaoCobrancaBoleto[]> {
    const url = `${this.apiUrl}/building/${predio_id}/month/${month}/year/${year}`;
    return this.http.get<PrestacaoCobrancaBoleto[]>(url, { headers: this.getHeaders() });
  }
}
