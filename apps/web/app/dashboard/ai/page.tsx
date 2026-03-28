'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, MapPin, Calendar, Loader2, Clock, Utensils, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SUGGESTIONS = [
  '7 dias em Lisboa, foco em gastronomia e cultura',
  '10 dias em Bali, praias e templos',
  'Fim de semana em Buenos Aires',
  '14 dias na Patagônia, aventura e natureza',
];

const TYPE_ICON: Record<string, React.ElementType> = {
  ACCOMMODATION: MapPin,
  FOOD: Utensils,
  TRANSPORT: Loader2,
  ACTIVITIES: Landmark,
  OTHER: Clock,
};

export default function AIPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<null | { days: { day: number; activities: string[] }[] }>(null);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResult(null);

    // Simulated response — replace with real Claude API call
    await new Promise((r) => setTimeout(r, 1800));
    setResult({
      days: [
        { day: 1, activities: ['Chegada e check-in', 'Passeio pela cidade histórica', 'Jantar local'] },
        { day: 2, activities: ['Museu Nacional', 'Almoço no mercado', 'Vista panorâmica ao entardecer'] },
        { day: 3, activities: ['Excursão ao litoral', 'Praia e relaxamento', 'Restaurante beira-mar'] },
      ],
    });
    setIsGenerating(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-ocean glow-teal animate-pulse-glow mx-auto">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Assistente de Viagens IA</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Descreva seu destino ideal e a IA criará um itinerário personalizado para você.
          </p>
        </div>
      </motion.div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-3xl p-4 shadow-card"
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: 7 dias em Lisboa, foco em gastronomia e cultura local, orçamento médio..."
          rows={3}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
          }}
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">⌘ + Enter para gerar</span>
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="gap-2 bg-ocean hover:opacity-90 border-0 glow-teal"
            size="sm"
          >
            {isGenerating ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Gerando...</>
            ) : (
              <><Send className="w-3.5 h-3.5" /> Gerar itinerário</>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Suggestions */}
      {!result && !isGenerating && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sugestões</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <motion.button
                key={s}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setPrompt(s)}
                className="text-xs px-3 py-2 rounded-full border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
              >
                {s}
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
            className="flex flex-col items-center gap-4 py-10"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-3xl bg-ocean/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-3xl border-2 border-primary/30 animate-ping" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground text-sm">Criando seu itinerário...</p>
              <p className="text-xs text-muted-foreground mt-1">A IA está personalizando cada detalhe</p>
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
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-foreground">Itinerário gerado</p>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => { setResult(null); setPrompt(''); }}
              >
                Novo itinerário
              </Button>
            </div>

            {result.days.map((day, i) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-3xl p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-2xl bg-ocean flex items-center justify-center text-white text-sm font-bold">
                    {day.day}
                  </div>
                  <p className="font-semibold text-foreground text-sm">Dia {day.day}</p>
                </div>
                <div className="space-y-2.5">
                  {day.activities.map((activity, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <p className="text-sm text-muted-foreground">{activity}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-4 text-center">
              <p className="text-xs text-muted-foreground">
                Integração com Claude API em desenvolvimento. Em breve você poderá salvar este itinerário diretamente na sua viagem! 🚀
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
