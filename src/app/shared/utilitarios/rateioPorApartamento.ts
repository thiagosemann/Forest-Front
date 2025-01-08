import { Vaga } from "./vaga";

export interface RateioPorApartamento {
    id?:number;
    apt_name: string;
    apt_fracao: number;
    valorIndividual?:number;
    valorComum?:number;
    valorProvisoes?:number;
    valorFundos?:number;
    apartamento_id: number;
    vagas:Vaga[];
    fracao_total:number;
}
  