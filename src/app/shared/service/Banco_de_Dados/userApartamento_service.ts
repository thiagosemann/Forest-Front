import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'enviroments';
import { UserApartamento } from '../../utilitarios/userApartamento';

@Injectable({
  providedIn: 'root'
})
export class UsersApartamentosService {
  private url = environment.backendUrl;

  constructor(private http: HttpClient) {}

  // Cria uma relação entre usuário e apartamento
  createUserApartamento(userApartamento: UserApartamento): Observable<any> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    return this.http.post(`${this.url}/users-apartamentos`, userApartamento, { headers });
  }

  // Retorna todas as relações entre usuários e apartamentos
  getAllUserApartamentos(): Observable<any[]> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    return this.http.get<any[]>(`${this.url}/users-apartamentos`, { headers });
  }

  // Retorna todos os apartamentos associados a um usuário específico
  getApartamentosByUserId(userId: number): Observable<any[]> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    return this.http.get<any[]>(`${this.url}/users-apartamentos/user/${userId}`, { headers });
  }

  // Retorna todos os usuários associados a um apartamento específico
  getUsersByApartamentoId(apartamentoId: number): Observable<any[]> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    return this.http.get<any[]>(`${this.url}/users-apartamentos/apartamento/${apartamentoId}`, { headers });
  }

  // Remove a relação entre um usuário e um apartamento
  deleteUserApartamento(userId: number, apartamentoId: number): Observable<any> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    return this.http.delete(`${this.url}/users-apartamentos/${userId}/${apartamentoId}`, { headers });
  }
}
