export interface RateioBoletoEmail {
    id?:number; 
    rateioPdf?: string | null;
    boletoPdf?: string | null;
    rateioPdfFileName?:string;
    boletoPdfFileName?:string;
    rateioApartamento_id?:number; 
    rateio_id?:number; 
  }