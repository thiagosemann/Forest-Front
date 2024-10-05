import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'enviroments';
import { Rateio } from '../../utilitarios/rateio';

@Injectable({
  providedIn: 'root'
})
export class RateioService {
  private apiUrl = environment.backendUrl + '/rateio';

  constructor(private http: HttpClient) { }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }
  
  getRateioByBuildingAndMonth(predio_id: number, month: number, year: number): Observable<Rateio[]> {
    const url = `${this.apiUrl}/predios/${predio_id}/month/${month}/year/${year}`;
    return this.http.get<Rateio[]>(url, { headers: this.getHeaders() });
  }
}
