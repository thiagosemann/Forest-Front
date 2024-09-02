import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Building } from '../../utilitarios/building';
import { environment } from 'enviroments';

@Injectable({
  providedIn: 'root'
})
export class BuildingService {
  private apiUrl = environment.backendUrl + '/buildings';

  constructor(private http: HttpClient) { }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  getAllBuildings(): Observable<Building[]> {
    return this.http.get<Building[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getBuildingById(id: number): Observable<Building> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Building>(url, { headers: this.getHeaders() });
  }

  createBuilding(building: Building): Observable<Building> {
    return this.http.post<Building>(this.apiUrl, building, { headers: this.getHeaders() });
  }

  updateBuilding(building: Building): Observable<Building> {
    const url = `${this.apiUrl}/${building.id}`;
    return this.http.put<Building>(url, building, { headers: this.getHeaders() });
  }
  deleteBuilding(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, { headers: this.getHeaders() });
  }
}