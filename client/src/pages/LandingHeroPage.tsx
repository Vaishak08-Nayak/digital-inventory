import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Terminal,
  Download,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  Boxes,
  ShoppingCart,
  Apple,
  Search,
  ExternalLink,
  ChevronRight,
  Cpu,
  Database,
  Store,
} from 'lucide-react';
import { CommandPalette } from '../components/CommandPalette';

export const LandingHeroPage: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const installCommand = 'curl -sSL https://get.kirana.sh | sh';

  const handleCopy = () => {
    navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="aurora-canvas min-h-screen text-slate-100 selection:bg-rose-500/30 selection:text-white flex flex-col justify-between">
      {/* Pure CSS Living Animated Aurora Background Light Blades */}
      <div className="aurora-blades-wrapper">
        <div className="aurora-blade-crimson" />
        <div className="aurora-blade-coral" />
        <div className="aurora-blade-amber" />
        <div className="aurora-blade-ember" />
      </div>

      {/* Pure SVG Fractal Noise Grain Texture Overlay (No JS needed) */}
      <div className="svg-grain-overlay" />

      {/* Global Interactive Command Palette */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />

      {/* Top Floating Translucent Pill Nav */}
      <header className="relative z-20 pt-6 px-4 flex justify-center">
        <nav className="glass-pill-nav w-full max-w-4xl px-4 py-2.5 rounded-full flex items-center justify-between shadow-2xl">
          {/* Brand Logo with warm ember glow */}
          <Link to="/" className="flex items-center gap-2.5 pl-1.5 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-[0_0_16px_rgba(244,63,94,0.6)] group-hover:scale-105 transition-transform">
              <Store className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold tracking-tight text-white text-base">KIRANA</span>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                CORE v2.4
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hover:text-rose-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-rose-500" />
              <span>Launcher</span>
              <span className="keycap-badge text-[9px] py-0 px-1">⌘K</span>
            </button>
            <Link to="/inventory" className="hover:text-rose-400 transition-colors">
              Inventory Ledger
            </Link>
            <Link to="/orders" className="hover:text-rose-400 transition-colors">
              POS Terminal
            </Link>
            <Link to="/reports" className="hover:text-rose-400 transition-colors">
              Analytics
            </Link>
          </div>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="keycap-btn-primary text-xs py-2 px-3.5 rounded-full flex items-center gap-1.5 shadow-[0_4px_16px_rgba(244,63,94,0.4)]"
            >
              Launch Console
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section Container */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 pt-16 pb-20 text-center flex-1 flex flex-col items-center justify-center">
        {/* Subtle Live Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141a27]/90 border border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)] mb-7 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-rose-500 -ml-4" />
          <span className="text-xs font-mono font-medium text-slate-300">
            Real-time Sub-Second POS & Kirana Engine • Active
          </span>
          <span className="text-xs text-rose-400 font-bold">100% Offline-Ready</span>
        </div>

        {/* Big Two-Line Inter Headline with Warm Gradient Accent Word */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08] max-w-4xl">
          Next-Gen Developer-Grade <br />
          Retail & Inventory{' '}
          <span className="text-warm-gradient">Engine.</span>
        </h1>

        {/* 18px Subtitle */}
        <p className="mt-6 text-[18px] leading-relaxed text-slate-400 max-w-2xl font-normal">
          Sub-second POS checkout, offline-first barcode intelligence, and real-time inventory
          ledger tailored for Karnataka Kirana & high-velocity retail stores.
        </p>

        {/* Two Tactile Keycap-Raised OS Download Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          {/* macOS Download Keycap */}
          <button
            onClick={() => navigate('/dashboard')}
            className="keycap-btn-raised w-full sm:w-auto group cursor-pointer"
          >
            <Apple className="w-5 h-5 text-slate-200 group-hover:text-rose-400 transition-colors" />
            <div className="text-left">
              <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                <span>Download for macOS</span>
                <span className="keycap-badge text-[9px] py-0 px-1">Universal</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Apple Silicon & Intel DMG</div>
            </div>
          </button>

          {/* Windows Download Keycap */}
          <button
            onClick={() => navigate('/dashboard')}
            className="keycap-btn-raised w-full sm:w-auto group cursor-pointer"
          >
            <div className="w-4 h-4 grid grid-cols-2 gap-0.5 text-slate-200 group-hover:text-amber-400 transition-colors">
              <div className="bg-current rounded-[1px]" />
              <div className="bg-current rounded-[1px]" />
              <div className="bg-current rounded-[1px]" />
              <div className="bg-current rounded-[1px]" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                <span>Download for Windows</span>
                <span className="keycap-badge text-[9px] py-0 px-1">x64 / ARM</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">MSI Installer & POS Kiosk</div>
            </div>
          </button>
        </div>

        {/* GeistMono Install Caption */}
        <div className="mt-5 flex items-center justify-center">
          <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-[#0d111a]/85 border border-slate-800/90 shadow-inner backdrop-blur-md">
            <span className="text-rose-500 font-mono text-xs select-none">$</span>
            <code className="font-mono text-xs text-slate-300 font-medium tracking-wide">
              {installCommand}
            </code>
            <button
              onClick={handleCopy}
              title="Copy to clipboard"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Glassy Command-Bar / Launcher Mockup */}
        <div
          onClick={() => setCommandPaletteOpen(true)}
          className="mt-12 w-full max-w-3xl glass-launcher-mockup text-left overflow-hidden cursor-pointer group hover:border-rose-500/50 transition-all duration-300"
        >
          {/* Launcher Titlebar & Input Query */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-[#090d16]/90 border-b border-rose-500/20">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
              <span className="text-xs font-mono text-rose-500 font-bold">&gt;</span>
              <span className="text-xs sm:text-sm font-mono text-slate-200">
                stock intake "Karnataka Sona Masoori (25kg)" --qty 40 --supplier "APMC"
              </span>
              <span className="w-2 h-4 bg-rose-500 animate-pulse ml-0.5 inline-block" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="keycap-badge text-[10px]">⌘K</span>
              <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">to search</span>
            </div>
          </div>

          {/* Launcher Result Rows */}
          <div className="p-2 space-y-1 bg-[#0b0f19]/80">
            {/* Active Result Row with Warm Coral Glow Highlight */}
            <div className="active-launcher-row p-3 rounded-xl flex items-center justify-between transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  🌾
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white">
                      Karnataka Sona Masoori Rice (25kg)
                    </span>
                    <span className="text-xs text-rose-400 font-medium">ಸೋನಾ ಮಸೂರಿ</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                      IN STOCK [36 BAGS]
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    Barcode: 8901030384012 • Category: Staples & Grains • Supplier: Kaveri Agro
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black font-mono text-amber-400">₹1,480.00</span>
                <span className="keycap-badge text-[10px] hidden sm:inline-flex">↵ Select</span>
              </div>
            </div>

            {/* Second Mock Row */}
            <div className="p-3 rounded-xl flex items-center justify-between text-slate-300 hover:bg-white/5 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#141b29] flex items-center justify-center text-slate-300 text-xs">
                  🧈
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-slate-200">
                      Pure Nandini Ghee 1 Litre Tin
                    </span>
                    <span className="text-xs text-slate-400">ನಂದಿನಿ ತುಪ್ಪ</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                    Barcode: 8906036670014 • Dairy & Oils • Stock: 24 Litres
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold font-mono text-slate-300">₹620.00</span>
              </div>
            </div>

            {/* Third Mock Row */}
            <div className="p-3 rounded-xl flex items-center justify-between text-slate-300 hover:bg-white/5 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#141b29] flex items-center justify-center text-slate-300 text-xs">
                  ☕
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-slate-200">
                      Chikmagalur Filter Coffee Blend (80:20) 500g
                    </span>
                    <span className="text-xs text-slate-400">ಫಿಲ್ಟರ್ ಕಾಫಿ</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                    Barcode: 8901058001021 • Roasted Coffee • Stock: 22 Pkts
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold font-mono text-slate-300">₹240.00</span>
              </div>
            </div>
          </div>

          {/* Launcher Footer Keyboard Shortcuts */}
          <div className="px-4 py-2 border-t border-slate-800/80 bg-[#080b12] flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <div className="flex items-center gap-3">
              <span>
                <span className="keycap-badge mr-1">↑↓</span>Select
              </span>
              <span>
                <span className="keycap-badge mr-1">↵</span>Intake Stock
              </span>
              <span>
                <span className="keycap-badge mr-1">Tab</span>Complete
              </span>
            </div>
            <div className="flex items-center gap-2 text-rose-400/90 font-semibold">
              <span>Interactive Mockup • Click to Launch Live</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-4xl text-left">
          <div className="glass-panel-dark p-5 card-3d-hover">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Sub-Second POS Speed</h3>
            <p className="text-xs text-slate-400 mt-1">
              Engineered with zero latency. Scan barcodes, generate digital bills, and print thermal receipts in under 12ms.
            </p>
          </div>

          <div className="glass-panel-dark p-5 card-3d-hover">
            <div className="w-9 h-9 rounded-xl bg-coral-500/10 text-amber-500 flex items-center justify-center mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Cryptographic Stock Ledger</h3>
            <p className="text-xs text-slate-400 mt-1">
              Every grain and packet is logged across immutable transactions (STOCK_IN, SALE, RETURN, ADJUSTMENT).
            </p>
          </div>

          <div className="glass-panel-dark p-5 card-3d-hover">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-rose-400 flex items-center justify-center mb-3">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Bilingual Kannada UI</h3>
            <p className="text-xs text-slate-400 mt-1">
              Localized with authentic Kannada typography and category taxonomy for provision stores across Karnataka.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900/80 py-6 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>KIRANA CORE // Digital Inventory & Sales Management System</span>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-rose-400 transition-colors">
              Store Login
            </Link>
            <Link to="/register-owner" className="hover:text-rose-400 transition-colors">
              Register Shop
            </Link>
            <Link to="/dashboard" className="text-rose-400 font-bold hover:underline">
              Enter App &rarr;
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingHeroPage;

