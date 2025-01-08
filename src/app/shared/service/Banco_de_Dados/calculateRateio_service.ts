import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'enviroments';
import { RateioPorApartamento } from '../../utilitarios/rateioPorApartamento';

@Injectable({
  providedIn: 'root'
})
export class CalculateRateioService {
  private apiUrl = environment.backendUrl + '/calculateRateio';

  constructor(private http: HttpClient) { }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }
  
  getRateioByBuildingAndMonth(predio_id: number, month: number, year: number): Observable<RateioPorApartamento[]> {
    const url = `${this.apiUrl}/predios/${predio_id}/month/${month}/year/${year}`;
    return this.http.get<RateioPorApartamento[]>(url, { headers: this.getHeaders() });
  }
}
