import { useEffect, useMemo, useState, useTransition } from 'react';
import type { FormEvent } from 'react';
import { PageShell } from '../components/page-shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { FadeIn } from '../components/animation';
import { requireAuth } from '../utils/auth.server';
import type { LiveChannel, PixRequest, Transaction, TransactionType } from '../types/wallet';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const hourFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: '2-digit',
});

const formatBRL = (value: number) => currencyFormatter.format(value);
const formatHour = (value: string) => hourFormatter.format(new Date(value));

const initialTransactions: Transaction[] = [
  {
    id: 'TX-9041',
    type: 'deposit',
    reference: 'Depósito confirmado via PIX',
    amount: 520.5,
    status: 'confirmado',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    channel: 'PIX',
  },
  {
    id: 'TX-9038',
    type: 'withdraw',
    reference: 'Saque PIX - Banco Inter',
    amount: 350,
    status: 'processando',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    channel: 'Web',
  },
  {
    id: 'TX-9031',
    type: 'bonus',
    reference: 'Cashback loja de jogos',
    amount: 80,
    status: 'confirmado',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    channel: 'Automação',
  },
  {
    id: 'TX-9024',
    type: 'deposit',
    reference: 'Depósito programado',
    amount: 230,
    status: 'confirmado',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    channel: 'PIX',
  },
];

const liveChannels: LiveChannel[] = ['PIX', 'Web', 'Automação'];

const createPixCode = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().slice(0, 8).toUpperCase();
  }
  return Math.random().toString(36).slice(2, 10).toUpperCase();
};

function createSimulatedTransaction(): Transaction {
  const type: TransactionType = Math.random() > 0.65 ? 'withdraw' : 'deposit';
  const amount = Number((Math.random() * (type === 'withdraw' ? 400 : 600) + 50).toFixed(2));
  return {
    id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
    type,
    reference:
      type === 'withdraw'
        ? 'Saque solicitado via Web'
        : Math.random() > 0.5
          ? 'Depósito confirmado via PIX'
          : 'Depósito escalonado automático',
    amount,
    status: type === 'withdraw' ? 'processando' : 'confirmado',
    timestamp: new Date().toISOString(),
    channel: liveChannels[Math.floor(Math.random() * liveChannels.length)],
  };
}

