export interface Pagamento {
    id?:number;
    apt_name: string; // O ID pode ser opcional, dependendo de como é gerado no backend
    data_vencimento: string;
    data_pagamento?: string;
    valor:string;
    valor_pagamento?:string;
}
  

