import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GoogleScriptService } from '../shared/service/googleService';
import { Toast, ToastrService } from 'ngx-toastr';

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
  documentPhotoUrl: string | null = null; // Imagem capturada
  documentFile: string | null = null; // Arquivo do documento
  fotoOuDocumentoString:string='';
  @ViewChild('video', { static: false }) videoElement!: ElementRef;
  @ViewChild('videoDoc', { static: false }) videoDocElement!: ElementRef;
  private mediaStream: MediaStream | null = null; // Para parar a câmera depois do uso
  private documentMediaStream: MediaStream | null = null; // Para parar a câmera do documento

  constructor(
    private googleScriptService: GoogleScriptService,
    private route: ActivatedRoute, // Injete o ActivatedRoute
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id') ?? ''; // Atribui o valor do 'id' à variável
    });
  }

  // Recebe o arquivo selecionado para envio
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onload = () => {
        // Aqui o conteúdo do arquivo em base64
        const base64String = reader.result as string;
        this.documentFile = base64String; // Salva o base64 no atributo
        this.toastr.success('Documento selecionado com sucesso.');
      };
      
      reader.onerror = () => {
        this.toastr.error('Erro ao ler o arquivo.');
      };
      
      reader.readAsDataURL(file); // Lê o arquivo como DataURL (base64)
    }
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

  // Inicia a câmera para capturar a foto do documento
  startDocumentCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        this.documentMediaStream = stream; // Salvar a referência do stream
        this.videoDocElement.nativeElement.srcObject = stream;
      })
      .catch(err => console.error('Erro ao acessar câmera do documento', err));
  }

  // Captura a foto da câmera
  capturePhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.nativeElement.videoWidth;
    canvas.height = this.videoElement.nativeElement.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(this.videoElement.nativeElement, 0, 0);
    this.photoDataUrl = canvas.toDataURL('image/png');
    this.stopCamera();
    //this.videoElement.nativeElement.pause(); // Pausa o vídeo após capturar a foto
  }

   // Captura a foto do documento
   captureDocumentPhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = this.videoDocElement.nativeElement.videoWidth;
    canvas.height = this.videoDocElement.nativeElement.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(this.videoDocElement.nativeElement, 0, 0);
    this.documentPhotoUrl = canvas.toDataURL('image/png');
    this.stopDocumentCamera();
  }
  // Cancela a foto do documento e reinicia a câmera
  cancelDocumentPhoto() {
    this.documentPhotoUrl = null;
    this.startDocumentCamera(); // Reinicia a câmera do documento
  }
  


  // Cancela a foto capturada e reinicia a câmera
  cancelPhoto() {
    this.photoDataUrl = null;
    this.startCamera(); // Reinicia a câmera
  }

  // Envia a foto e as informações para o Google Apps Script
  sendData() {
    if (!this.photoDataUrl) {
      return;
    }

    this.step = 4; // Alterar a etapa para "carregando..."=

    this.googleScriptService.enviarDados( this.id,this.formData.cpf,this.formData.nome,this.formData.telefone).subscribe(
      response => {
        this.step = 5; // Alterar a etapa para "carregando..."=
      },
      error => {
        console.error('Erro ao enviar dados:', error);
        this.toastr.warning('Erro ao enviar dados, tente novamente!');
        this.resetFlow();
      }
    );
    this.googleScriptService.enviarImagem(this.photoDataUrl,this.id,this.formData.cpf).subscribe(
      response => {
        this.step = 5; // Alterar a etapa para "carregando..."=
      },
      error => {
        console.error('Erro ao enviar image:', error);
        this.toastr.warning('Erro ao enviar image, tente novamente!');
        this.resetFlow();
      }
    );
    if(this.documentPhotoUrl){
      this.googleScriptService.enviarImagem(this.documentPhotoUrl,this.id,this.formData.cpf).subscribe(
        response => {
          this.step = 5; // Alterar a etapa para "carregando..."=
        },
        error => {
          console.error('Erro ao enviar image:', error);
          this.toastr.warning('Erro ao enviar image, tente novamente!');
          this.resetFlow();
        }
      );
    }
    if(this.documentFile){
      this.googleScriptService.enviarPDF(this.documentFile,this.id,this.formData.cpf).subscribe(
        response => {
          this.step = 5; // Alterar a etapa para "carregando..."=
        },
        error => {
          console.error('Erro ao enviar image:', error);
          this.toastr.warning('Erro ao enviar image, tente novamente!');
          this.resetFlow();
        }
      );
    }


  }

  // Reseta o fluxo para o início
  resetFlow() {
    this.step = 1;
    this.formData = { cpf: '', nome: '', telefone: '' };
    this.stopCamera();
    this.photoDataUrl = null;
    this.documentPhotoUrl = null;
    this.documentFile = null;
  }

  // Valida o CPF do usuário
  validateCPF(cpf: string): boolean {
    // Remove todos os caracteres que não forem dígitos
    cpf = cpf.replace(/\D/g, '');

    // Verifica se o CPF tem 11 dígitos ou se todos os dígitos são iguais
    if (cpf.length !== 11 || /^(.)\1+$/.test(cpf)) return false;

    // Cálculo do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let primeiroDigitoVerificador = (soma * 10) % 11;
    if (primeiroDigitoVerificador === 10 || primeiroDigitoVerificador === 11) {
      primeiroDigitoVerificador = 0;
    }
    if (primeiroDigitoVerificador !== parseInt(cpf.charAt(9))) {
      return false;
    }

    // Cálculo do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let segundoDigitoVerificador = (soma * 10) % 11;
    if (segundoDigitoVerificador === 10 || segundoDigitoVerificador === 11) {
      segundoDigitoVerificador = 0;
    }
    if (segundoDigitoVerificador !== parseInt(cpf.charAt(10))) {
      return false;
    }

    // CPF válido
    return true;
  }


  // Para a câmera e limpa o fluxo de vídeo
  stopCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }
  // Para a câmera do documento e limpa o fluxo de vídeo
  stopDocumentCamera() {
    if (this.documentMediaStream) {
      this.documentMediaStream.getTracks().forEach(track => track.stop());
      this.documentMediaStream = null;
    }
  }

  // Volta para a etapa anterior
  goBack() {
    if (this.step > 1) {
      this.step--; // Decrementa a etapa
    }
  
    if (this.step === 2) {
      if (!this.photoDataUrl) {
        this.startCamera(); // Inicia a câmera se a foto não estiver presente
      } 
    }
  }
  
  
  goForward() {
    if(this.step==1){
      if (!this.validateCPF(this.formData.cpf)) {
        this.toastr.warning("CPF inválido!")
        return;
      }
      if(this.formData.cpf==""){
        this.toastr.warning("Digite o CPF!")
        return;
      }
      if(this.formData.nome==""){
        this.toastr.warning("Digite o nome!")
        return;
      }
      if(this.formData.telefone==""){
        this.toastr.warning("Digite o telefone!")
        return;
      }
      this.step = 2; // Avançar para a etapa de captura de foto
      this.startCamera(); // Iniciar a câmera
    }else if (this.step < 5) {
      this.step++; // Decrementa a etapa
    }
  }

  documentoComoFoto():void{
    this.fotoOuDocumentoString="foto"
    this.startDocumentCamera();
  }
  documentoComoArquivo():void{
    this.fotoOuDocumentoString="arquivo"
  }
  voltarParaEntregaDocumentos():void{
    this.fotoOuDocumentoString=""
  }
  
}