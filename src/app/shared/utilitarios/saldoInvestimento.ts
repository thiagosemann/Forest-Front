export interface SaldoInvestimento {
    id?: number; // O ID pode ser opcional, dependendo de como é gerado no backend
    predio_id: number;
    valor:number;
    data:string;
}
  