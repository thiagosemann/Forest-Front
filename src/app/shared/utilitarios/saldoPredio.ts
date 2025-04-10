export interface SaldoPredio {
    id?: number; // O ID pode ser opcional, dependendo de como é gerado no backend
    predio_id: number;
    valor:number;
    data:string;
    type:string
    isInUse?:boolean;
}
  