import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart, registerables } from 'chart.js';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor() {
    Chart.register(...registerables); // Registrar componentes do Chart.js
  }

  async generateCondoStatement(data: any): Promise<void> {
    const pdf = new jsPDF();
    const startX = 5;
    // Cabeçalho com logo e nome da empresa
    const logoPath = '../../../assets/images/Forest-logo-V2.png';
    const logoWidth = 30;
    const logoHeight = 20;
    const fontSizeTable = 6;
    const cellPaddingTable = 1;
    


    pdf.addImage(logoPath, 'PNG', 10, 10, logoWidth, logoHeight); // Adiciona logo
    pdf.setFontSize(20);
    pdf.setTextColor(34, 139, 34); // Cor verde para o nome da empresa
    pdf.text('Forest', 35, 20); // Nome da empresa ao lado do logo
    pdf.setTextColor(0, 0, 0); // Cor preta

    // Informações do Demonstrativo
    pdf.setFont('Helvetica', 'bold'); // Define a fonte como Helvetica e estilo em negrito
    pdf.setFontSize(14);
    pdf.text('Demonstrativo de Rateio de Condomínio', 105, 35, { align: 'center' });
    pdf.text(`Mês: ${data.month} | ${data.apartment} | Total: R$ ${data.condoTotal.toFixed(2)}`, 105, 45, { align: 'center' });
    

    // Linha divisória
    pdf.setDrawColor(0, 128, 0); // Cor verde
    pdf.setLineWidth(0.5);
    pdf.line(105, 60, 105, 290); // Linha vertical

    // Tabelas no lado esquerdo
    let currentY = 65;

    pdf.setFont('Helvetica', 'normal'); // Define a fonte como Helvetica e estilo em negrito
    pdf.setFontSize(10);
    pdf.text('Sua Fração ideal:', startX, currentY);
    pdf.text('Fração garagem:', 60, currentY);
    currentY += 5;
    pdf.text(data.apt_fracao, startX, currentY); // Fração do usuário
    pdf.text(data.vagas_fracao, 60, currentY); // Fração de garagem
    currentY += 10;
    // Resumo Garagem
    pdf.setFont('Helvetica', 'bold'); // Define a fonte como Helvetica e estilo em negrito
    pdf.setFontSize(14);
    pdf.text('Resumo', startX, currentY);
    currentY += 5;
    pdf.setFontSize(10);
    pdf.setFont('Helvetica', 'normal'); // Define a fonte como Helvetica e estilo em negrito
    pdf.text('Aqui você confere o resumo do Mês', startX, currentY);

    autoTable(pdf, {
      startY: currentY + 5,
      margin: { left: startX, right: 110 }, // Limita a largura à metade esquerda
      head: [['Categoria', 'Valor']],
      body: [
        ['Despesas Individuais', `R$ ${data.summary.individualExpenses.toFixed(2)}`],
        ['Despesas Coletivas', `R$ ${data.summary.collectiveExpenses.toFixed(2)}`],
        ['Seu Condomínio', `R$ ${data.summary.totalCondo.toFixed(2)}`],
      ],
      theme: 'grid',
      styles: {
        fontSize: fontSizeTable, // Diminui o tamanho da fonte
        cellPadding: cellPaddingTable, // Reduz o espaçamento interno das células
      },
      headStyles: {
        fontSize: fontSizeTable, // Ajusta a fonte do cabeçalho
      },
    });
    

    currentY = (pdf as any).lastAutoTable.finalY + 10;

    // Despesas Individuais
    pdf.setFont('Helvetica', 'bold'); // Define a fonte como Helvetica e estilo em negrito
    pdf.setFontSize(14);
    pdf.text('Despesas Individuais', startX, currentY);
    currentY += 5;
    pdf.setFontSize(10);
    pdf.setFont('Helvetica', 'normal'); // Define a fonte como Helvetica e estilo em negrito
    pdf.text('Aqui você confere em detalhe as despesas de sua unidade.', startX, currentY);

    autoTable(pdf, {
      startY: currentY + 5,
      margin: { left: startX, right: 110 }, // Limita a largura à metade esquerda
      head: [['Categoria', 'Valor', 'Consumo m³']],
      body: data.individualExpenses.map((item: any) => [
        item.category,
        `R$ ${item.value.toFixed(2)}`,
        item.consumption ? `${item.consumption} m³` : '-',
      ]),
      theme: 'grid',
      styles: {
        fontSize: fontSizeTable, // Diminui o tamanho da fonte
        cellPadding: cellPaddingTable, // Reduz o espaçamento interno das células
      },
      headStyles: {
        fontSize: fontSizeTable, // Ajusta a fonte do cabeçalho
      },
    });

    currentY = (pdf as any).lastAutoTable.finalY + 10;

    // Despesas Coletivas
    pdf.setFont('Helvetica', 'bold'); // Define a fonte como Helvetica e estilo em negrito
    pdf.setFontSize(14);
    pdf.text('Despesas Coletivas', startX, currentY);
    currentY += 5;
    pdf.setFontSize(10);
    pdf.setFont('Helvetica', 'normal'); // Define a fonte como Helvetica e estilo em negrito
    pdf.text('Esta é a listagem de todas as contas pagas pelo seu ', startX, currentY);
    currentY += 5;
    pdf.text('condomínio, e a sua respectiva fração.', startX, currentY);

    autoTable(pdf, {
      startY: currentY + 5,
      margin: { left: startX, right: 110 },
      head: [['Categoria', 'Valor', 'Sua Fração']],
      body: data.collectiveExpenses.map((item: any) => [
        item.nome_original,
        `R$ ${item.valor}`,
        `R$ ${(item.valor * data.fracao_total).toFixed(2)}`,
      ]),
      theme: 'grid',
      styles: {
        fontSize: fontSizeTable, // Diminui o tamanho da fonte
        cellPadding: cellPaddingTable, // Reduz o espaçamento interno das células
      },
      headStyles: {
        fontSize: fontSizeTable, // Ajusta a fonte do cabeçalho
      },
      columnStyles: {
        1: { cellWidth: 15 }, // Define a largura da coluna "Valor"
        2: { cellWidth: 15 }, // Define a largura da coluna "Sua Fração"
      },
    });
    

    currentY = (pdf as any).lastAutoTable.finalY + 10;



    // Gráficos no lado direito
    const canvasWidth = 90;
    const canvasHeight = 70;

    // Gerar e adicionar gráfico de exemplo
    const chart1 = await this.generateChart(data.individualExpenses, 'Gráfico de Despesas Individuais');
    const chart2 = await this.generateChart(data.collectiveExpenses, 'Gráfico de Despesas Coletivas');

    pdf.addImage(chart1, 'PNG', 110, 70, canvasWidth, canvasHeight); // Gráfico 1
    pdf.addImage(chart2, 'PNG', 110, 150, canvasWidth, canvasHeight); // Gráfico 2

    // Salvar PDF
    pdf.save(`Condominio_Mes(${data.month})_${data.apartment}.pdf`);
  }

  private generateChart(data: any[], title: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject('Erro ao criar contexto do canvas.');
        return;
      }

      const chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map((item) => item.category),
          datasets: [
            {
              label: title,
              data: data.map((item) => item.value),
              backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6'],
            },
          ],
        },
        options: {
          responsive: false,
          animation: {
            onComplete: () => {
              resolve(canvas.toDataURL('image/png'));
              chartInstance.destroy(); // Destruir gráfico após a criação
            },
          },
        },
      });
    });
  }
}
