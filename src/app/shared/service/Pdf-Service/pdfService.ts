import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart, registerables } from 'chart.js';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  // Configuração global para qualidade de imagens
  CHART_SCALE = 1; // Reduz escala dos gráficos

  constructor() {
    Chart.register(...registerables); // Registrar componentes do Chart.js
  }

  // Função auxiliar para formatação de moeda para PT-BR
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  async generateCondoStatement(data: any): Promise<Blob> {
    let pdfBlob: any;
    console.log(data);
    if (data.summary.individualExpenses > 0) {
      pdfBlob = this.pdfCompleto(data);
    } else {
      pdfBlob = this.pdfResumido1(data);
    }

    return pdfBlob;
  }

  async pdfResumido1(data: any): Promise<Blob> {
    console.log(data);
    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      compress: true, // Ativar compressão interna
    });
    const startX = 5;
    const logoPath = '../../../assets/images/logo-com-frase-V2.png';
    const logoWidth = 45;
    const logoHeight = 40;

    // Adiciona cabeçalho com logo e informações
    this.addHeader(pdf, logoPath, logoWidth, logoHeight, data);

    // Adiciona Resumo
    let currentY = this.addSummarySection(pdf, startX, data, 14);
    let scale2 = [100, 100];
    currentY = this.addResumoMes(pdf, startX, currentY, data, scale2, 20);
    // Adiciona Despesas Coletivas
    let totalValue = 0;
    let scale = [70, 25, 35, 35, 35];
    [currentY, totalValue] = this.addCollectiveExpensesSection(pdf, startX, currentY, data, scale, 20);

    let scale1 = [66, 66, 67];
    // Adiciona Fundos
    currentY = this.addFundosSection(pdf, startX, currentY, data, totalValue, scale1, 20);
    // Adiciona Saldos
    let scale3 = [100, 100];
    currentY = this.addSaldosSection(pdf, startX, currentY, data, totalValue, scale3, 20);
    // Retorna o PDF como Blob
    const pdfBlob = pdf.output('blob');
    return pdfBlob;
  }

  async pdfCompleto(data: any): Promise<Blob> {
    console.log(data);
    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      compress: true, // Ativar compressão interna
    });
    const startX = 5;
    const logoPath = '../../../assets/images/logo-com-frase-V2.png';
    const logoWidth = 45;
    const logoHeight = 40;
    const canvasWidth = 90 * 1.1;
    const canvasHeight = 70 * 1.1;

    // Adiciona cabeçalho com logo e informações
    this.addHeader(pdf, logoPath, logoWidth, logoHeight, data);

    // Adiciona a linha verde
    pdf.setDrawColor(0, 128, 0);
    pdf.setLineWidth(0.5);
    pdf.line(105, 45, 105, 290);

    // Adiciona Resumo
    let currentY = this.addSummarySection(pdf, startX, data, 10);
    let scale2 = [45, 45];
    currentY = this.addResumoMes(pdf, startX, currentY, data, scale2, 14);
    // Adiciona Despesas Individuais
    currentY = this.addIndividualExpensesSection(pdf, startX, currentY, data);

    // Adiciona Despesas Coletivas
    let totalValue = 0;
    let scale = [30, 15, 15, 15, 15];
    [currentY, totalValue] = this.addCollectiveExpensesSection(pdf, startX, currentY, data, scale, 14);

    // Reinicia o Y
    currentY = 45;
    // Adiciona Provisões.
    currentY = this.addProvisionsSection(pdf, 110, currentY, data, 14);

    // Adiciona Fundos.
    let scale1 = [30, 30, 30];
    currentY = this.addFundosSection(pdf, 110, currentY, data, totalValue, scale1, 14);
    // Adiciona Saldos.
    let scale3 = [45, 45];
    currentY = this.addSaldosSection(pdf, 110, currentY, data, totalValue, scale3, 14);

    // Adiciona nova página para os gráficos
    pdf.addPage();
    this.addHeaderPage2(pdf, logoPath, logoWidth, logoHeight, data);

    // Substituir a geração sequencial por Promise.all
    const [chart1, chart2, chart3, chart4] = await Promise.all([
      this.generateDonutChart(data.individualExpenses),
      this.generateChartAguaGas(data.individualExpensesHistory, 'Água (m³)'),
      this.generateChartAguaGas(data.individualExpensesHistory, 'Gás (m³)'),
      this.generateCondominioHistoryChart(data.rateiosPorApartamentoId),
    ]);
    // Adiciona os gráficos na nova página
    pdf.setFontSize(12);

    // Gráfico de Despesas Individuais (Donut)
    pdf.text('Despesas Individuais', 5, 50);
    pdf.addImage(chart1, 'JPEG', 5, 55, canvasWidth, canvasHeight, undefined, 'FAST');

    // Gráfico Histórico de Condomínios (abaixo do Donut)
    pdf.text('Histórico de Condomínio por Mês', 5, 140);
    pdf.addImage(chart4, 'JPEG', 5, 145, canvasWidth, canvasHeight, undefined, 'FAST');

    // Gráficos de Água e Gás (direita)
    pdf.text('Consumo de água (m3)', 110, 50);
    pdf.addImage(chart2, 'JPEG', 105, 55, canvasWidth, canvasHeight, undefined, 'FAST');

    pdf.text('Consumo de gás (m3)', 110, 140);
    pdf.addImage(chart3, 'JPEG', 105, 145, canvasWidth, canvasHeight, undefined, 'FAST');

    // Retorna o PDF como Blob
    const pdfBlob = pdf.output('blob');
    return pdfBlob;
  }

  private addHeader(pdf: any, logoPath: string, logoWidth: number, logoHeight: number, data: any): void {
    pdf.addImage(logoPath, 'PNG', 82.5, -5, logoWidth, logoHeight);
    pdf.setFontSize(20);
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(
      `${data.building.nome}`,
      105,
      30,
      { align: 'center' }
    );
    pdf.text(
      `Mês: ${data.month} | Apartamento: ${data.apartment} | Total: ${this.formatCurrency(data.condoTotal)}`,
      105,
      35,
      { align: 'center' }
    );
  }

  private addHeaderPage2(pdf: any, logoPath: string, logoWidth: number, logoHeight: number, data: any): void {
    pdf.addImage(logoPath, 'PNG', 82.5, -5, logoWidth, logoHeight);
    pdf.setFontSize(20);
    pdf.setFont('Helvetica', 'bold');
    // Possíveis ajustes para a segunda página
  }

  private addSummarySection(pdf: any, startX: number, data: any, fontSize: number): number {
    let currentY = 45;
    // Adiciona os textos estáticos
    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(fontSize);
    pdf.text('Sua Fração ideal:', startX, currentY);
    pdf.text('Fração garagem:', 60, currentY);
    currentY += 5;
    pdf.text(data.apt_fracao, startX, currentY);
    pdf.text(data.vagas_fracao, 60, currentY);
    currentY += 10;

    return currentY;
  }

  private addResumoMes(pdf: any, startX: number, currentY: number, data: any, scale: number[], fontSize: number): number {
    // Adiciona o título "Resumo"
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(fontSize);
    pdf.text('Resumo', startX, currentY);
    currentY += 2;

    // Cria as linhas da tabela condicionalmente
    const tableRows = [];

    if (data.summary.individualExpenses > 0) {
      tableRows.push(
        ['Despesas Individuais', this.formatCurrency(data.summary.individualExpenses)],
        ['Despesas Coletivas', this.formatCurrency(data.summary.collectiveExpenses)],
        ['Seu Condomínio', this.formatCurrency(data.summary.totalCondo)]
      );
    } else {
      tableRows.push(
        ['Seu Condomínio', this.formatCurrency(data.summary.totalCondo)]
      );
    }

    // Cria a tabela utilizando a função auxiliar
    currentY = this.generateTable(
      pdf,
      startX,
      currentY,
      ['Categoria', 'Valor'],
      tableRows,
      [scale[0], scale[1]],
      fontSize - 8
    );

    return currentY;
  }

  private addIndividualExpensesSection(pdf: any, startX: number, currentY: number, data: any): number {
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Despesas Individuais', startX, currentY);
    currentY += 2;
    pdf.setFontSize(10);
    pdf.setFont('Helvetica', 'normal');

    const totalIndividualExpenses = data.individualExpenses.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.value) || 0);
    }, 0);

    currentY = this.generateTable(
      pdf,
      startX,
      currentY,
      ['Categoria', 'Valor'],
      [
        ...data.individualExpenses.map((item: any) => [
          item.category,
          this.formatCurrency(parseFloat(item.value || '0'))
        ]),
        [
          { content: 'Total', styles: { fontStyle: 'bold' } },
          { content: this.formatCurrency(totalIndividualExpenses), styles: { fontStyle: 'bold' } },
        ]
      ],
      [45, 45],
      6
    );

    return currentY;
  }

  private addCollectiveExpensesSection(pdf: any, startX: number, currentY: number, data: any, scale: number[], fontSize: number): [number, number] {
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(fontSize);
    pdf.text('Despesas Coletivas', startX, currentY);
    currentY += 2;
    pdf.setFontSize(fontSize - 4);
    pdf.setFont('Helvetica', 'normal');

    const groupedExpenses = data.collectiveExpenses.reduce((acc: any, item: any) => {
      const existing = acc.find((exp: any) => exp.tipo_Gasto_Extra === item.tipo_Gasto_Extra);
      if (existing) {
        existing.valor += Number(item.valor);
      } else {
        acc.push({
          tipo_Gasto_Extra: item.tipo_Gasto_Extra,
          valor: Number(item.valor),
          tipo: item.tipo,
          parcela: item.parcela,
          total_parcelas: item.total_parcelas,
        });
      }
      return acc;
    }, []);

    const filteredExpenses = groupedExpenses.filter((item: any) => item.tipo !== "Provisão");

    const totalValueRateado = filteredExpenses
      .filter((item: any) => item.tipo === "Rateio")
      .reduce((sum: number, item: any) => sum + item.valor, 0);

    const totalValue = filteredExpenses.reduce((sum: number, item: any) => sum + item.valor, 0);

    currentY = this.generateTable(
      pdf,
      startX,
      currentY,
      ['Categoria', 'Tipo', 'Valor', 'Rateado', 'Sua Fração'],
      [
        ...filteredExpenses.map((item: any) => [
          Number(item.total_parcelas) > 1 ? `${item.tipo_Gasto_Extra} (${item.parcela}/${item.total_parcelas})` : item.tipo_Gasto_Extra,
          item.tipo,
          this.formatCurrency(item.valor),
          item.tipo === "Rateio" ? this.formatCurrency(item.valor) : this.formatCurrency(0),
          item.tipo === "Rateio" ? this.formatCurrency(item.valor * data.fracao_total) : this.formatCurrency(0)
        ]),
        [
          { content: 'Total', colSpan: 2, styles: { fontStyle: 'bold', halign: 'center' } },
          { content: this.formatCurrency(totalValue), styles: { fontStyle: 'bold' } },
          { content: this.formatCurrency(totalValueRateado), styles: { fontStyle: 'bold' } },
          { content: this.formatCurrency(totalValueRateado * data.fracao_total), styles: { fontStyle: 'bold' } },
        ]
      ],
      [scale[0], scale[1], scale[2], scale[3], scale[4]],
      fontSize - 8
    );

    return [currentY, totalValueRateado];
  }

  private addProvisionsSection(pdf: any, startX: number, currentY: number, data: any, fontSize: number): number {
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(fontSize);
    pdf.text('Provisões', startX, currentY);
    currentY += 2;
    pdf.setFontSize(fontSize - 4);
    pdf.setFont('Helvetica', 'normal');

    const totalProvisoes = data.provisoes.reduce((sum: number, item: any) => {
      return sum + (Number(item.valor) / Number(item.frequencia) || 0);
    }, 0);

    currentY = this.generateTable(
      pdf,
      startX,
      currentY,
      ['Categoria', 'Valor Mensal', 'Sua Fração'],
      [
        ...data.provisoes.map((item: any) => [
          item.detalhe,
          this.formatCurrency(Number(item.valor) / Number(item.frequencia)),
          this.formatCurrency((Number(item.valor) / Number(item.frequencia)) * data.fracao_total)
        ]),
        [
          { content: 'Total', styles: { fontStyle: 'bold' } },
          { content: this.formatCurrency(totalProvisoes), styles: { fontStyle: 'bold' } },
          { content: this.formatCurrency(totalProvisoes * data.fracao_total), styles: { fontStyle: 'bold' } },
        ]
      ],
      [30, 30, 30],
      6
    );

    return currentY;
  }

  private addFundosSection(pdf: any, startX: number, currentY: number, data: any, totalValue: number, scale: number[], fontSize: number): number {
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(fontSize);
    pdf.text('Fundos ', startX, currentY);
    currentY += 2;
    pdf.setFontSize(fontSize - 4);
    pdf.setFont('Helvetica', 'normal');

    const totalFundos = data.fundos.reduce((sum: number, item: any) => {
      return sum + (Number(item.porcentagem) * totalValue || 0);
    }, 0);

    currentY = this.generateTable(
      pdf,
      startX,
      currentY,
      ['Categoria', 'Valor Mensal', 'Sua Fração'],
      [
        ...data.fundos.map((item: any) => [
          item.tipo_fundo,
          this.formatCurrency(Number(item.porcentagem) * totalValue),
          this.formatCurrency((Number(item.porcentagem) * totalValue) * data.fracao_total)
        ]),
        [
          { content: 'Total', styles: { fontStyle: 'bold' } },
          { content: this.formatCurrency(totalFundos), styles: { fontStyle: 'bold' } },
          { content: this.formatCurrency(totalFundos * data.fracao_total), styles: { fontStyle: 'bold' } },
        ]
      ],
      [scale[0], scale[1], scale[2]],
      fontSize - 8
    );

    return currentY;
  }

  private addSaldosSection(pdf: any, startX: number, currentY: number, data: any, totalValue: number, scale: number[], fontSize: number): number {
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(fontSize);
    pdf.text('Saldos Bancários', startX, currentY);
    currentY += 2;

    const sortedSaldos = [...data.saldosPredios].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    const latestConta = sortedSaldos.find((item) => item.type === 'conta');
    const latestInvestimento1 = sortedSaldos.find((item) => item.type === 'investimento1');
    const latestInvestimento2 = sortedSaldos.find((item) => item.type === 'investimento2');

    const contaValue = latestConta ? parseFloat(latestConta.valor) : 0;
    const investimento1Value = latestInvestimento1 ? parseFloat(latestInvestimento1.valor) : 0;
    const investimento2Value = latestInvestimento2 ? parseFloat(latestInvestimento2.valor) : 0;

    currentY = this.generateTable(
      pdf,
      startX,
      currentY,
      ['Categoria', 'Valor'],
      [
        [
          { content: 'Conta Corrente', styles: { fontStyle: 'bold' } },
          { content: this.formatCurrency(contaValue), styles: { fontStyle: 'bold' } },
        ],
        [
          { content: 'Tipo de Investimento 1', styles: { fontStyle: 'bold' } },
          { content: this.formatCurrency(investimento1Value), styles: { fontStyle: 'bold' } },
        ],
        [
          { content: 'Tipo de Investimento 2', styles: { fontStyle: 'bold' } },
          { content: this.formatCurrency(investimento2Value), styles: { fontStyle: 'bold' } },
        ],
        [
          { content: 'Total', styles: { fontStyle: 'bold' } },
          { content: this.formatCurrency(contaValue + investimento1Value + investimento2Value), styles: { fontStyle: 'bold' } },
        ]
      ],
      [scale[0], scale[1]],
      fontSize - 8
    );

    return currentY;
  }

  private generateTable(pdf: any, startX: number, currentY: number, head: string[], body: any[], columnWidths: number[], fontSize: number): number {
    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(fontSize);

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
      const scale = this.CHART_SCALE;
      canvas.width = 400 * scale;
      canvas.height = 300 * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject('Erro ao criar contexto do canvas.');
        return;
      }

      const dataField = title === 'Água (m³)' ? 'aguaM3' : 'gasM3';
      const borderColor = title === 'Água (m³)' ? '#3498db' : '#f1c40f';
      const backgroundColor = title === 'Água (m³)'
        ? 'rgba(52, 152, 219, 0.5)'
        : 'rgba(241, 196, 15, 0.5)';

      const chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map((item) => this.getMonthTwoDigits(item.data_gasto)),
          datasets: [
            {
              label: title,
              data: data.map((item) => item[dataField]),
              borderColor: borderColor,
              backgroundColor: backgroundColor,
              fill: true,
              tension: 0.4,
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
                  size: 14 * scale,
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
                  size: 14 * scale,
                },
              },
              ticks: {
                font: {
                  size: 10 * scale,
                },
              },
            },
            y: {
              title: {
                display: true,
                font: {
                  size: 14 * scale,
                },
              },
              ticks: {
                font: {
                  size: 10 * scale,
                },
              },
              beginAtZero: true,
            },
          },
          animation: {
            onComplete: () => {
              resolve(canvas.toDataURL('image/png'));
              chartInstance.destroy();
            },
          },
        },
      });
    });
  }

  private generateCondominioHistoryChart(data: any[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const scale = this.CHART_SCALE;
      canvas.width = 400 * scale;
      canvas.height = 300 * scale;
      canvas.style.imageRendering = 'optimizeQuality';
      canvas.getContext('2d')!.imageSmoothingEnabled = true;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject('Erro ao criar contexto do canvas.');
        return;
      }

      const sortedData = data.slice().sort((a, b) => {
        const dateA = new Date(`${a.ano}-${a.mes}-01`);
        const dateB = new Date(`${b.ano}-${b.mes}-01`);
        return dateA.getTime() - dateB.getTime();
      });

      const labels = sortedData.map(item => `${String(item.mes).padStart(2, '0')}/${item.ano}`);
      const valores = sortedData.map(item => parseFloat(item.valor));

      const chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Valor do Condomínio (R$)',
            data: valores,
            borderColor: '#2ecc71',
            backgroundColor: 'rgba(46, 204, 113, 0.2)',
            fill: true,
            tension: 0.4,
          }]
        },
        options: {
          responsive: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                font: { size: 14 * scale },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Mês',
                font: { size: 14 * scale },
              },
              ticks: { font: { size: 10 * scale } },
            },
            y: {
              title: {
                display: false,
                text: 'Valor (R$)',
                font: { size: 14 * scale },
              },
              ticks: {
                font: { size: 10 * scale },
                callback: (value) => this.formatCurrency(Number(value)),
              },
              beginAtZero: true,
            },
          },
          animation: {
            onComplete: () => {
              resolve(canvas.toDataURL('image/png'));
              chartInstance.destroy();
            },
          },
        },
      });
    });
  }

  private generateDonutChart(data: any[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const scale = this.CHART_SCALE;
      canvas.width = 400 * scale;
      canvas.height = 300 * scale;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject('Erro ao criar contexto do canvas.');
        return;
      }

      const filteredData = data.filter((item) => item.value > 0);

      const generateGreenTones = (count: number) => {
        const tones = [];
        for (let i = 0; i < count; i++) {
          const intensity = Math.floor(128 + (i * 127) / count);
          tones.push(`rgba(0, ${intensity}, 0, 0.75)`);
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
              borderColor: '#ffffff',
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
                  size: 14 * scale,
                },
                color: '#000000',
                padding: 30,
                boxWidth: 20 * scale,
                boxHeight: 10 * scale,
              }
            },
          },
          animation: {
            onComplete: () => {
              resolve(canvas.toDataURL('image/png'));
              chartInstance.destroy();
            },
          },
        },
      });
    });
  }

  getMonthTwoDigits(dateString: string): string {
    const date = new Date(dateString);
    const month = date.getUTCMonth() + 1;
    return month.toString().padStart(2, '0');
  }
}
