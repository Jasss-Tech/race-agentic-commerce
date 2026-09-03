'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Bot,
  Store,
  TrendingUp,
  FileCheck2,
  Activity,
  Sparkles,
  Layers,
  Cpu,
  Sliders,
  Users,
  Search,
  Zap,
  ShoppingCart,
  Bell,
  Sun,
  Moon,
  Monitor,
  Package,
  Menu,
  X
} from 'lucide-react';
import { realtimeBus } from '../lib/realtime';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { CommandPalette } from './CommandPalette';
import { NotificationDrawer } from './NotificationDrawer';
import { CartDrawer } from './CartDrawer';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();
  const { theme, setTheme } = useTheme();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    realtimeBus.startDemoStream();
    const unsub = realtimeBus.subscribe(() => {});
    return () => {
      unsub();
      realtimeBus.stopDemoStream();
    };
  }, []);

  const merchantLinks = [
    { href: '/merchant', label: 'Command Center', icon: Store },
    { href: '/merchant/intelligence', label: 'Intelligence', icon: Users },
    { href: '/merchant/products', label: 'Products', icon: Package },
    { href: '/merchant/customers', label: 'Customers', icon: Users },
    { href: '/merchant/simulation', label: 'What-If Lab', icon: Sliders },
    { href: '/merchant/automations', label: 'Automations', icon: Zap },
    { href: '/merchant/growth', label: 'Growth Hub', icon: TrendingUp },
    { href: '/merchant/agents', label: 'AI Agents', icon: Cpu },
    { href: '/merchant/passport', label: 'Passport', icon: ShieldCheck }
  ];

  const customerLinks = [
    { href: '/buyer', label: 'Store & Copilot', icon: Bot },
    { href: '/buyer/cart', label: 'Cart', icon: ShoppingCart },
    { href: '/buyer/orders', label: 'Orders', icon: Package }
  ];

  const trustLinks = [
    { href: '/proofs', label: 'Proofs', icon: FileCheck2 },
    { href: '/audit', label: 'Audit Log', icon: Activity }
  ];

  const isMerchantActive = pathname.startsWith('/merchant');
  const isCustomerActive = pathname.startsWith('/buyer');

  const primaryLinks = [
    { href: '/merchant', label: 'Merchant Hub', icon: Store, active: isMerchantActive },
    { href: '/merchant/simulation', label: 'What-If Lab', icon: Sliders, active: pathname === '/merchant/simulation' },
    { href: '/merchant/automations', label: 'Automations', icon: Zap, active: pathname === '/merchant/automations' },
    { href: '/buyer', label: 'Customer Store', icon: Bot, active: isCustomerActive },
    { href: '/demo', label: '5 Demos', icon: Sparkles, active: pathname === '/demo' },
    { href: '/proofs', label: 'Proofs', icon: FileCheck2, active: pathname === '/proofs' }
  ];

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-popover/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Brand */}
            <Link href="/" className="group flex shrink-0 items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-105">
                <Layers className="h-5 w-5" />
              </div>
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-lg font-bold tracking-wide text-foreground">RACE</span>
                  <span className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-primary">
                    Decision AI
                  </span>
                </div>
                <span className="hidden text-[10px] font-medium text-muted-foreground sm:block">
                  Bounded autonomy for agentic commerce
                </span>
              </div>
            </Link>

            {/* Desktop primary nav */}
            <nav className="hidden items-center gap-0.5 lg:flex">
              {primaryLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={l.active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors',
                    l.active
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <l.icon className="h-3.5 w-3.5" />
                  <span>{l.label}</span>
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                title="Search command palette (⌘K)"
                className="relative h-9 w-auto gap-1.5 px-2 font-mono text-[10px] text-muted-foreground"
              >
                <Search className="h-4 w-4" />
                <span className="hidden md:inline">⌘K</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsNotifOpen(true)}
                title="Intelligence stream & alerts"
                className="relative"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-signal-telemetry animate-pulse" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsCartOpen(true)}
                title="Open shopping cart"
                className="relative border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
              >
                <ShoppingCart className="h-4 w-4" />
                {itemCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 font-mono text-[9px] font-bold text-primary-foreground">
                    {itemCount}
                  </span>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" title="Toggle theme">
                    <ThemeIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem onClick={() => setTheme('dark')} className={theme === 'dark' ? 'bg-accent' : ''}>
                    <Moon className="h-3.5 w-3.5" /> Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('light')} className={theme === 'light' ? 'bg-accent' : ''}>
                    <Sun className="h-3.5 w-3.5" /> Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')} className={theme === 'system' ? 'bg-accent' : ''}>
                    <Monitor className="h-3.5 w-3.5" /> System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                title="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {isMobileMenuOpen && (
          <div className="animate-slideDown space-y-4 border-t border-border bg-popover/95 p-4 backdrop-blur-xl lg:hidden">
            <div>
              <div className="px-2 pb-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Merchant Tools
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {merchantLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="flex items-center gap-2 rounded-md bg-muted/60 p-2 text-muted-foreground transition-colors hover:bg-primary/15 hover:text-primary"
                  >
                    <l.icon className="h-3.5 w-3.5 text-primary" />
                    <span>{l.label}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div className="px-2 pb-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Customer & Trust
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {customerLinks.concat(trustLinks).map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="flex items-center gap-2 rounded-md bg-muted/60 p-2 text-muted-foreground transition-colors hover:bg-signal-telemetry/15 hover:text-signal-telemetry"
                  >
                    <l.icon className="h-3.5 w-3.5 text-signal-telemetry" />
                    <span>{l.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <CartDrawer />
    </>
  );
}
