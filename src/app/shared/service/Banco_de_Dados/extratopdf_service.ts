import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'enviroments';
import { ExtratoPdf } from '../../utilitarios/extratoPdf';


@Injectable({
  providedIn: 'root'
})
export class ExtratoPdfService {
  private apiUrl = environment.backendUrl + '/extratos-pdf';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getAllExtratosPdf(): Observable<ExtratoPdf[]> {
    return this.http.get<ExtratoPdf[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getExtratoPdfById(id: number): Observable<ExtratoPdf> {
    return this.http.get<ExtratoPdf>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createExtratoPdf(extrato: ExtratoPdf): Observable<ExtratoPdf> {
    return this.http.post<ExtratoPdf>(this.apiUrl, extrato, { 
      headers: this.getHeaders().set('Content-Type', 'application/json')
    });
  }

  updateExtratoPdf(extrato: ExtratoPdf): Observable<ExtratoPdf> {
    return this.http.put<ExtratoPdf>(`${this.apiUrl}/${extrato.id}`, extrato, { 
      headers: this.getHeaders().set('Content-Type', 'application/json')
    });
  }

  deleteExtratoPdf(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getExtratosPdfByBuildingMonthYear(predio_id:number,month: number, year: number): Observable<ExtratoPdf[]> {
    return this.http.get<ExtratoPdf[]>(
      `${this.apiUrl}/predio/${predio_id}/month/${month}/year/${year}`,
      { headers: this.getHeaders() }
    );
  }

  // Opcional: Upload via FormData para arquivos grandes
  uploadExtratoPdf(file: File, data_gasto: string): Observable<ExtratoPdf> {
    const formData = new FormData();
    formData.append('documento', file);
    formData.append('data_gasto', data_gasto);

    return this.http.post<ExtratoPdf>(this.apiUrl, formData, { 
      headers: this.getHeaders()
    });
  }
}