export async function loader(args: Parameters<typeof requireAuth>[0]) {
  await requireAuth(args);
  return null;
}
export default function Carteira() {
  const [balance, setBalance] = useState(2450.15);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [lastUpdate, setLastUpdate] = useState<Date>(() => new Date());
  const [connectionState, setConnectionState] = useState<'online' | 'sincronizando'>('online');
  const [nowTick, setNowTick] = useState(() => Date.now());

  const [depositAmount, setDepositAmount] = useState('250,00');
  const [depositError, setDepositError] = useState<string | null>(null);
  const [pixRequest, setPixRequest] = useState<PixRequest | null>(null);
  const [isGeneratingPix, startPixTransition] = useTransition();

  const [withdrawAmount, setWithdrawAmount] = useState('100,00');
  const [pixKey, setPixKey] = useState('548.921.170-09');
  const [withdrawNote, setWithdrawNote] = useState<{
    status: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isProcessingWithdraw, startWithdrawTransition] = useTransition();

  useEffect(() => {
    let syncTimeout: number | null = null;
    const interval = window.setInterval(() => {
      setConnectionState('sincronizando');
      setTransactions((current) => {
        const next = createSimulatedTransaction();
        setBalance((value) => value + (next.type === 'withdraw' ? -next.amount : next.amount));
        setLastUpdate(new Date());
        return [next, ...current].slice(0, 15);
      });
      syncTimeout = window.setTimeout(() => setConnectionState('online'), 1200);
    }, 12000);

    return () => {
      clearInterval(interval);
      if (syncTimeout) {
        clearTimeout(syncTimeout);
      }
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNowTick(Date.now()), 4000);
    return () => clearInterval(timer);
  }, []);

  const parseAmount = (value: string) => {
    const normalized = value.replace(/\./g, '').replace(',', '.');
    const numeric = Number(normalized);
    return Number.isFinite(numeric) ? Number(numeric.toFixed(2)) : NaN;
  };

  const timeSinceUpdate = useMemo(() => {
    const diff = Math.max(0, Math.floor((nowTick - lastUpdate.getTime()) / 1000));
    if (diff < 5) return 'atualizado agora';
    if (diff < 60) return `há ${diff}s`;
    const minutes = Math.floor(diff / 60);
    return `há ${minutes}min`;
  }, [lastUpdate, nowTick]);

  const pendingTransactions = useMemo(
    () => transactions.filter((tx) => tx.status !== 'confirmado').length,
    [transactions]
  );

  const lastDeposit = useMemo(
    () => transactions.find((tx) => tx.type === 'deposit'),
    [transactions]
  );

  const handleGeneratePix = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startPixTransition(() => {
      const amount = parseAmount(depositAmount);
      if (Number.isNaN(amount) || amount < 10) {
        setDepositError('Informe um valor mínimo de R$ 10,00.');
        setPixRequest(null);
        return;
      }
      if (amount > 15000) {
        setDepositError('O limite por operação é R$ 15.000,00.');
        setPixRequest(null);
        return;
      }
      setDepositError(null);
      const code = `BRPIX-${createPixCode()}`;
      const expiresAt = new Date(Date.now() + 1000 * 60 * 15);
      setPixRequest({ code, amount, expiresAt: expiresAt.toISOString(), status: 'gerado' });
      window.setTimeout(() => {
        setPixRequest((current) =>
          current && current.code === code ? { ...current, status: 'confirmado' } : current
        );
        setTransactions((current) => {
          const tx: Transaction = {
            id: `TX-${code.slice(-4)}`,
            type: 'deposit',
            reference: 'Depósito PIX confirmado automaticamente',
            amount,
            status: 'confirmado',
            timestamp: new Date().toISOString(),
            channel: 'PIX',
          };
          setBalance((value) => value + amount);
          return [tx, ...current].slice(0, 15);
        });
      }, 6000);
    });
  };

  const handleWithdraw = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startWithdrawTransition(() => {
      const amount = parseAmount(withdrawAmount);
      if (Number.isNaN(amount) || amount < 20) {
        setWithdrawNote({ status: 'error', message: 'Valor mínimo para saque é R$ 20,00.' });
        return;
      }
      if (amount > balance - 50) {
        setWithdrawNote({ status: 'error', message: 'Saldo insuficiente para concluir o saque.' });
        return;
      }
      if (!pixKey || pixKey.length < 6) {
        setWithdrawNote({ status: 'error', message: 'Informe uma chave PIX válida.' });
        return;
      }
      setWithdrawNote({
        status: 'success',
        message: 'Solicitação enviada para validação antifraude.',
      });
      const reference = `Saque para ${pixKey}`;
      setTransactions((current) => {
        const tx: Transaction = {
          id: `TX-${Math.floor(Math.random() * 99999)}`,
          type: 'withdraw',
          reference,
          amount,
          status: 'processando',
          timestamp: new Date().toISOString(),
          channel: 'Web',
        };
        setBalance((value) => value - amount);
        return [tx, ...current].slice(0, 15);
      });
      window.setTimeout(() => {
        setTransactions((current) =>
          current.map((tx) =>
            tx.reference === reference && tx.status === 'processando'
              ? { ...tx, status: 'confirmado' }
              : tx
          )
        );
      }, 7000);
    });
  };

  return (
    <PageShell
      title="Carteira PIX"
      description="Acompanhe saldo, fluxos PIX e saques com validação contínua e sinais de integridade."
    >
      <div className="grid gap-6 lg:grid-cols-[1.4fr,0.8fr]">
        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Saldo disponível</CardTitle>
                <CardDescription>Atualizado automaticamente via stream seguro.</CardDescription>
              </div>
              <div className="flex flex-col items-end text-sm text-[var(--color-muted)]">
                <span
                  className={connectionState === 'online' ? 'text-emerald-400' : 'text-amber-300'}
                >
                  {connectionState === 'online' ? 'Em tempo real' : 'Sincronizando dados'}
                </span>
                <span>{timeSinceUpdate}</span>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--color-muted)]">Saldo líquido</p>
                <p className="text-4xl font-bold">{formatBRL(balance)}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-muted)]">Último depósito</p>
                <p className="text-xl font-semibold">
                  {lastDeposit ? formatBRL(lastDeposit.amount) : 'Sem registros'}
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  {lastDeposit ? formatHour(lastDeposit.timestamp) : '—'}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between text-sm text-[var(--color-muted)]">
              <span>{pendingTransactions} movimentações aguardando confirmação</span>
              <span>
                Canal ativo:
                {liveChannels.map((channel) => (
                  <span key={channel} className="ml-2 inline-flex items-center gap-1 text-xs">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                    {channel}
                  </span>
                ))}
              </span>
            </CardFooter>
          </Card>
        </FadeIn>
        <FadeIn>
          <Card>
            <CardHeader>
              <CardTitle>Monitoramento</CardTitle>
              <CardDescription>Estado do stream PIX e variações recentes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-lg border border-[var(--color-border)] p-3">
                <p className="font-semibold text-[var(--color-foreground)]">Orquestrador</p>
                <p className="text-[var(--color-muted)]">
                  {connectionState === 'online'
                    ? 'Consumo estável com latência média de 240ms.'
                    : 'Sincronizando novamente para recuperar latência otimizada.'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-[var(--color-muted-foreground)]/5 p-3">
                  <p className="text-xs text-[var(--color-muted)]">Transações / 24h</p>
                  <p className="text-2xl font-semibold">286</p>
                </div>
                <div className="rounded-lg bg-[var(--color-muted-foreground)]/5 p-3">
                  <p className="text-xs text-[var(--color-muted)]">Taxa de sucesso</p>
                  <p className="text-2xl font-semibold text-emerald-400">98,7%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn>
          <Card aria-labelledby="deposito-pix">
            <CardHeader>
              <CardTitle id="deposito-pix">Depositar via PIX</CardTitle>
              <CardDescription>
                Gere um código instantâneo com expiração automática.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleGeneratePix}>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="deposit-value">
                    Valor desejado
                  </label>
                  <Input
                    id="deposit-value"
                    value={depositAmount}
                    onChange={(event) => setDepositAmount(event.target.value)}
                    inputMode="decimal"
                  />
                  {depositError && <p className="text-sm text-red-400">{depositError}</p>}
                </div>
                <Button type="submit" disabled={isGeneratingPix} className="w-full">
                  {isGeneratingPix ? 'Gerando código...' : 'Gerar QR Code PIX'}
                </Button>
              </form>
              {pixRequest && (
                <div className="mt-6 rounded-lg border border-dashed border-[var(--color-border)] p-4 text-sm">
                  <p className="font-semibold text-[var(--color-foreground)]">{pixRequest.code}</p>
                  <p className="text-[var(--color-muted)]">
                    Valor: {formatBRL(pixRequest.amount)} · expira{' '}
                    {formatHour(pixRequest.expiresAt)}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    Status:{' '}
                    {pixRequest.status === 'gerado'
                      ? 'Aguardando pagamento'
                      : 'Confirmado automaticamente'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
        <FadeIn>
          <Card aria-labelledby="saque-pix">
            <CardHeader>
              <CardTitle id="saque-pix">Solicitar saque PIX</CardTitle>
              <CardDescription>Validação antifraude em até 5 minutos.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleWithdraw}>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="withdraw-value">
                    Valor a sacar
                  </label>
                  <Input
                    id="withdraw-value"
                    value={withdrawAmount}
                    onChange={(event) => setWithdrawAmount(event.target.value)}
                    inputMode="decimal"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="pix-key">
                    Chave PIX de destino
                  </label>
                  <Input
                    id="pix-key"
                    value={pixKey}
                    onChange={(event) => setPixKey(event.target.value)}
                  />
                </div>
                <Button type="submit" disabled={isProcessingWithdraw} className="w-full">
                  {isProcessingWithdraw ? 'Processando...' : 'Solicitar saque'}
                </Button>
              </form>
              {withdrawNote && (
                <p
                  className={`mt-4 text-sm ${
                    withdrawNote.status === 'success' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {withdrawNote.message}
                </p>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <FadeIn>
        <Card aria-labelledby="historico">
          <CardHeader>
            <CardTitle id="historico">Histórico recente</CardTitle>
            <CardDescription>
              Acompanhe depósitos, saques e bonificações em tempo real.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[var(--color-muted)]">
                <tr>
                  <th className="py-2 pr-4">Movimentação</th>
                  <th className="py-2 pr-4">Valor</th>
                  <th className="py-2 pr-4">Canal</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-[var(--color-border)]">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-[var(--color-foreground)]">{tx.reference}</p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {formatHour(tx.timestamp)}
                      </p>
                    </td>
                    <td className="py-3 pr-4 font-semibold">
                      {tx.type === 'withdraw'
                        ? `- ${formatBRL(tx.amount)}`
                        : `+ ${formatBRL(tx.amount)}`}
                    </td>
                    <td className="py-3 pr-4 text-[var(--color-muted)]">{tx.channel}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          tx.status === 'confirmado'
                            ? 'bg-emerald-500/10 text-emerald-300'
                            : tx.status === 'processando'
                              ? 'bg-amber-500/10 text-amber-300'
                              : 'bg-red-500/10 text-red-300'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </FadeIn>
    </PageShell>
  );
}
