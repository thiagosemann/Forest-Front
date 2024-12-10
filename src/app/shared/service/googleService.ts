import { Injectable } from '@angular/core';
import { environment } from 'enviroments';
import { BehaviorSubject } from 'rxjs';

declare var gapi: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService {
  private isAuthInitialized = new BehaviorSubject<boolean>(false);
  private authInstance: any;

  constructor() {
    this.initializeGapi();
  }

  /**
   * Inicializa o cliente gapi e configura OAuth2
   */
  private initializeGapi(): void {
    gapi.load('client:auth2', () => {
      gapi.client.init({
        apiKey: environment.googleApiKey,
        clientId: environment.googleClientId,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        scope: 'https://www.googleapis.com/auth/drive'
      }).then(() => {
        this.authInstance = gapi.auth2.getAuthInstance();
        this.isAuthInitialized.next(true);
      }).catch((error: any) => {
        console.error('Erro ao inicializar GAPI', error);
      });
    });
  }

  /**
   * Faz login no Google
   */
  public login(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.authInstance) {
        this.authInstance.signIn().then((user: any) => {
          const profile = user.getBasicProfile();
          console.log('Usuário logado:', profile.getName());
          resolve(user);
        }).catch((error: any) => {
          console.error('Erro ao fazer login', error);
          reject(error);
        });
      } else {
        console.error('Auth instance não inicializada');
      }
    });
  }

  /**
   * Faz logout do Google
   */
  public logout(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.authInstance) {
        this.authInstance.signOut().then(() => {
          console.log('Logout realizado');
          resolve(true);
        }).catch((error: any) => {
          console.error('Erro ao fazer logout', error);
          reject(error);
        });
      } else {
        console.error('Auth instance não inicializada');
      }
    });
  }

  /**
   * Verifica se o usuário está logado
   */
  public isLoggedIn(): boolean {
    return this.authInstance && this.authInstance.isSignedIn.get();
  }

  /**
   * Obtém os arquivos do Google Drive
   */
  public listFiles(): Promise<any> {
    return new Promise((resolve, reject) => {
      gapi.client.drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name, mimeType)'
      }).then((response: any) => {
        console.log('Arquivos do Google Drive:', response.result.files);
        resolve(response.result.files);
      }).catch((error: any) => {
        console.error('Erro ao listar arquivos', error);
        reject(error);
      });
    });
  }

  /**
   * Faz o upload de um arquivo para o Google Drive
   */
  public uploadFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const fileMetadata = {
        name: file.name
      };

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
      formData.append('file', file);

      fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ 'Authorization': `Bearer ${gapi.auth.getToken().access_token}` }),
        body: formData
      }).then(response => response.json())
        .then(result => {
          console.log('Arquivo enviado para o Google Drive:', result);
          resolve(result);
        }).catch(error => {
          console.error('Erro ao enviar arquivo', error);
          reject(error);
        });
    });
  }
}
