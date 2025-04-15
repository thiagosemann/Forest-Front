export interface PrestacaoCobrancaBoleto {
  id?: number;
  pdf?: any; // Pode ser um objeto, string ou caminho do arquivo PDF
  predio_id: number; // ID do prédio associado
  month: number;   // Mês (número) do envio
  year: number;    // Ano (número) do envio
}
