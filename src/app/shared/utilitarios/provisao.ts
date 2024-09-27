export interface Provisao {
    id?: number; // O ID pode ser opcional, dependendo de como é gerado no backend
    detalhe: string;
    predio_id: number;
    predioName:string;
    valor:number;
    frequencia:string;
}
  