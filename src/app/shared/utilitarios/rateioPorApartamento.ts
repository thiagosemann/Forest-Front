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
    rateio_boleto_email_id? : number;
    vagas:Vaga[];
    fracao_total:number;
    data_pagamento?:string;
    data_vencimento?:string;
}
  