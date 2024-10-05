import { Vaga } from "./vaga";

export interface Rateio {
    apt_name: string;
    apt_fracao: number;
    valorIndividual?:number;
    valorComum?:number;
    valorProvisoes?:number;
    valorFundos?:number;
    apt_id: number;
    vagas:Vaga[];
    fracao_total:number;
}
  