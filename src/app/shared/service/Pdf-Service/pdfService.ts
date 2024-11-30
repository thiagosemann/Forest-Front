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

async generateCondoStatement(data: any): Promise<Blob> {
    const pdf = new jsPDF();
    const startX = 5;
    const logoPath = '../../../assets/images/logo-com-frase-V2.png';
    const logoWidth = 45;
    const logoHeight = 40;
    const canvasWidth = 90 * 0.8;
    const canvasHeight = 70 * 0.8;

    // Adiciona cabeçalho com logo e informações
    this.addHeader(pdf, logoPath, logoWidth, logoHeight, data);

    // Adiciona Resumo
    let currentY = this.addSummarySection(pdf, startX, data);

    // Adiciona Despesas Individuais
    currentY = this.addIndividualExpensesSection(pdf, startX, currentY, data);

    // Adiciona Despesas Coletivas
    currentY = this.addCollectiveExpensesSection(pdf, startX, currentY, data);

    // Gráficos
    const chart1 = await this.generateDonutChart(data.individualExpenses);
    const chart2 = await this.generateChartAguaGas(data.individualExpensesHistory, 'Água (m³)');
    const chart3 = await this.generateChartAguaGas(data.individualExpensesHistory, 'Gás (m³)');

    pdf.addImage(chart1, 'PNG', 120, 65, canvasWidth, canvasHeight);
    pdf.addImage(chart2, 'PNG', 120, 135, canvasWidth, canvasHeight);
    pdf.addImage(chart3, 'PNG', 120, 200, canvasWidth, canvasHeight);

    // Retorna o PDF como Blob
    const pdfBlob = pdf.output('blob');
    return pdfBlob;
}


private addHeader(pdf: any, logoPath: string, logoWidth: number, logoHeight: number, data: any): void {
    pdf.addImage(logoPath, 'PNG', 82.5, -5, logoWidth, logoHeight);
    pdf.setFontSize(20);
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Demonstrativo de Rateio de Condomínio', 105, 35, { align: 'center' });
    pdf.text(`Mês: ${data.month} | ${data.apartment} | Total: R$ ${data.condoTotal.toFixed(2)}`, 105, 45, { align: 'center' });
    pdf.setDrawColor(0, 128, 0);
    pdf.setLineWidth(0.5);
    pdf.line(105, 60, 105, 290);
}

