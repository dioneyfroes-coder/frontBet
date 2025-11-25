export type LiveChannel = 'PIX' | 'Web' | 'Automação';

export type TransactionType = 'deposit' | 'withdraw' | 'bonus';

export type TransactionStatus = 'confirmado' | 'processando' | 'aguardando' | 'falhou';

export type Transaction = {
  id: string;
  type: TransactionType;
  reference: string;
  amount: number;
  status: TransactionStatus;
  timestamp: string;
  channel: LiveChannel;
};

export type PixRequest = {
  code: string;
  amount: number;
  expiresAt: string;
  status: 'gerado' | 'confirmado';
};
