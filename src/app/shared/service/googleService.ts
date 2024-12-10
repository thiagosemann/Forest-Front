import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleScriptService {

  private apiUrl = 'https://script.google.com/macros/s/AKfycbxc05xZznOZ5yk87_arMQ2CqHpgfombfiXzib-bzZm1bcgq_JAvoNCM2W2uANxhP9RFbQ/exec';

  constructor(private http: HttpClient) {}

  /**
   * Envia os dados e a imagem para o Google Apps Script.
   * 
   * @param cod_reserva O código da reserva.
   * @param CPF O CPF do usuário.
   * @param Nome O nome do usuário.
   * @param Telefone O telefone do usuário.
   * @param imageFile O arquivo de imagem a ser enviado.
   * @returns Observable com a resposta do servidor.
   */
  enviarDados(
    cod_reserva: string, 
    CPF: string, 
    Nome: string, 
    Telefone: string, 
    imageFile: File
  ): Observable<any> {
    // Converter a imagem em Base64
    return new Observable(observer => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      
      reader.onload = () => {
        const base64Image = reader.result?.toString().split(',')[1]; // Remove o prefixo 'data:image/png;base64,'
        
        const body = {
          cod_reserva,
          CPF,
          Nome,
          Telefone,
          imagemBase64: base64Image
        };

        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

        this.http.post(this.apiUrl, body, { headers }).subscribe({
          next: (response) => {
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            observer.error(error);
          }
        });
      };

      reader.onerror = (error) => {
        observer.error(`Erro ao converter imagem: ${error}`);
      };
    });
  }
}
