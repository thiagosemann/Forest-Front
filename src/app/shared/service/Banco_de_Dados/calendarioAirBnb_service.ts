import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'enviroments';

@Injectable({
  providedIn: 'root'
})
export class AirbnbCalendarService {
  private apiUrl = environment.backendUrl + '/airbnb-calendar';

  constructor(private http: HttpClient) { }

  // Função para obter os cabeçalhos com o token de autenticação
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  // Função para obter o calendário do Airbnb
  getAirbnbCalendar(): Observable<any> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() });
  }
}
