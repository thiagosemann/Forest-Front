export interface VagaDeGaragem {
    id?: number; // O ID pode ser opcional, dependendo de como é gerado no backend
    descricao: string;
    valor_diaria: number;
    fotos: string;
    endereco: string;
    tipoVaga: string;
    idProprietario: number;
    cidade?: string; // Adicione as novas propriedades se necessário
    bairro?: string;
    predio?: string;
  }
  