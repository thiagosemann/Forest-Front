import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Apartamento } from '../../utilitarios/apartamento';
import { environment } from 'enviroments';

@Injectable({
  providedIn: 'root'
})
export class ApartamentoService {
  private apiUrl = environment.backendUrl + '/apartamentos';

  constructor(private http: HttpClient) { }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  // Nova função para inserção em lote de usuários
  saveApartamentosInBatch(apartamentos: Apartamento[]): Observable<any> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    return this.http.post(`${this.apiUrl}/batch`, apartamentos, { headers });
  }

  getAllApartamentos(): Observable<Apartamento[]> {
    return this.http.get<Apartamento[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getApartamentoById(id: number): Observable<Apartamento> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Apartamento>(url, { headers: this.getHeaders() });
  }
  getApartamentosByBuildingId(id: number): Observable<Apartamento[]> {
    const url = `${this.apiUrl}/predios/${id}`;
    return this.http.get<Apartamento[]>(url, { headers: this.getHeaders() });
  }
  createApartamento(apartamento: Apartamento): Observable<Apartamento> {
    return this.http.post<Apartamento>(this.apiUrl, apartamento, { headers: this.getHeaders() });
  }

  updateApartamento(apartamento: Apartamento): Observable<Apartamento> {
    const url = `${this.apiUrl}/${apartamento.id}`;
    return this.http.put<Apartamento>(url, apartamento, { headers: this.getHeaders() });
  }

  deleteApartamento(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, { headers: this.getHeaders() });
  }
}
