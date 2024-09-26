import { Vaga } from "./vaga";

export interface Rateio {
    apt_name: string;
    apt_fracao: number;
    valorIndividual:number;
    apt_id: number;
    vagas:Vaga[];
    fracao_total:number;
}
  