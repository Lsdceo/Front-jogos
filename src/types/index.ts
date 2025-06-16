// DTO Jogo do backend
export interface Game {
  id: number;
  titulo: string;
  descricao: string;
  precoSugerido: number;
  genero: string;
  desenvolvedora: string;
  publicadora: string;
  urlImagemCapa: string;
}

// DTO de Estoque do backend
export interface InventoryItem {
  id: number;
  jogoId: number;
  jogoTitulo: string;
  plataformaId: number;
  plataformaNome: string;
  depositoId: number;
  depositoNome: string;
  quantidade: number;
  precoUnitarioAtual: number;
}

// DTO de Movimentação do backend
export type TipoMovimentacao = 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA';

export interface StockMovement {
  id: number;
  tipo: TipoMovimentacao;
  jogoId: number;
  plataformaId: number;
  depositoOrigemId?: number;
  depositoDestinoId?: number;
  quantidade: number;
  precoUnitarioMomento?: number;
  observacao?: string;
  dataHora?: string;
}