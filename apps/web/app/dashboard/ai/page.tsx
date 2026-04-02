'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, MapPin, Calendar, Loader2,
  Clock, Utensils, Landmark, Hotel, Bus, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActivityCard } from '@/components/cards/activity-card';
import { cn } from '@/lib/utils';

const SUGGESTIONS = [
  { label: '7 dias em Lisboa', sub: 'Gastronomia e cultura' },
  { label: '10 dias em Bali', sub: 'Praias e templos' },
  { label: 'Fim de semana em Buenos Aires', sub: 'Tango e gastronomia' },
  { label: '14 dias na Patagônia', sub: 'Aventura e natureza' },
  { label: '5 dias em Amsterdã', sub: 'Museus e canais' },
  { label: '10 dias no Japão', sub: 'Cultura e tecnologia' },
];

interface GeneratedActivity {
  title: string;
  type: string;
  time?: string;
  duration?: number;
  location?: string;
  cost?: number;
  description?: string;
}

interface GeneratedDay {
  day: number;
  theme: string;
  activities: GeneratedActivity[];
}

const MOCK_RESULT: GeneratedDay[] = [
  {
    day: 1,
    theme: 'Chegada e bairro histórico',
    activities: [
      { title: 'Check-in no hotel boutique', type: 'HOTEL', time: '14:00', location: 'Centro histórico', cost: 380 },
      { title: 'Passeio pelo bairro histórico', type: 'ACTIVITY', time: '16:00', duration: 120, location: 'Alfama', cost: 0 },
      { title: 'Jantar com vista panorâmica', type: 'RESTAURANT', time: '20:00', location: 'Portas do Sol', cost: 65, description: 'Culinária portuguesa tradicional' },
    ],
  },
  {
    day: 2,
    theme: 'Cultura e gastronomia',
    activities: [
      { title: 'Museu Nacional de Arte Antiga', type: 'ACTIVITY', time: '09:30', duration: 150, location: 'Janelas Verdes', cost: 12 },
      { title: 'Almoço no Mercado da Ribeira', type: 'RESTAURANT', time: '13:00', location: 'Cais do Sodré', cost: 30 },
      { title: 'Passeio de tuk-tuk', type: 'TRANSPORT', time: '15:30', duration: 90, location: 'Centro', cost: 25 },
      { title: 'Fado ao vivo', type: 'ACTIVITY', time: '21:00', duration: 120, location: 'Bairro Alto', cost: 45, description: 'Show com jantar incluído' },
    ],
  },
  {
    day: 3,
    theme: 'Belém e arredores',
    activities: [
      { title: 'Torre de Belém', type: 'ACTIVITY', time: '09:00', duration: 60, location: 'Belém', cost: 8 },
      { title: 'Pastéis de Belém', type: 'RESTAURANT', time: '10:30', location: 'Belém', cost: 10, description: 'A original desde 1837' },
      { title: 'Mosteiro dos Jerônimos', type: 'ACTIVITY', time: '11:30', duration: 90, location: 'Belém', cost: 10 },
    ],
  },
];

export default function AIPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedDay[] | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  async function handleGenerate(customPrompt?: string) {
    const text = customPrompt ?? prompt;
    if (!text.trim()) return;
    if (customPrompt) setPrompt(customPrompt);

    setIsGenerating(true);
    setResult(null);
    setExpandedDay(0);

    await new Promise((r) => setTimeout(r, 2000));
    setResult(MOCK_RESULT);
    setIsGenerating(false);
  }

  const totalCost = result?.flatMap(d => d.activities).reduce((s, a) => s + (a.cost ?? 0), 0) ?? 0;
  const totalActivities = result?.flatMap(d => d.activities).length ?? 0;

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 glow-indigo animate-pulse-glow mx-auto"
        >
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>
        <div>
          <h1 className="text-2xl font-medium text-foreground tracking-tight">Planejar com IA</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
            Descreva sua viagem ideal e a IA cria um itinerário completo, com atividades, restaurantes e dicas.
          </p>
        </div>
      </motion.div>

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-5 shadow-card"
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: 7 dias em Lisboa, Portugal — interesse em gastronomia, cultura e história. Orçamento médio de R$ 8.000..."
          rows={3}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 resize-none outline-none leading-relaxed"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
          }}
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Datas</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Destino</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Duração</span>
          </div>
          <button
            onClick={() => handleGenerate()}
            disabled={!prompt.trim() || isGenerating}
            className="inline-flex items-center gap-2 bg-foreground text-background text-xs font-medium px-4 py-2 rounded-full hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            {isGenerating ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Gerando...</>
            ) : (
              <><Send className="w-3.5 h-3.5" /> Gerar</>
            )}
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
            </span>
          </button>
        </div>
      </motion.div>

      {/* Suggestion pills */}
      {!result && !isGenerating && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Experimente</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, i) => (
              <motion.button
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleGenerate(s.label + ' — ' + s.sub)}
                className="text-xs px-3 py-2 rounded-full border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground text-left"
              >
                <span className="font-medium text-foreground">{s.label}</span>
                <span className="text-muted-foreground"> · {s.sub}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex flex-col items-center gap-5 py-12"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl border-2 border-primary"
              />
            </div>
            <div className="text-center space-y-1">
              <p className="font-medium text-foreground">Criando seu itinerário...</p>
              <p className="text-sm text-muted-foreground">Analisando destino e personalizando cada detalhe</p>
            </div>
            <div className="flex gap-1.5">
              {[0, 0.2, 0.4].map((delay, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay }}
                  className="w-2 h-2 rounded-full bg-primary"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Summary bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4 bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3"
            >
              <Sparkles className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 flex flex-wrap gap-x-4 gap-y-0.5">
                <span className="text-sm font-medium text-foreground">{result.length} dias</span>
                <span className="text-sm text-muted-foreground">{totalActivities} atividades</span>
                <span className="text-sm text-muted-foreground">
                  ~R$ {totalCost.toLocaleString('pt-BR')} estimado
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs shrink-0"
                onClick={() => { setResult(null); setPrompt(''); }}
              >
                Refazer
              </Button>
            </motion.div>

            {/* Days accordion */}
            {result.map((day, di) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: di * 0.1 }}
                className="rounded-2xl border border-border bg-card overflow-hidden shadow-card"
              >
                <button
                  onClick={() => setExpandedDay(expandedDay === di ? null : di)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center text-background font-medium text-sm shrink-0">
                    {day.day}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">Dia {day.day}</p>
                    <p className="text-xs text-muted-foreground">{day.theme}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{day.activities.length} atividades</span>
                    <motion.div
                      animate={{ rotate: expandedDay === di ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sparkles className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {expandedDay === di && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
                        {day.activities.map((act, ai) => (
                          <ActivityCard
                            key={ai}
                            title={act.title}
                            type={act.type}
                            time={act.time}
                            location={act.location}
                            cost={act.cost}
                            currency="R$"
                            description={act.description}
                            index={ai}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center space-y-3"
            >
              <p className="text-sm font-medium text-foreground">Gostou do itinerário?</p>
              <p className="text-xs text-muted-foreground">
                A integração com Claude API está chegando — em breve você poderá salvar diretamente na sua viagem!
              </p>
              <button
                onClick={() => window.location.href = '/dashboard/trips/new'}
                className="inline-flex items-center gap-2 bg-foreground text-background text-sm font-medium px-6 py-3 rounded-full hover:opacity-90 transition-all group relative overflow-hidden"
              >
                <span className="relative z-10">Criar viagem manualmente</span>
                <span className="absolute inset-0 overflow-hidden rounded-full">
                  <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
                </span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
