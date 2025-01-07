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
    let totalValue=0;

    [currentY,totalValue] = this.addCollectiveExpensesSection(pdf, startX, currentY, data);

    // Reinicia o Y
    currentY = 60;
    // Adiciona Provisões.
    currentY = this.addProvisionsSection(pdf, 110, currentY, data);
    // Adiciona Fundos .
    currentY = this.addFundosSection(pdf, 110, currentY, data,totalValue);

    

    
    /* // Gráficos
    const chart1 = await this.generateDonutChart(data.individualExpenses);
    const chart2 = await this.generateChartAguaGas(data.individualExpensesHistory, 'Água (m³)');
    const chart3 = await this.generateChartAguaGas(data.individualExpensesHistory, 'Gás (m³)');

    pdf.addImage(chart1, 'PNG', 120, 60, canvasWidth, canvasHeight);
    pdf.addImage(chart2, 'PNG', 120, 135, canvasWidth, canvasHeight);
    pdf.addImage(chart3, 'PNG', 120, 200, canvasWidth, canvasHeight);
   */
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
  let currentY = 60;
  // Adiciona os textos estáticos
  pdf.setFont('Helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text('Sua Fração ideal:', startX, currentY);
  pdf.text('Fração garagem:', 60, currentY);
  currentY += 5;
  pdf.text(data.apt_fracao, startX, currentY);
  pdf.text(data.vagas_fracao, 60, currentY);
  currentY += 10;

  // Adiciona o título "Resumo"
  pdf.setFont('Helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Resumo', startX, currentY);
  currentY += 5;
  
  // Texto explicativo
  pdf.setFontSize(10);
  pdf.setFont('Helvetica', 'normal');
  pdf.text('Aqui você confere o resumo do Mês', startX, currentY);

  // Cria a tabela utilizando a função auxiliar
  currentY = this.generateTable(pdf, startX, currentY, 
      ['Categoria', 'Valor'], 
      [
          ['Despesas Individuais', `R$ ${data.summary.individualExpenses.toFixed(2)}`],
          ['Despesas Coletivas', `R$ ${data.summary.collectiveExpenses.toFixed(2)}`],
          ['Seu Condomínio', `R$ ${data.summary.totalCondo.toFixed(2)}`]
      ], 
      [45, 45], 7);

  return currentY;
}


private addIndividualExpensesSection(pdf: any, startX: number, currentY: number, data: any): number {
  pdf.setFont('Helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Despesas Individuais', startX, currentY);
  currentY += 5;
  pdf.setFontSize(10);
  pdf.setFont('Helvetica', 'normal');
  pdf.text('Aqui você confere em detalhe as despesas de sua unidade.', startX, currentY);

  // Calcula o total das despesas individuais
  const totalIndividualExpenses = data.individualExpenses.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.value) || 0);
  }, 0);

  // Cria a tabela utilizando a função auxiliar
  currentY = this.generateTable(pdf, startX, currentY + 5, 
      ['Categoria', 'Valor'], 
      [
          ...data.individualExpenses.map((item: any) => [
              item.category,
              `R$ ${parseFloat(item.value || '0').toFixed(2)}`
          ]),
          // Adiciona o item "Total" ao final da tabela
          [
              { content: 'Total', styles: { fontStyle: 'bold' } },
              { content: `R$ ${totalIndividualExpenses.toFixed(2)}`, styles: { fontStyle: 'bold' } },
          ]
      ], 
      [45, 45], 7);

  return currentY;
}


private addCollectiveExpensesSection(pdf: any, startX: number, currentY: number, data: any):  [number, number] {
  pdf.setFont('Helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Despesas Coletivas', startX, currentY);
  currentY += 5;
  pdf.setFontSize(10);
  pdf.setFont('Helvetica', 'normal');
  pdf.text('Esta é a listagem de todas as contas pagas pelo seu ', startX, currentY);
  currentY += 5;
  pdf.text('condomínio, e a sua respectiva fração.', startX, currentY);

  // Agrupar e somar os valores pelo mesmo tipo_Gasto_Extra
  const groupedExpenses = data.collectiveExpenses.reduce((acc: any, item: any) => {
      const existing = acc.find((exp: any) => exp.tipo_Gasto_Extra === item.tipo_Gasto_Extra);
      if (existing) {
          existing.valor += Number(item.valor);
      } else {
          acc.push({ tipo_Gasto_Extra: item.tipo_Gasto_Extra, valor: Number(item.valor) });
      }
      return acc;
  }, []);

  // Calcula o total dos valores
  const totalValue = groupedExpenses.reduce((sum: number, item: any) => sum + item.valor, 0);

  // Cria a tabela utilizando a função auxiliar
  currentY = this.generateTable(pdf, startX, currentY + 5, 
      ['Categoria', 'Valor', 'Sua Fração'], 
      [
          ...groupedExpenses.map((item: any) => [
              item.tipo_Gasto_Extra,
              `R$ ${item.valor.toFixed(2)}`,
              `R$ ${(item.valor * data.fracao_total).toFixed(2)}`
          ]),
          // Adiciona o item "Total" ao final da tabela
          [
              { content: 'Total', styles: { fontStyle: 'bold' } },
              { content: `R$ ${totalValue.toFixed(2)}`, styles: { fontStyle: 'bold' } },
              { content: `R$ ${(totalValue * data.fracao_total).toFixed(2)}`, styles: { fontStyle: 'bold' } },
          ]
      ], 
      [30, 30, 30], 7);

  return [currentY,totalValue];
}


