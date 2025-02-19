export interface ExtratoPdf {
    id?: number;
    documento: any;       // Buffer/Base64 do PDF
    data_gasto: string;         // Data no formato YYYY-MM-DD
    tipo:string;
    predio_id:number;
    created_at?: string;        // Data de criação automática
    updated_at?: string;        // Data de atualização automática

  }