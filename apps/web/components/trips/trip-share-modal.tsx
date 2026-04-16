'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Share2, Download, FileText, Table2, Link2, Check,
  Loader2, Copy, MapPin, Calendar, Wallet, List, Mail, MessageCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import type { Expense, ItineraryDay, ItineraryItem, Trip } from '@trpy/database';
import { cn } from '@/lib/utils';

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface TripDetail extends Trip {
  itineraryDays: (ItineraryDay & { items: ItineraryItem[] })[];
  expenses: Expense[];
}

interface TripShareModalProps {
  trip: TripDetail;
  onClose: () => void;
}

/* ── Category labels ────────────────────────────────────────────────────────── */

const CAT_LABEL: Record<string, string> = {
  ACCOMMODATION: 'Hospedagem',
  FOOD: 'Alimentação',
  TRANSPORT: 'Transporte',
  ACTIVITIES: 'Atividades',
  SHOPPING: 'Compras',
  HEALTH: 'Saúde',
  OTHER: 'Outros',
};

const ITEM_TYPE_LABEL: Record<string, string> = {
  ACTIVITY: 'Atividade',
  RESTAURANT: 'Restaurante',
  HOTEL: 'Hotel',
  TRANSPORT: 'Transporte',
  OTHER: 'Outro',
};

/* ── CSV Export ─────────────────────────────────────────────────────────────── */

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildExpenseCsv(trip: TripDetail): string {
  const headers = ['Data', 'Título', 'Categoria', 'Valor', 'Moeda', 'Notas'];
  const rows = trip.expenses.map((e) => [
    format(new Date(e.date), 'dd/MM/yyyy'),
    e.title,
    CAT_LABEL[e.category] ?? e.category,
    Number(e.amount).toFixed(2),
    e.currency,
    e.notes ?? '',
  ]);

  const total = trip.expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((r) => r.map(escapeCsvCell).join(',')),
    '',
    `${escapeCsvCell('TOTAL')},,,${escapeCsvCell(total.toFixed(2))},${escapeCsvCell(trip.currency)},`,
  ];

  return lines.join('\n');
}

function buildItineraryCsv(trip: TripDetail): string {
  const headers = ['Dia', 'Data', 'Título do Dia', 'Horário', 'Atividade', 'Tipo', 'Local', 'Duração (min)', 'Custo', 'Moeda', 'Descrição'];
  const rows: string[][] = [];

  for (const day of trip.itineraryDays) {
    if (day.items.length === 0) {
      rows.push([
        String(day.dayNumber),
        format(new Date(day.date), 'dd/MM/yyyy'),
        day.title ?? `Dia ${day.dayNumber}`,
        '', '', '', '', '', '', '', '',
      ]);
    } else {
      for (const item of day.items) {
        rows.push([
          String(day.dayNumber),
          format(new Date(day.date), 'dd/MM/yyyy'),
          day.title ?? `Dia ${day.dayNumber}`,
          item.startTime ?? '',
          item.title,
          ITEM_TYPE_LABEL[item.type] ?? item.type,
          item.location ?? '',
          item.durationMins != null ? String(item.durationMins) : '',
          item.cost != null ? Number(item.cost).toFixed(2) : '',
          (item as any).currency ?? '',
          item.description ?? '',
        ]);
      }
    }
  }

  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((r) => r.map(escapeCsvCell).join(',')),
  ];

  return lines.join('\n');
}

