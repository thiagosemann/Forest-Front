export interface NotaGastoComum {
  id?: number;
  documentBlob: any; // Nome ou caminho do arquivo PDF
  commonExpense_id: number; // ID do gasto comum associado
  created_at?: string; // Data de criação
  updated_at?: string; // Data da última atualização
}
