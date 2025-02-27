import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'enviroments';
import { RateioPorApartamento } from '../../utilitarios/rateioPorApartamento';

@Injectable({
  providedIn: 'root'
})
export class RateioPorApartamentoService {
  private apiUrl = environment.backendUrl + '/rateiosPorApartamento';

  constructor(private http: HttpClient) { }

  // Função para obter os headers com o token
  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  // Função para obter todos os rateios por apartamento
  getAllRateiosPorApartamento(): Observable<RateioPorApartamento[]> {
    return this.http.get<RateioPorApartamento[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Função para obter um rateio por apartamento pelo ID
  getRateioPorApartamentoById(id: number): Observable<RateioPorApartamento> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<RateioPorApartamento>(url, { headers: this.getHeaders() });
  }

  // Função para obter um rateio por apartamento pelo apartamento_id
  getRateioPorApartamentoByAptId(apartamento_id: number): Observable<RateioPorApartamento> {
    const url = `${this.apiUrl}/apartamento/${apartamento_id}`;
    return this.http.get<RateioPorApartamento>(url, { headers: this.getHeaders() });
  }

  // Função para obter rateios por apartamento de um rateioId específico
  getRateiosPorApartamentoByRateioId(rateioId: number): Observable<RateioPorApartamento[]> {
    const url = `${this.apiUrl}/rateio/${rateioId}`;
    return this.http.get<RateioPorApartamento[]>(url, { headers: this.getHeaders() });
  }

  // Função para obter rateios por prédio (inadimplentes)
  getRateiosNaoPagosPorPredioId(predioId: number): Observable<RateioPorApartamento[]> {
    const url = `${this.apiUrl}/inadimplentes/predio/${predioId}`;
    return this.http.get<RateioPorApartamento[]>(url, { headers: this.getHeaders() });
  }

  // Função para criar um novo rateio por apartamento
  createRateioPorApartamento(rateio: RateioPorApartamento): Observable<RateioPorApartamento> {
    return this.http.post<RateioPorApartamento>(this.apiUrl, rateio, { headers: this.getHeaders() });
  }

  // Função para atualizar um rateio por apartamento
  updateRateioPorApartamento(rateio: RateioPorApartamento): Observable<RateioPorApartamento> {
    const url = `${this.apiUrl}/${rateio.id}`;
    return this.http.put<RateioPorApartamento>(url, rateio, { headers: this.getHeaders() });
  }

  // Função para atualizar a data de pagamento
  updateDataPagamento(id: number, dataPagamento: string): Observable<void> {
    const url = `${this.apiUrl}/${id}/update-data-pagamento`;
    return this.http.put<void>(url, { data_pagamento: dataPagamento }, { headers: this.getHeaders() });
  }

  // Função para deletar um rateio por apartamento
  deleteRateioPorApartamento(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, { headers: this.getHeaders() });
  }

  // Nova função para atualizar a data de pagamento com base nos pagamentos consolidados
  atualizarDataPagamento(pagamentosConsolidados: any[]): Observable<void> {
    const url = `${this.apiUrl}/atualizar-data-pagamento`;
    return this.http.post<void>(url, { pagamentosConsolidados }, { headers: this.getHeaders() });
  }

  // Nova função: Rateios Gerados e Pagos no Mês Correto
  getRateiosGeradosEPagosNoMesCorreto(predioId: number, mes: number, ano: number): Observable<RateioPorApartamento[]> {
    const url = `${this.apiUrl}/gerados-pagos/${predioId}/${mes}/${ano}`;
    return this.http.get<RateioPorApartamento[]>(url, { headers: this.getHeaders() });
  }

  // Nova função: Rateios Pagos com Geração em Meses Diferentes
  getRateiosPagosGeradosEmMesesDiferentes(predioId: number, mes: number, ano: number): Observable<RateioPorApartamento[]> {
    const url = `${this.apiUrl}/pagos-diferentes/${predioId}/${mes}/${ano}`;
    return this.http.get<RateioPorApartamento[]>(url, { headers: this.getHeaders() });
  }
}
