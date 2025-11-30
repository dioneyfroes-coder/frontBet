import { useCallback, useDeferredValue, useEffect, useMemo, useState, useTransition } from 'react';
import type { ChangeEvent, FormEvent, MouseEvent } from 'react';
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
import { useI18n } from '../i18n/i18n-provider';
import { cfg, formatMoney, formatMessage } from '../lib/config';
import { getPageMeta } from '../i18n/page-copy';
import type { Route } from './+types/carteira';

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
const historyFilters: Array<'todos' | TransactionType> = ['todos', 'deposit', 'withdraw', 'bonus'];
const channelOrder = ['PIX', 'Web', 'Automação'] as const;

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

export function meta({}: Route.MetaArgs) {
  const meta = getPageMeta('wallet');
  return [{ title: meta.title }, { name: 'description', content: meta.description }];
}

export default function Carteira() {
  const { messages } = useI18n();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const walletCopy = messages.wallet as Record<string, any>;
  const historyCopy = walletCopy.history;
  const summaryCard = walletCopy.summaryCard;
  const monitoringCopy = walletCopy.monitoringCard;
  const depositCopy = walletCopy.depositCard;
  const withdrawCopy = walletCopy.withdrawCard;
  const statusCopy = walletCopy.statuses;
  const connectionCopy = walletCopy.connectionStates;
  const channelLabels = walletCopy.channels;
  const errorsCopy = walletCopy.errors;

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
  const [historySearch, setHistorySearch] = useState('');
  const [historyType, setHistoryType] = useState<'todos' | TransactionType>('todos');
  const deferredHistorySearch = useDeferredValue(historySearch);
  const [isFilteringHistory, startHistoryTransition] = useTransition();

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

  const parseAmount = useCallback((value: string) => {
    const normalized = value.replace(/\./g, '').replace(',', '.');
    const numeric = Number(normalized);
    return Number.isFinite(numeric) ? Number(numeric.toFixed(2)) : NaN;
  }, []);

  const timeSinceUpdate = useMemo(() => {
    const diff = Math.max(0, Math.floor((nowTick - lastUpdate.getTime()) / 1000));
    if (diff < 5) {
      return walletCopy.timeSince.updatedNow;
    }
    if (diff < 60) {
      return formatMessage(walletCopy.timeSince.secondsAgo, { count: String(diff) });
    }
    const minutes = Math.floor(diff / 60);
    return formatMessage(walletCopy.timeSince.minutesAgo, { count: String(minutes) });
  }, [lastUpdate, nowTick, walletCopy.timeSince]);

  const pendingTransactions = useMemo(
    () => transactions.filter((tx) => tx.status !== 'confirmado').length,
    [transactions]
  );

  const lastDeposit = useMemo(
    () => transactions.find((tx) => tx.type === 'deposit'),
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    const term = deferredHistorySearch.trim().toLowerCase();
    return transactions.filter((tx) => {
      const matchesType = historyType === 'todos' || tx.type === historyType;
      if (!matchesType) {
        return false;
      }
      if (!term) {
        return true;
      }
      const haystack = `${tx.reference} ${tx.channel} ${tx.status}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [transactions, historyType, deferredHistorySearch]);

  const handleHistoryTypeChange = useCallback(
    (type: 'todos' | TransactionType) => {
      startHistoryTransition(() => {
        setHistoryType(type);
      });
    },
    [startHistoryTransition]
  );

  const handleHistorySearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setHistorySearch(event.target.value);
  }, []);

  const handleHistoryFilterClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const filter = event.currentTarget.dataset.filter as 'todos' | TransactionType | undefined;
      if (!filter) return;
      handleHistoryTypeChange(filter);
    },
    [handleHistoryTypeChange]
  );

  const handleGeneratePix = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      startPixTransition(() => {
        const amount = parseAmount(depositAmount);
        if (Number.isNaN(amount) || amount < cfg.MIN_DEPOSIT / 100) {
          setDepositError(
            formatMessage(errorsCopy.depositMin, { minDeposit: formatMoney(cfg.MIN_DEPOSIT) })
          );
          setPixRequest(null);
          return;
        }
        if (amount > cfg.MAX_DEPOSIT / 100) {
          setDepositError(
            formatMessage(errorsCopy.depositMax, { maxDeposit: formatMoney(cfg.MAX_DEPOSIT) })
          );
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
    },
    [depositAmount, errorsCopy.depositMax, errorsCopy.depositMin, parseAmount, startPixTransition]
  );

  const handleWithdraw = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      startWithdrawTransition(() => {
        const amount = parseAmount(withdrawAmount);
        if (Number.isNaN(amount) || amount < cfg.MIN_WITHDRAWAL / 100) {
          setWithdrawNote({
            status: 'error',
            message: formatMessage(errorsCopy.withdrawMin, {
              minWithdrawal: formatMoney(cfg.MIN_WITHDRAWAL),
            }),
          });
          return;
        }
        if (amount > balance - 50) {
          setWithdrawNote({ status: 'error', message: errorsCopy.withdrawBalance });
          return;
        }
        if (!pixKey || pixKey.length < 6) {
          setWithdrawNote({ status: 'error', message: errorsCopy.withdrawPixKey });
          return;
        }
        setWithdrawNote({ status: 'success', message: withdrawCopy.successNote });
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
    },
    [
      balance,
      errorsCopy,
      parseAmount,
      pixKey,
      startWithdrawTransition,
      withdrawAmount,
      withdrawCopy.successNote,
    ]
  );

  return (
    <PageShell title={walletCopy.title} description={walletCopy.description}>
      <div className="grid gap-6 lg:grid-cols-[1.4fr,0.8fr]">
        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{summaryCard.title}</CardTitle>
                <CardDescription>{summaryCard.description}</CardDescription>
              </div>
              <div className="flex flex-col items-end text-sm text-[var(--color-muted)]">
                <span
                  className={connectionState === 'online' ? 'text-emerald-400' : 'text-amber-300'}
                >
                  {connectionCopy[connectionState]}
                </span>
                <span>{timeSinceUpdate}</span>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--color-muted)]">{summaryCard.liquidLabel}</p>
                <p className="text-4xl font-bold">{formatBRL(balance)}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-muted)]">{summaryCard.lastDepositLabel}</p>
                <p className="text-xl font-semibold">
                  {lastDeposit ? formatBRL(lastDeposit.amount) : summaryCard.noRecords}
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  {lastDeposit ? formatHour(lastDeposit.timestamp) : '—'}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 text-sm text-[var(--color-muted)] md:flex-row md:items-center md:justify-between">
              <span>
                {formatMessage(summaryCard.pendingTemplate, { count: String(pendingTransactions) })}
              </span>
              <span className="flex flex-wrap items-center gap-2">
                <span>{summaryCard.activeChannels}</span>
                {channelOrder.map((channel) => (
                  <span key={channel} className="inline-flex items-center gap-1 text-xs">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                    {channelLabels[channel] ?? channel}
                  </span>
                ))}
              </span>
            </CardFooter>
          </Card>
        </FadeIn>
        <FadeIn>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{monitoringCopy.title}</CardTitle>
                <CardDescription>{monitoringCopy.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-lg border border-[color:var(--color-border)] p-3">
                <p className="font-semibold text-[var(--color-foreground)]">
                  {monitoringCopy.orchestratorLabel}
                </p>
                <p className="text-[var(--color-muted)]">
                  {connectionState === 'online'
                    ? monitoringCopy.onlineCopy
                    : monitoringCopy.syncingCopy}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-[var(--color-muted-foreground)]/5 p-3">
                  <p className="text-xs text-[var(--color-muted)]">
                    {monitoringCopy.transactionsLabel}
                  </p>
                  <p className="text-2xl font-semibold">286</p>
                </div>
                <div className="rounded-lg bg-[var(--color-muted-foreground)]/5 p-3">
                  <p className="text-xs text-[var(--color-muted)]">
                    {monitoringCopy.successRateLabel}
                  </p>
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
              <div>
                <CardTitle id="deposito-pix">{depositCopy.title}</CardTitle>
                <CardDescription>{depositCopy.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleGeneratePix}>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="deposit-value">
                    {depositCopy.amountLabel}
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
                  {isGeneratingPix ? depositCopy.submitting : depositCopy.submit}
                </Button>
              </form>
              {pixRequest && (
                <div className="mt-6 rounded-lg border border-dashed border-[color:var(--color-border)] p-4 text-sm">
                  <p className="font-semibold text-[var(--color-foreground)]">{pixRequest.code}</p>
                  <p className="text-[var(--color-muted)]">
                    {depositCopy.summaryLabel}: {formatBRL(pixRequest.amount)} ·{' '}
                    {depositCopy.expiresLabel} {formatHour(pixRequest.expiresAt)}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {depositCopy.pixStatus[pixRequest.status]}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
        <FadeIn>
          <Card aria-labelledby="saque-pix">
            <CardHeader>
              <div>
                <CardTitle id="saque-pix">{withdrawCopy.title}</CardTitle>
                <CardDescription>{withdrawCopy.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleWithdraw}>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="withdraw-value">
                    {withdrawCopy.amountLabel}
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
                    {withdrawCopy.pixKeyLabel}
                  </label>
                  <Input
                    id="pix-key"
                    value={pixKey}
                    onChange={(event) => setPixKey(event.target.value)}
                  />
                </div>
                <Button type="submit" disabled={isProcessingWithdraw} className="w-full">
                  {isProcessingWithdraw ? withdrawCopy.submitting : withdrawCopy.submit}
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
            <div>
              <CardTitle id="historico">{historyCopy.title}</CardTitle>
              <CardDescription>{historyCopy.description}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="flex-1">
                <Input
                  label={historyCopy.searchLabel}
                  placeholder={historyCopy.searchPlaceholder}
                  value={historySearch}
                  onChange={handleHistorySearchChange}
                />
              </div>
              <div className="text-sm text-[var(--color-muted)]">
                {isFilteringHistory
                  ? historyCopy.filtering
                  : formatMessage(historyCopy.totalTemplate, {
                      count: String(filteredTransactions.length),
                    })}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {historyFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={historyType === filter}
                  data-filter={filter}
                  onClick={handleHistoryFilterClick}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    historyType === filter
                      ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]'
                      : 'border-[color:var(--color-border)] text-[var(--color-muted)] hover:border-[color:var(--color-primary)]/30'
                  }`}
                >
                  {filter === 'todos'
                    ? historyCopy.filters.todos
                    : filter === 'deposit'
                      ? historyCopy.filters.deposit
                      : filter === 'withdraw'
                        ? historyCopy.filters.withdraw
                        : historyCopy.filters.bonus}
                </button>
              ))}
            </div>
            {filteredTransactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] p-6 text-sm text-[var(--color-muted)]">
                {historyCopy.emptyState}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-[var(--color-muted)]">
                    <tr>
                      <th className="py-2 pr-4">{historyCopy.tableHeaders.movement}</th>
                      <th className="py-2 pr-4">{historyCopy.tableHeaders.amount}</th>
                      <th className="py-2 pr-4">{historyCopy.tableHeaders.channel}</th>
                      <th className="py-2">{historyCopy.tableHeaders.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="border-t border-[var(--color-border)]">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-[var(--color-foreground)]">
                            {historyCopy.referenceMap[
                              tx.reference as keyof typeof historyCopy.referenceMap
                            ] ?? tx.reference}
                          </p>
                          <p className="text-xs text-[var(--color-muted)]">
                            {formatHour(tx.timestamp)}
                          </p>
                        </td>
                        <td className="py-3 pr-4 font-semibold">
                          {tx.type === 'withdraw'
                            ? `- ${formatBRL(tx.amount)}`
                            : `+ ${formatBRL(tx.amount)}`}
                        </td>
                        <td className="py-3 pr-4 text-[var(--color-muted)]">
                          {channelLabels[tx.channel] ?? tx.channel}
                        </td>
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
                            {statusCopy[tx.status] ?? tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </PageShell>
  );
}

export async function loader(args: Parameters<typeof requireAuth>[0]) {
  await requireAuth(args);
  return null;
}