private addProvisionsSection(pdf: any, startX: number, currentY: number, data: any): number {
  pdf.setFont('Helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Provisões', startX, currentY);
  currentY += 5;
  pdf.setFontSize(10);
  pdf.setFont('Helvetica', 'normal');
  pdf.text('Resumo das provisões do condomínio.', startX, currentY);

  // Calcula o total das provisoes
  const totalProvisoes = data.provisoes.reduce((sum: number, item: any) => {
    return sum + (Number(item.valor)/ Number(item.frequencia) || 0);
  }, 0);

  // Cria a tabela utilizando a função auxiliar
  currentY = this.generateTable(pdf, startX, currentY + 5, 
      ['Categoria', 'Valor Mensal', 'Sua Fração'],
      [
          ...data.provisoes.map((item: any) => [
              item.detalhe,
              `R$ ${(Number(item.valor)/ Number(item.frequencia)).toFixed(2)}`,
              `R$ ${((Number(item.valor)/ Number(item.frequencia)) * data.fracao_total).toFixed(2)}`
          ]),
          // Adiciona o item "Total" ao final da tabela
          [
              { content: 'Total', styles: { fontStyle: 'bold' } },
              { content: `R$ ${totalProvisoes.toFixed(2)}`, styles: { fontStyle: 'bold' } },
              { content: `R$ ${(totalProvisoes * data.fracao_total).toFixed(2)}`, styles: { fontStyle: 'bold' } },

          ]
      ], 
      [30, 30, 30], 7);

  return currentY;
}

private addFundosSection(pdf: any, startX: number, currentY: number, data: any, totalValue:number): number {
  pdf.setFont('Helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Fundos ', startX, currentY);
  currentY += 5;
  pdf.setFontSize(10);
  pdf.setFont('Helvetica', 'normal');
  pdf.text('Resumo dos fundos do condomínio.', startX, currentY);

  // Calcula o total das provisoes
  const totalFundos = data.fundos.reduce((sum: number, item: any) => {
    return sum + (Number(item.porcentagem)* totalValue || 0);
  }, 0);

  // Cria a tabela utilizando a função auxiliar
  currentY = this.generateTable(pdf, startX, currentY + 5, 
      ['Categoria', 'Valor Mensal', 'Sua Fração'],
      [
          ...data.fundos.map((item: any) => [
              item.tipo_fundo,
              `R$ ${(Number(item.porcentagem)* totalValue).toFixed(2)}`,
              `R$ ${((Number(item.porcentagem)* totalValue) * data.fracao_total).toFixed(2)}`
          ]),
          // Adiciona o item "Total" ao final da tabela
          [
              { content: 'Total', styles: { fontStyle: 'bold' } },
              { content: `R$ ${totalFundos.toFixed(2)}`, styles: { fontStyle: 'bold' } },
              { content: `R$ ${(totalFundos * data.fracao_total).toFixed(2)}`, styles: { fontStyle: 'bold' } },

          ]
      ], 
      [30, 30, 30], 7);

  return currentY;
}

private generateTable(pdf: any, startX: number, currentY: number, head: string[], body: any[], columnWidths: number[], fontSize: number): number {
  pdf.setFont('Helvetica', 'normal');
  pdf.setFontSize(fontSize);

  // Adiciona a tabela
  autoTable(pdf, {
      startY: currentY + 5,
      margin: { left: startX, right: 110 },
      head: [head],
      body: body,
      theme: 'grid',
      styles: { fontSize: fontSize, cellPadding: 1 },
      headStyles: { fontSize: fontSize, fillColor: [0, 128, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: columnWidths.reduce((styles: any, width, index) => {
          styles[index] = { cellWidth: width };
          return styles;
      }, {}),
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
