import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root',
})
export class PdfPrestacaoService {
  font: string = 'times';

  constructor(   
  ) {}

async generatePdfPrestacao(data: any): Promise<string> {
  const pdf = new jsPDF();
  const logoPath = '../../../assets/images/logo-com-frase-V2.png';
  const footerPath = '../../../assets/images/footerPdf.png';
  let startX = 5;

  // Carregar imagens como base64
  const logoData = await this.getImageAsBase64(logoPath);
  const footerData = await this.getImageAsBase64(footerPath);

  // Adiciona o cabeçalho com o título e informações básicas
  this.addCapa(pdf, logoData, footerData, startX);
  pdf.addPage();
  this.addParecerConselho(pdf, logoData, startX);

  // Retorna o PDF como base64
  const pdfBase64 = pdf.output('datauristring');

  return pdfBase64;
}


  private addCapa(pdf: any,logoData:any,footerData:any,startX:number): void {
  
    // Adiciona logo com compactação
    pdf.addImage(logoData, 'JPEG', startX+10, 0, 30, 30, undefined, 'FAST');

    this.configText(pdf, 'bold', 25);
    pdf.text('Prestação de Contas', startX+100, 80, { align: 'center' });

    this.configText(pdf, 'normal', 12);
    pdf.text('Condomínio Edifício Ilha de Capri', startX+100, 92, { align: 'center' });

    // Desenhar botão com bordas arredondadas, cinza com texto branco "Novembro/2024"
    const rectX = 60;
    const rectY = 98;
    const rectWidth = 90;
    const rectHeight = 15;
    const borderRadius = 5;

    pdf.setDrawColor(0);
    pdf.setFillColor(64, 64, 64); // Cinza escuro

    // Desenha o retângulo com bordas arredondadas
    pdf.roundedRect(rectX, rectY, rectWidth, rectHeight, borderRadius, borderRadius, 'F');

    this.configText(pdf, 'bold', 16);
    pdf.setTextColor(255, 255, 255); // Branco
    pdf.text('Novembro/2024', startX+100, rectY + 9, { align: 'center' });
    pdf.setTextColor(0, 0, 0); // Preto

    this.configText(pdf, 'bold', 16);
    pdf.text('Síndico', startX+100, 210, { align: 'center' });

    this.configText(pdf, 'normal', 14);
    pdf.text('Pedro Michels', startX+100, 218, { align: 'center' });

    // Adicionando a imagem de footer com compactação
    pdf.addImage(footerData, 'JPEG', 0, 240, 210, 60, undefined, 'FAST');
  }

  private addParecerConselho(pdf: any, logoData: any, startX: number): void {
    // Adiciona logo com compactação
    pdf.addImage(logoData, 'JPEG', startX+10, 0, 30, 30, undefined, 'FAST');
  
    this.configText(pdf, 'bold', 25);
    pdf.text('Parecer do Conselho', startX + 100, 70, { align: 'center' });
  
    const textAux =
      'Declaramos ter examinado as contas, documentos e papéis que compõem esta prestação de contas ao mês de novembro de 2024, sendo que os documentos estão em ordem e as contas exatas, em conformidade com a Lei 4.591/64 e regimento interno do condomínio.';
    const startY = this.addText(pdf, 'normal', 14, textAux, startX + 20, 80, 160);
  
    // Síndico
    this.configText(pdf, 'bold', 20);
    pdf.text('Síndico', startX + 100, 115, { align: 'center' });
    this.drawLine(pdf, startX + 60, 145, startX + 140, 145); // Linha para assinatura
    this.configText(pdf, 'normal', 12);
    pdf.text('Pedro Michels', startX + 100, 150, { align: 'center' });
    this.configText(pdf, 'normal', 12);
    pdf.text('Data:', startX + 100, 155, { align: 'center' });
  
    // Conselheiros Fiscais - Primeiro
    this.configText(pdf, 'bold', 20);
    pdf.text('Conselheiros Fiscais', startX + 100, 165, { align: 'center' });
    this.drawLine(pdf, startX + 60, 195, startX + 140, 195); // Linha para assinatura
    this.configText(pdf, 'normal', 12);
    pdf.text('Conselheiro(a)', startX + 100, 200, { align: 'center' });
    this.configText(pdf, 'normal', 12);
    pdf.text('Data:', startX + 100, 205, { align: 'center' });
  
    // Conselheiros Fiscais - Segundo
    this.drawLine(pdf, startX + 60, 235, startX + 140, 235); // Linha para assinatura
    this.configText(pdf, 'normal', 12);
    pdf.text('Conselheiro(a)', startX + 100, 240, { align: 'center' });
    this.configText(pdf, 'normal', 12);
    pdf.text('Data:', startX + 100, 245, { align: 'center' });
  
    // Conselheiros Fiscais - Terceiro
    this.drawLine(pdf, startX + 60, 275, startX + 140, 275); // Linha para assinatura
    this.configText(pdf, 'normal', 12);
    pdf.text('Conselheiro(a)', startX + 100, 280, { align: 'center' });
    this.configText(pdf, 'normal', 12);
    pdf.text('Data:', startX + 100, 285, { align: 'center' });
  }
  