private addSummarySection(pdf: any, startX: number, data: any): number {
    let currentY = 65;
    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Sua Fração ideal:', startX, currentY);
    pdf.text('Fração garagem:', 60, currentY);
    currentY += 5;
    pdf.text(data.apt_fracao, startX, currentY);
    pdf.text(data.vagas_fracao, 60, currentY);
    currentY += 10;
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Resumo', startX, currentY);
    currentY += 5;
    pdf.setFontSize(10);
    pdf.setFont('Helvetica', 'normal');
    pdf.text('Aqui você confere o resumo do Mês', startX, currentY);

    autoTable(pdf, {
        startY: currentY + 5,
        margin: { left: startX, right: 110 },
        head: [['Categoria', 'Valor']],
        body: [
            ['Despesas Individuais', `R$ ${data.summary.individualExpenses.toFixed(2)}`],
            ['Despesas Coletivas', `R$ ${data.summary.collectiveExpenses.toFixed(2)}`],
            ['Seu Condomínio', `R$ ${data.summary.totalCondo.toFixed(2)}`],
        ],
        theme: 'grid',
        styles: { fontSize: 6, cellPadding: 1 },
        headStyles: { fontSize: 6, fillColor: [0, 128, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
    });
    return (pdf as any).lastAutoTable.finalY + 10;
}

private addIndividualExpensesSection(pdf: any, startX: number, currentY: number, data: any): number {
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Despesas Individuais', startX, currentY);
    currentY += 5;
    pdf.setFontSize(10);
    pdf.setFont('Helvetica', 'normal');
    pdf.text('Aqui você confere em detalhe as despesas de sua unidade.', startX, currentY);

    autoTable(pdf, {
        startY: currentY + 5,
        margin: { left: startX, right: 110 },
        head: [['Categoria', 'Valor']],
        body: data.individualExpenses.map((item: any) => [item.category, `R$ ${item.value || '0,00'}`]),
        theme: 'grid',
        styles: { fontSize: 6, cellPadding: 1 },
        headStyles: { fontSize: 6, fillColor: [0, 128, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
    });
    return (pdf as any).lastAutoTable.finalY + 10;
}

private addCollectiveExpensesSection(pdf: any, startX: number, currentY: number, data: any): number {
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Despesas Coletivas', startX, currentY);
    currentY += 5;
    pdf.setFontSize(10);
    pdf.setFont('Helvetica', 'normal');
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
        styles: { fontSize: 6, cellPadding: 1 },
        headStyles: { fontSize: 6, fillColor: [0, 128, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: { 1: { cellWidth: 15 }, 2: { cellWidth: 15 } },
    });
    return (pdf as any).lastAutoTable.finalY + 10;
}


  private generateChartAguaGas(data: any[], title: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const scale = 0.8; // Aumentar a resolução para 10x
        canvas.width = 400 * scale;
        canvas.height = 300 * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject('Erro ao criar contexto do canvas.');
            return;
        }

        // Determinar o campo de dados e a cor com base no título
        const dataField = title === 'Água (m³)' ? 'aguaM3' : 'gasM3';
        const borderColor = title === 'Água (m³)' ? '#3498db' : '#f1c40f'; // Azul para água, amarelo para gás
        const backgroundColor = title === 'Água (m³)'
            ? 'rgba(52, 152, 219, 0.5)' // Azul claro
            : 'rgba(241, 196, 15, 0.5)'; // Amarelo claro

        const chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map((item) => item.data_gasto), // Labels com o número do mês
                datasets: [
                    {
                        label: title,
                        data: data.map((item) => item[dataField]), // Valores do consumo de água ou gás
                        borderColor: borderColor,
                        backgroundColor: backgroundColor,
                        fill: true,
                        tension: 0.4, // Curvatura das linhas
                    },
                ],
            },
            options: {
                responsive: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 14 * scale, // Tamanho da fonte da legenda
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Mês',
                            font: {
                                size: 14 * scale, // Tamanho do título do eixo X
                            },
                        },
                        ticks: {
                            font: {
                                size: 10 * scale, // Tamanho dos rótulos do eixo X
                            },
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: `Consumo ${title}`, // Ajustar dinamicamente o texto do eixo Y
                            font: {
                                size: 14 * scale, // Tamanho do título do eixo Y
                            },
                        },
                        ticks: {
                            font: {
                                size: 10 * scale, // Tamanho dos rótulos do eixo Y
                            },
                        },
                        beginAtZero: true,
                    },
                },
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
private generateDonutChart(data: any[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const scale = 0.8; // Aumentar a resolução para 10x
    canvas.width = 400 * scale;
    canvas.height = 300 * scale;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject('Erro ao criar contexto do canvas.');
      return;
    }

    // Filtrar despesas individuais com valores maiores que 0
    const filteredData = data.filter((item) => item.value > 0);

    // Gerar cores em tons de verde
    const generateGreenTones = (count: number) => {
      const tones = [];
      for (let i = 0; i < count; i++) {
        const intensity = Math.floor(128 + (i * 127) / count); // Gera valores de 128 a 255
        tones.push(`rgba(0, ${intensity}, 0, 0.75)`); // Tons de verde com opacidade de 0.8
      }
      return tones;
    };

    const labels = filteredData.map((item) => item.category);
    const values = filteredData.map((item) => item.value);
    const colors = generateGreenTones(values.length);

    const chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderColor: '#ffffff', // Bordas brancas para destacar as divisões
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: {
                size: 14 * scale, // Tamanho da fonte da legenda
              },
              color: '#000000', // Cor preta para os textos da legenda
              padding: 30, // Aumenta o espaçamento entre as legendas
              boxWidth: 20 * scale, // Aumenta o tamanho do marcador
              boxHeight: 10 * scale, // Ajusta a altura do marcador
            }
          },
        },
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
