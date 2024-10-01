export interface Fundo {
    id?: number; // O ID pode ser opcional, dependendo de como é gerado no backend
    tipo_fundo: string;
    predio_id: number;
    predioName?:string;
    porcentagem:number;
}
  