function downloadCsv(content: string, filename: string) {
  const bom = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ── PDF Export ─────────────────────────────────────────────────────────────── */

function buildPrintableHtml(trip: TripDetail): string {
  const totalBudget = Number(trip.budget);
  const totalSpent = Number(trip.totalSpent);
  const remaining = totalBudget - totalSpent;

  const expensesByCategory: Record<string, { total: number; items: typeof trip.expenses }> = {};
  for (const e of trip.expenses) {
    if (!expensesByCategory[e.category]) {
      expensesByCategory[e.category] = { total: 0, items: [] };
    }
    expensesByCategory[e.category].total += Number(e.amount);
    expensesByCategory[e.category].items.push(e);
  }

  const fmt = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const itineraryHtml = trip.itineraryDays.length > 0 ? `
    <section>
      <h2>📅 Itinerário</h2>
      ${trip.itineraryDays.map((day) => `
        <div class="day-block">
          <h3>Dia ${day.dayNumber} — ${day.title ?? format(new Date(day.date), "EEEE, d 'de' MMMM", { locale: ptBR })}</h3>
          <p class="day-date">${format(new Date(day.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
          ${day.items.length === 0
            ? '<p class="empty">Nenhuma atividade planejada</p>'
            : `<table class="items-table">
                <thead><tr><th>Horário</th><th>Atividade</th><th>Local</th><th>Duração</th><th>Custo</th></tr></thead>
                <tbody>
                  ${day.items.map((item) => `
                    <tr>
                      <td>${item.startTime ?? '—'}</td>
                      <td><strong>${item.title}</strong>${item.description ? `<br><span class="note">${item.description}</span>` : ''}</td>
                      <td>${item.location ?? '—'}</td>
                      <td>${item.durationMins != null ? `${item.durationMins}min` : '—'}</td>
                      <td>${item.cost != null && Number(item.cost) > 0 ? `${(item as any).currency ?? trip.currency} ${fmt(Number(item.cost))}` : '—'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>`
          }
        </div>
      `).join('')}
    </section>
  ` : '';

  const expensesHtml = trip.expenses.length > 0 ? `
    <section>
      <h2>💸 Despesas</h2>
      <div class="summary-grid">
        <div class="summary-card">
          <p class="label">Orçamento total</p>
          <p class="value">${trip.currency} ${fmt(totalBudget)}</p>
        </div>
        <div class="summary-card">
          <p class="label">Total gasto</p>
          <p class="value spent">${trip.currency} ${fmt(totalSpent)}</p>
        </div>
        <div class="summary-card">
          <p class="label">Saldo</p>
          <p class="value ${remaining < 0 ? 'over' : 'green'}">${trip.currency} ${fmt(Math.abs(remaining))}${remaining < 0 ? ' (excedido)' : ''}</p>
        </div>
      </div>

      ${Object.entries(expensesByCategory).map(([cat, data]) => `
        <div class="category-group">
          <h4>${CAT_LABEL[cat] ?? cat} <span class="cat-total">${trip.currency} ${fmt(data.total)}</span></h4>
          <table class="expense-table">
            <thead><tr><th>Data</th><th>Descrição</th><th>Notas</th><th>Valor</th></tr></thead>
            <tbody>
              ${data.items.map((e) => `
                <tr>
                  <td>${format(new Date(e.date), 'dd/MM/yyyy')}</td>
                  <td>${e.title}</td>
                  <td class="note">${e.notes ?? ''}</td>
                  <td class="amount">${e.currency} ${fmt(Number(e.amount))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}
    </section>
  ` : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Planejamento — ${trip.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #111; background: #fff; padding: 32px; max-width: 900px; margin: 0 auto; }
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    .meta { color: #666; font-size: 12px; margin-bottom: 24px; display: flex; gap: 16px; flex-wrap: wrap; }
    .meta span { display: flex; align-items: center; gap: 4px; }
    section { margin-bottom: 36px; }
    h2 { font-size: 16px; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 16px; }
    h3 { font-size: 14px; font-weight: 700; margin-bottom: 2px; color: #374151; }
    h4 { font-size: 13px; font-weight: 600; color: #4B5563; margin: 16px 0 8px; }
    .day-block { margin-bottom: 20px; padding: 12px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
    .day-date { font-size: 11px; color: #6B7280; margin-bottom: 10px; margin-top: 2px; text-transform: capitalize; }
    .empty { font-size: 12px; color: #9CA3AF; font-style: italic; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #f3f4f6; text-align: left; padding: 6px 8px; font-weight: 600; border-bottom: 1px solid #e5e7eb; }
    td { padding: 6px 8px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
    .note { color: #6B7280; font-size: 11px; font-style: italic; }
    .amount { font-weight: 600; text-align: right; white-space: nowrap; }
    .cat-total { color: #059669; font-weight: 700; font-size: 12px; margin-left: 8px; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .summary-card { padding: 12px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
    .summary-card .label { font-size: 11px; color: #6B7280; margin-bottom: 4px; }
    .summary-card .value { font-size: 16px; font-weight: 700; color: #111; }
    .summary-card .value.spent { color: #D97706; }
    .summary-card .value.green { color: #059669; }
    .summary-card .value.over { color: #DC2626; }
    .category-group { margin-bottom: 16px; }
    .items-table th, .items-table td { padding: 5px 8px; }
    .expense-table .amount { text-align: right; color: #DC2626; }
    @media print {
      body { padding: 16px; }
      .day-block { break-inside: avoid; }
      section { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>${trip.title}</h1>
  <div class="meta">
    <span>📍 ${trip.destination}</span>
    ${trip.startDate ? `<span>📅 ${format(new Date(trip.startDate), "d MMM yyyy", { locale: ptBR })} ${trip.endDate ? `→ ${format(new Date(trip.endDate), "d MMM yyyy", { locale: ptBR })}` : ''}</span>` : ''}
    ${trip.budget && Number(trip.budget) > 0 ? `<span>💰 Orçamento: ${trip.currency} ${Number(trip.budget).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>` : ''}
    ${trip.itineraryDays.length > 0 ? `<span>🗓 ${trip.itineraryDays.length} dia${trip.itineraryDays.length !== 1 ? 's' : ''}</span>` : ''}
    ${trip.expenses.length > 0 ? `<span>💸 ${trip.expenses.length} despesa${trip.expenses.length !== 1 ? 's' : ''}</span>` : ''}
  </div>
  ${trip.description ? `<p style="margin-bottom: 24px; color: #4B5563; font-size: 13px; line-height: 1.6;">${trip.description}</p>` : ''}
  ${itineraryHtml}
  ${expensesHtml}
  <p style="margin-top: 32px; text-align: center; font-size: 11px; color: #9CA3AF;">Gerado por TRPY · ${format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
</body>
</html>`;
}

/* ── Share Option Card ──────────────────────────────────────────────────────── */

interface OptionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  loading?: boolean;
  done?: boolean;
  color?: string;
}

function OptionCard({ icon: Icon, title, description, onClick, loading, done, color = 'text-primary bg-primary/10' }: OptionCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', color)}>
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : done ? (
          <Check className="w-5 h-5 text-emerald-500" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </motion.button>
  );
}

/* ── Main Modal ─────────────────────────────────────────────────────────────── */

export function TripShareModal({ trip, onClose }: TripShareModalProps) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  // Stats
  const totalDays = trip.itineraryDays.length;
  const totalItems = trip.itineraryDays.reduce((s, d) => s + d.items.length, 0);
  const totalExpenses = trip.expenses.length;
  const totalSpent = Number(trip.totalSpent);

  async function handleCopyLink() {
    try {
      const url = `${window.location.origin}/dashboard/trips/${trip.id}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success('Link copiado!', { description: 'Cole e compartilhe com quem quiser.' });
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      toast.error('Não foi possível copiar o link.');
    }
  }

  function handleExportExpensesCsv() {
    if (trip.expenses.length === 0) {
      toast.error('Nenhuma despesa para exportar.');
      return;
    }
    const csv = buildExpenseCsv(trip);
    const filename = `${trip.title.replace(/[^a-zA-Z0-9]/g, '_')}_despesas.csv`;
    downloadCsv(csv, filename);
    toast.success('CSV exportado!', { description: `${trip.expenses.length} despesa${trip.expenses.length !== 1 ? 's' : ''} exportada${trip.expenses.length !== 1 ? 's' : ''}.` });
  }

  function handleExportItineraryCsv() {
    if (trip.itineraryDays.length === 0) {
      toast.error('Nenhum itinerário para exportar.');
      return;
    }
    const csv = buildItineraryCsv(trip);
    const filename = `${trip.title.replace(/[^a-zA-Z0-9]/g, '_')}_itinerario.csv`;
    downloadCsv(csv, filename);
    toast.success('CSV exportado!', { description: `${totalDays} dia${totalDays !== 1 ? 's' : ''} exportado${totalDays !== 1 ? 's' : ''}.` });
  }

  function handleShareWhatsApp() {
    const url = `${window.location.origin}/dashboard/trips/${trip.id}`;
    const text = buildTextSummary(trip);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n\n🔗 ${url}`)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    toast.success('WhatsApp aberto!');
  }

  function handleShareEmail() {
    const url = `${window.location.origin}/dashboard/trips/${trip.id}`;
    const subject = encodeURIComponent(`Planejamento de viagem: ${trip.title}`);
    const dateRange = trip.startDate
      ? `\n📅 ${format(new Date(trip.startDate), "d 'de' MMMM", { locale: ptBR })}${trip.endDate ? ` a ${format(new Date(trip.endDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}` : ''}`
      : '';
    const body = encodeURIComponent(
      `Olá! Estou planejando uma viagem para ${trip.destination} e quero compartilhar o roteiro com você.${dateRange}\n\n🔗 Acesse o planejamento completo:\n${url}\n\n---\n${buildTextSummary(trip)}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast.success('E-mail preparado!');
  }

  function handleExportPdf() {
    setLoadingPdf(true);
    try {
      const html = buildPrintableHtml(trip);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (!printWindow) {
        toast.error('Pop-up bloqueado. Permita pop-ups para exportar PDF.');
        setLoadingPdf(false);
        return;
      }
      printWindow.onload = () => {
        printWindow.print();
        URL.revokeObjectURL(url);
        toast.success('Janela de impressão aberta!', {
          description: 'Selecione "Salvar como PDF" na impressora.',
        });
      };
    } catch {
      toast.error('Erro ao gerar PDF.');
    } finally {
      setLoadingPdf(false);
    }
  }

  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
        className="w-full sm:max-w-md bg-card border border-border rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90dvh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Share2 className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Compartilhar viagem</h3>
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[220px]">{trip.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-90 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Trip stats summary */}
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { icon: MapPin,    value: trip.destination.split(',')[0], label: 'Destino' },
              { icon: Calendar,  value: totalDays > 0 ? `${totalDays}d` : '—',  label: 'Dias' },
              { icon: List,      value: totalItems > 0 ? String(totalItems) : '—', label: 'Atividades' },
              { icon: Wallet,    value: totalExpenses > 0 ? `${totalExpenses}` : '—', label: 'Despesas' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex flex-col items-center gap-1">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-sm font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Options */}
        <div className="overflow-y-auto flex-1 p-5 space-y-2.5">

          {/* ── Compartilhar diretamente ── */}
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 pb-0.5">Compartilhar</p>

          {/* WhatsApp */}
          <OptionCard
            icon={MessageCircle}
            title="WhatsApp"
            description="Envie o roteiro para um contato ou grupo"
            onClick={handleShareWhatsApp}
            color="text-[#25D366] bg-[#25D366]/10"
          />

          {/* Email */}
          <OptionCard
            icon={Mail}
            title="E-mail"
            description="Abra seu cliente de e-mail com o conteúdo pronto"
            onClick={handleShareEmail}
            color="text-blue-500 bg-blue-500/10"
          />

          {/* Copy link */}
          <OptionCard
            icon={copiedLink ? Check : Link2}
            title="Copiar link"
            description="Cole e compartilhe onde preferir"
            onClick={handleCopyLink}
            done={copiedLink}
            color={copiedLink ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-500 bg-slate-500/10'}
          />

          {/* Copy as text */}
          <OptionCard
            icon={copiedText ? Check : Copy}
            title="Copiar resumo em texto"
            description="Ideal para colar no WhatsApp Web, Notion, etc."
            done={copiedText}
            onClick={() => {
              const text = buildTextSummary(trip);
              navigator.clipboard.writeText(text).then(() => {
                setCopiedText(true);
                toast.success('Resumo copiado!');
                setTimeout(() => setCopiedText(false), 3000);
              }).catch(() => {
                toast.error('Não foi possível copiar.');
              });
            }}
            color={copiedText ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'}
          />

          {/* Divider */}
          <div className="pt-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 pb-2">Exportar</p>
          </div>

          {/* PDF */}
          <OptionCard
            icon={FileText}
            title="Exportar PDF"
            description={`Planejamento completo${totalDays > 0 ? ` · ${totalDays} dia${totalDays !== 1 ? 's' : ''}` : ''}${totalExpenses > 0 ? ` · ${totalExpenses} despesa${totalExpenses !== 1 ? 's' : ''}` : ''}`}
            onClick={handleExportPdf}
            loading={loadingPdf}
            color="text-red-500 bg-red-500/10"
          />

          {/* CSV Expenses */}
          <OptionCard
            icon={Table2}
            title="Planilha de despesas (CSV)"
            description={totalExpenses > 0
              ? `${totalExpenses} despesa${totalExpenses !== 1 ? 's' : ''} · Total ${trip.currency} ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              : 'Nenhuma despesa registrada'
            }
            onClick={handleExportExpensesCsv}
            color="text-emerald-500 bg-emerald-500/10"
          />

          {/* CSV Itinerary */}
          <OptionCard
            icon={Download}
            title="Itinerário completo (CSV)"
            description={totalDays > 0
              ? `${totalDays} dia${totalDays !== 1 ? 's' : ''} · ${totalItems} atividade${totalItems !== 1 ? 's' : ''}`
              : 'Nenhum itinerário planejado'
            }
            onClick={handleExportItineraryCsv}
            color="text-violet-500 bg-violet-500/10"
          />
        </div>
      </motion.div>
    </motion.div>
  );

  if (!portalRoot) return null;
  return createPortal(modal, portalRoot);
}

/* ── Text summary builder ───────────────────────────────────────────────────── */

function buildTextSummary(trip: TripDetail): string {
  const lines: string[] = [];
  lines.push(`✈️ ${trip.title}`);
  lines.push(`📍 ${trip.destination}`);
  if (trip.startDate) {
    const start = format(new Date(trip.startDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    lines.push(`📅 ${start}${trip.endDate ? ` → ${format(new Date(trip.endDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}` : ''}`);
  }
  if (trip.description) lines.push(`\n${trip.description}`);

  if (trip.itineraryDays.length > 0) {
    lines.push('\n🗓 ITINERÁRIO');
    for (const day of trip.itineraryDays) {
      lines.push(`\nDia ${day.dayNumber} — ${day.title ?? format(new Date(day.date), "EEEE, d MMM", { locale: ptBR })}`);
      for (const item of day.items) {
        const time = item.startTime ? `${item.startTime} ` : '';
        lines.push(`  ${time}• ${item.title}${item.location ? ` (${item.location})` : ''}`);
      }
    }
  }

  if (trip.expenses.length > 0) {
    const total = Number(trip.totalSpent);
    lines.push(`\n💸 DESPESAS — Total: ${trip.currency} ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    for (const e of trip.expenses.slice(0, 10)) {
      lines.push(`  • ${e.title}: ${e.currency} ${Number(e.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    }
    if (trip.expenses.length > 10) lines.push(`  ... e mais ${trip.expenses.length - 10} despesas`);
  }

  lines.push('\n—\nGerado por TRPY');
  return lines.join('\n');
}
