import { NotaGastoComum } from "./notasGastosComuns";

export interface CommonExpense {
    id?: number;
    data_gasto: string;
    nome_original: string;
    valor: number;
    tipo: string;
    parcela: number;
    total_parcelas: number;
    predio_id: number;
    tipoGasto_id?:number;
    tipo_Gasto_Extra:string;
    documento?: NotaGastoComum;
    nota_id?:number;
    
}
