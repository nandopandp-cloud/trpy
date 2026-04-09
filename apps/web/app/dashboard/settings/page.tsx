'use client';

import { motion } from 'framer-motion';
import { User, Bell, Palette, Globe, ShieldCheck, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { UserAvatar } from '@/components/user/user-avatar';
import { cn } from '@/lib/utils';

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { ease: [0.4, 0, 0.2, 1] } } },
};

const SECTIONS = [
  {
    title: 'Conta',
    items: [
      { icon: User, label: 'Perfil', desc: 'Nome, foto e informações pessoais', soon: true },
      { icon: ShieldCheck, label: 'Segurança', desc: 'Senha e autenticação em dois fatores', soon: true },
    ],
  },
  {
    title: 'Preferências',
    items: [
      { icon: Bell, label: 'Notificações', desc: 'Alertas e lembretes de viagem', soon: true },
      { icon: Globe, label: 'Idioma e região', desc: 'Português (BR) · R$ Real', soon: true },
    ],
  },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Personalize sua experiência no Trpy</p>
      </motion.div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-3xl border border-border bg-card p-5 shadow-card"
      >
        <div className="flex items-center gap-4">
          <UserAvatar name={user?.name} email={user?.email} image={user?.image} size="xl" className="rounded-2xl ring-primary/20" />
          <div>
            <p className="font-bold text-foreground">{user?.name ?? 'Usuário'}</p>
            <p className="text-sm text-muted-foreground">{user?.email ?? ''}</p>
          </div>
        </div>
      </motion.div>

      {/* Aparência */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl border border-border bg-card overflow-hidden shadow-card"
      >
        <div className="px-5 py-4 border-b border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aparência</p>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-muted flex items-center justify-center">
              <Palette className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Tema</p>
              <p className="text-xs text-muted-foreground">Clique para alternar</p>
            </div>
          </div>
          <ThemeToggle showLabel />
        </div>
      </motion.div>

      {/* Other sections */}
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {SECTIONS.map((section) => (
          <motion.div
            key={section.title}
            variants={stagger.item}
            className="rounded-3xl border border-border bg-card overflow-hidden shadow-card"
          >
            <div className="px-5 py-4 border-b border-border">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{section.title}</p>
            </div>
            {section.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={cn(
                    'px-5 py-4 flex items-center justify-between',
                    i < section.items.length - 1 && 'border-b border-border'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-muted flex items-center justify-center">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  {item.soon && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      em breve
                    </span>
                  )}
                </div>
              );
            })}
          </motion.div>
        ))}
      </motion.div>

      {/* Danger zone */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-3xl border border-border bg-card overflow-hidden shadow-card"
      >
        <div className="px-5 py-4 border-b border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sessão</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full px-5 py-4 flex items-center gap-3 text-destructive hover:bg-destructive/5 transition-colors"
        >
          <div className="w-9 h-9 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold">Sair da conta</span>
        </button>
      </motion.div>

      <p className="text-center text-xs text-muted-foreground pb-2">
        Trpy v0.1.0 · Feito com ❤️ no Brasil
      </p>
    </div>
  );
}