  // Função para desenhar uma linha
  private drawLine(pdf: any, x1: number, y1: number, x2: number, y2: number): void {
    pdf.setLineWidth(0.5); // Define a espessura da linha
    pdf.line(x1, y1, x2, y2); // Desenha a linha de (x1, y1) até (x2, y2)
  }
  

  private addText(pdf: any,fontWeight: string, fontSize: number, text:string,startX:number,startY:number,maxWidth: number ): void {
    this.configText(pdf, fontWeight, fontSize);

    const lineHeight = 6; // Altura da linha
    const words = text.split(' ');
    let currentLine = '';
    let currentY = startY;
  
    words.forEach((word, index) => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = pdf.getTextWidth(testLine);
  
      // Verifica se a linha excede a largura máxima permitida
      if (testWidth > maxWidth && currentLine !== '') {
        this.justifyText(pdf, currentLine, startX, currentY, maxWidth, fontSize);
        currentLine = word; // Inicia uma nova linha com a palavra atual
        currentY += lineHeight; // Move para a próxima linha
      } else {
        currentLine = testLine; // Continua adicionando palavras à linha atual
      }
  
      // Renderiza a última linha após o loop
      if (index === words.length - 1) {
        pdf.text(currentLine, startX, currentY, { align: 'left' });
      }
    });

  }
// Função para justificar uma linha de texto
private justifyText(pdf: any,text: string,startX: number, startY: number, maxWidth: number, fontSize: number ): void {
  const words = text.split(' ');
  const totalSpaces = words.length - 1;
  const spaceWidth = pdf.getTextWidth(' ');
  const textWidth = pdf.getTextWidth(text.replace(/ /g, ''));
  const extraSpace = (maxWidth - textWidth) / totalSpaces;

  let currentX = startX;

  words.forEach((word, index) => {
    pdf.text(word, currentX, startY);
    currentX += pdf.getTextWidth(word) + spaceWidth + (index < totalSpaces ? extraSpace : 0);
  });
}
  private configText(pdf: any, fontWeight: string, size: number): void {
    pdf.setFont(this.font, fontWeight);
    pdf.setFontSize(size);
  }

  private async getImageAsBase64(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = path;
  
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Preenche o fundo transparente com branco
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
  
          // Desenha a imagem no canvas
          ctx.drawImage(img, 0, 0);
  
          // Converte para base64 em formato JPEG com compactação
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // Qualidade 70%
        } else {
          reject('Canvas context not found');
        }
      };
  
      img.onerror = () => reject('Failed to load image');
    });
  }


  
  

}


