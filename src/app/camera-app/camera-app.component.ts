import { Component, ElementRef, ViewChild } from '@angular/core';
import { GoogleDriveService } from '../shared/service/googleService';

@Component({
  selector: 'app-camera-app',
  templateUrl: './camera-app.component.html',
  styleUrls: ['./camera-app.component.css']
})
export class CameraAppComponent {
  title = 'Google Drive Integration';
  files: any[] = [];

  constructor(private googleDriveService: GoogleDriveService) {}

  ngOnInit(): void {}

  login(): void {
    this.googleDriveService.login().then(() => {
      console.log('Login bem-sucedido');
    }).catch(error => {
      console.error('Erro ao fazer login', error);
    });
  }

  logout(): void {
    this.googleDriveService.logout().then(() => {
      console.log('Logout realizado');
    }).catch(error => {
      console.error('Erro ao fazer logout', error);
    });
  }

  listFiles(): void {
    this.googleDriveService.listFiles().then(files => {
      this.files = files;
      console.log('Arquivos:', files);
    }).catch(error => {
      console.error('Erro ao listar arquivos', error);
    });
  }

  uploadFile(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.googleDriveService.uploadFile(file).then(response => {
        console.log('Arquivo enviado:', response);
        this.listFiles();
      }).catch(error => {
        console.error('Erro ao enviar arquivo', error);
      });
    }
  }
}
