'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Share2, Link2, Check, Copy, MapPin,
  Mail, MessageCircle, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/* ── Option Card ─────────────────────────────────────────────────────────────── */

interface OptionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  done?: boolean;
  color?: string;
}

function OptionCard({ icon: Icon, title, description, onClick, done, color = 'text-primary bg-primary/10' }: OptionCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all text-left"
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', color)}>
        {done ? <Check className="w-5 h-5 text-emerald-500" /> : <Icon className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </motion.button>
  );
}

/* ── Main Modal ─────────────────────────────────────────────────────────────── */

interface DestinationShareModalProps {
  destination: string;
  slug: string;
  coverImage?: string | null;
  onClose: () => void;
}

export function DestinationShareModal({ destination, slug, coverImage, onClose }: DestinationShareModalProps) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  const pageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/dashboard/destinations/${slug}`
    : `/dashboard/destinations/${slug}`;

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopiedLink(true);
      toast.success('Link copiado!', { description: 'Cole e compartilhe com quem quiser.' });
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      toast.error('Não foi possível copiar o link.');
    }
  }

  function handleShareWhatsApp() {
    const text = `🌍 *${destination}*\n\nConfira tudo sobre esse destino no TRPY:`;
    const url = `https://wa.me/?text=${encodeURIComponent(`${text}\n${pageUrl}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    toast.success('WhatsApp aberto!');
  }

  function handleShareEmail() {
    const subject = encodeURIComponent(`Destino incrível: ${destination}`);
    const body = encodeURIComponent(
      `Oi! Encontrei esse destino no TRPY e acho que você vai adorar.\n\n📍 ${destination}\n\n🔗 Confira aqui:\n${pageUrl}\n\n---\nVia TRPY · trpy.app`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast.success('E-mail preparado!');
  }

  function handleCopyText() {
    const text = `🌍 ${destination}\n\nConheça mais sobre esse destino:\n${pageUrl}\n\n— Via TRPY`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(true);
      toast.success('Texto copiado!');
      setTimeout(() => setCopiedText(false), 3000);
    }).catch(() => toast.error('Não foi possível copiar.'));
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
              <Share2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Compartilhar destino</h3>
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[220px]">{destination}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-90 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Destination summary */}
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            {coverImage ? (
              <img src={coverImage} alt={destination} className="w-14 h-14 rounded-2xl object-cover shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-indigo-500" />
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-foreground">{destination}</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate max-w-[220px]">
                {pageUrl.replace('https://', '').replace('http://', '')}
              </p>
            </div>
          </div>
        </div>

        {/* URL preview bar */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-xl px-3 py-2">
            <p className="text-xs text-muted-foreground truncate flex-1 font-mono">{pageUrl}</p>
            <button
              onClick={handleCopyLink}
              title="Copiar link"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-background transition-colors shrink-0"
            >
              {copiedLink
                ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                : <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              }
            </button>
            <a
              href={pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir em nova aba"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-background transition-colors shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </a>
          </div>
        </div>

        {/* Options */}
        <div className="overflow-y-auto flex-1 p-5 space-y-2.5">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 pb-0.5">Compartilhar</p>

          <OptionCard
            icon={MessageCircle}
            title="WhatsApp"
            description="Envie o link do destino para um contato ou grupo"
            onClick={handleShareWhatsApp}
            color="text-[#25D366] bg-[#25D366]/10"
          />

          <OptionCard
            icon={Mail}
            title="E-mail"
            description="Compartilhe por e-mail"
            onClick={handleShareEmail}
            color="text-blue-500 bg-blue-500/10"
          />

          <OptionCard
            icon={copiedLink ? Check : Link2}
            title="Copiar link"
            description="Copie o link da página deste destino"
            onClick={handleCopyLink}
            done={copiedLink}
            color={copiedLink ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-500 bg-slate-500/10'}
          />

          <OptionCard
            icon={copiedText ? Check : Copy}
            title="Copiar como texto"
            description="Ideal para colar no Notion, WhatsApp, etc."
            onClick={handleCopyText}
            done={copiedText}
            color={copiedText ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'}
          />
        </div>
      </motion.div>
    </motion.div>
  );

  if (!portalRoot) return null;
  return createPortal(modal, portalRoot);
}
