import { Component, ElementRef, ViewChild } from '@angular/core';
import { GoogleScriptService } from '../shared/service/googleService';

@Component({
  selector: 'app-camera-app',
  templateUrl: './camera-app.component.html',
  styleUrls: ['./camera-app.component.css']
})
export class CameraAppComponent {
  step = 1; // Etapas do fluxo
  id: string = ''; // Código da reserva
  formData = { cpf: '', nome: '', telefone: '' }; // Dados do formulário
  photoDataUrl: string | null = null; // Imagem capturada
  @ViewChild('video', { static: false }) videoElement!: ElementRef;
  @ViewChild('photo', { static: false }) photoElement!: ElementRef;
  private mediaStream: MediaStream | null = null; // Para parar a câmera depois do uso

  constructor(private googleScriptService: GoogleScriptService) {}

  // Submissão do formulário de informações
  onSubmit() {
    if (!this.validateCPF(this.formData.cpf)) {
      alert("CPF inválido!");
      return;
    }
    this.step = 2;
    this.startCamera();
  }

  // Inicia a câmera do usuário
  startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        this.mediaStream = stream; // Salvar a referência do stream
        this.videoElement.nativeElement.srcObject = stream;
      })
      .catch(err => console.error('Erro ao acessar câmera', err));
  }

  // Captura a foto da câmera
  capturePhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.nativeElement.videoWidth;
    canvas.height = this.videoElement.nativeElement.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(this.videoElement.nativeElement, 0, 0);
    this.photoDataUrl = canvas.toDataURL('image/png');
  }

  // Cancela a foto capturada e reinicia a câmera
  cancelPhoto() {
    this.photoDataUrl = null;
    this.startCamera();
  }

  // Envia a foto e as informações para o Google Apps Script
  sendPhoto() {
    if (!this.photoDataUrl) {
      alert('Por favor, capture a foto antes de enviar.');
      return;
    }

    this.step = 3; // Exibir "carregando..."
    const imageFile = this.dataUrlToFile(this.photoDataUrl, 'captura.png');
    
    this.googleScriptService.enviarDados(
      this.id, 
      this.formData.cpf, 
      this.formData.nome, 
      this.formData.telefone, 
      imageFile
    ).subscribe({
      next: (response) => {
        console.log('Dados enviados com sucesso:', response);
        this.step = 4; // Exibir tela de "Concluído"
        this.stopCamera();
      },
      error: (error) => {
        console.error('Erro ao enviar dados:', error);
        alert('Erro ao enviar as informações. Tente novamente.');
        this.step = 2; // Voltar para o passo de captura de foto
      }
    });
  }

  // Valida o CPF do usuário
  validateCPF(cpf: string) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    const repeatedNumbers = /^(.)\1+$/;
    if (repeatedNumbers.test(cpf)) return false;
    return true;
  }

  // Converte a URL de uma imagem Base64 para um arquivo File
  dataUrlToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  // Para a câmera e limpa o fluxo de vídeo
  stopCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }
}
