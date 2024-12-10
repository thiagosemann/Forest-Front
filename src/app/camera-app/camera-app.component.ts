import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GoogleScriptService } from '../shared/service/googleService';

@Component({
  selector: 'app-camera-app',
  templateUrl: './camera-app.component.html',
  styleUrls: ['./camera-app.component.css']
})
export class CameraAppComponent implements OnInit {
  step = 1; // Etapas do fluxo
  id: string = ''; // Código da reserva
  formData = { cpf: '', nome: '', telefone: '' }; // Dados do formulário
  photoDataUrl: string | null = null; // Imagem capturada
  @ViewChild('video', { static: false }) videoElement!: ElementRef;
  @ViewChild('photo', { static: false }) photoElement!: ElementRef;
  private mediaStream: MediaStream | null = null; // Para parar a câmera depois do uso

  constructor(
    private googleScriptService: GoogleScriptService,
    private route: ActivatedRoute // Injete o ActivatedRoute
  ) {}

  ngOnInit() {
    // Acessa o parâmetro 'id' da URL
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id') ?? ''; // Atribui o valor do 'id' à variável
    });
  }

  // Submissão do formulário de informações
  onSubmit() {
    if (!this.validateCPF(this.formData.cpf)) {
      alert("CPF inválido!");
      return;
    }
    this.step = 2; // Avançar para a etapa de captura de foto
    this.startCamera(); // Iniciar a câmera
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
    
    // Pausa o vídeo após capturar a foto
    this.videoElement.nativeElement.pause();
  }

  // Cancela a foto capturada e reinicia a câmera
  cancelPhoto() {
    this.photoDataUrl = null;
    this.startCamera(); // Reinicia a câmera
  }

  // Envia a foto e as informações para o Google Apps Script
  sendPhoto() {
    if (!this.photoDataUrl) {
      alert('Por favor, capture a foto antes de enviar.');
      return;
    }
  
    // Alterar a etapa para "carregando..." enquanto a imagem está sendo enviada
    this.step = 3;
  
    // Verificar se a string Base64 contém o prefixo "data:image/png;base64,"
    const base64Prefix = "data:image/png;base64,";
    let base64Image = this.photoDataUrl;
    
    // Se o prefixo estiver presente, remova-o
    if (base64Image.startsWith(base64Prefix)) {
      base64Image = base64Image.substring(base64Prefix.length);
    } else {
      console.log("Erro: Base64 não contém o prefixo esperado.");
    }
  
    // Enviar os dados e a imagem para o backend
    this.googleScriptService.enviarImagem(
      this.id, // Código da reserva
      this.formData.cpf, // CPF
      this.formData.nome, // Nome
      this.formData.telefone, // Telefone
      base64Image // Imagem sem o prefixo
    ).subscribe(
      response => {
        console.log('Dados enviados com sucesso:', response);
        alert('Foto e dados enviados com sucesso!');
        this.step = 1; // Voltar para a primeira etapa
        this.formData = { cpf: '', nome: '', telefone: '' }; // Limpar formulário
        this.id = ''; // Limpar ID
        this.stopCamera();
      },
      error => {
        console.error('Erro ao enviar dados:', error);
        alert('Erro ao enviar dados, tente novamente!');
        this.step = 1;
        this.stopCamera();
      }
    );
  }

  // Valida o CPF do usuário
  validateCPF(cpf: string) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    const repeatedNumbers = /^(.)\1+$/;
    if (repeatedNumbers.test(cpf)) return false;
    return true;
  }

  // Para a câmera e limpa o fluxo de vídeo
  stopCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  // Volta para a etapa anterior
  goBack() {
    if (this.step > 1) {
      this.step--; // Decrementa a etapa
    }
  }
}
