export interface Vaga {
    id?: number; // O ID pode ser opcional, dependendo de como é gerado no backend
    nome: string;
    predio_id: number;
    apartamento_id:number;
    fracao:number;
}
  