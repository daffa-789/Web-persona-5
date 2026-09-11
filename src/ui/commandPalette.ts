/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - METAVERSE COMMAND PALETTE (/ QUICK LAUNCHER)
 * File: src/ui/commandPalette.ts
 *
 * Implements an authentic Persona 5 slanted command palette:
 *  - Triggered by typing '/', pressing Ctrl+K, or clicking #btn-command-palette
 *  - Instantly executes all Phantom Thief slash systems:
 *      /schedule, /browser, /grill-me, /teamwork-preview, /learn, /boost,
 *      /dossier, /skills, /heists, /confidants, /calling-card, /aoa, /help
 *  - Real-time search filtering & keyboard navigation (ArrowUp, ArrowDown, Enter, ESC)
 *  - Seamlessly integrates with the audio engine and navigation controller
 * ==========================================================================
 */

import { p5rAudio } from '../audio/p5rAudio';

export interface CommandItem {
  id: string;
  command: string;
  aliases?: string[];
  label: string;
  desc: string;
  icon: string;
  badge?: string;
  action: () => void;
}

export interface CommandPaletteController {
  init(): void;
  open(): void;
  close(): void;
  isOpen(): boolean;
  registerCommand(cmd: CommandItem): void;
}

class CommandPaletteControllerImpl implements CommandPaletteController {
  private overlayEl: HTMLElement | null = null;
  private inputEl: HTMLInputElement | null = null;
  private listEl: HTMLElement | null = null;
  private isPaletteOpen: boolean = false;
  private commands: CommandItem[] = [];
  private filteredCommands: CommandItem[] = [];
  private selectedIndex: number = 0;

  public init(): void {
    if (typeof document === 'undefined') return;
    this.createDom();
    this.bindEvents();
  }

  public registerCommand(cmd: CommandItem): void {
    const existing = this.commands.findIndex(c => c.id === cmd.id);
    if (existing >= 0) {
      this.commands[existing] = cmd;
    } else {
      this.commands.push(cmd);
    }
  }

  private createDom(): void {
    if (document.getElementById('p5-command-palette-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'p5-command-palette-modal';
    overlay.className = 'p5-modal-backdrop hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'cmd-palette-title');

    overlay.innerHTML = `
      <div class="p5-manual-card p5-cmd-palette-card p5-card-frame">
        <div class="manual-header pb-2 mb-2 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <div class="section-tag"><span>METAVERSE NAVIGATOR // TERMINAL</span></div>
            <h2 class="manual-title text-xl" id="cmd-palette-title">
              PHANTOM THIEVES COMMAND PALETTE
            </h2>
          </div>
          <span class="text-xs font-mono text-[#FFDE00] hidden sm:block">
            TYPE A COMMAND OR HIT [ESC]
          </span>
        </div>

        <!-- Command Input Box -->
        <div class="cmd-palette-input-box">
          <span class="cmd-prompt-prefix">&gt;</span>
          <input 
            type="text" 
            id="cmd-palette-input" 
            class="cmd-palette-input" 
            placeholder="Type /schedule, /browser, /grill-me, /boost, /learn..." 
            autocomplete="off" 
            spellcheck="false"
          />
          <button type="button" id="btn-cmd-clear" class="text-xs font-mono text-zinc-500 hover:text-white px-2">✕</button>
        </div>

        <!-- Command Results List -->
        <div class="cmd-palette-list" id="cmd-palette-list" role="listbox">
          <!-- Dynamically populated -->
        </div>

        <!-- Footer -->
        <div class="manual-footer flex justify-between items-center mt-3 pt-2 border-t border-zinc-800">
          <div class="text-[11px] font-mono text-zinc-400">
            [↑/↓] NAVIGATE • [ENTER] EXECUTE • [ESC] DISMISS
          </div>
          <button type="button" class="project-link-btn github-btn py-1 px-3 text-xs" id="btn-close-cmd-palette">
            <span>CLOSE [ESC]</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlayEl = overlay;
    this.inputEl = overlay.querySelector<HTMLInputElement>('#cmd-palette-input');
    this.listEl = overlay.querySelector<HTMLElement>('#cmd-palette-list');
  }

  private bindEvents(): void {
    if (!this.overlayEl || !this.inputEl) return;

    // Close button
    const closeBtn = document.getElementById('btn-close-cmd-palette');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Clear input
    const clearBtn = document.getElementById('btn-cmd-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (this.inputEl) {
          this.inputEl.value = '';
          this.filterCommands('');
          this.inputEl.focus();
        }
      });
    }

    // Backdrop dismiss
    this.overlayEl.addEventListener('click', (e) => {
      if (e.target === this.overlayEl) {
        this.close();
      }
    });

    // Input filtering
    this.inputEl.addEventListener('input', () => {
      this.filterCommands(this.inputEl?.value || '');
    });

    // Keyboard navigation inside input
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        p5rAudio.playMenuNavigate();
        this.selectedIndex = (this.selectedIndex + 1) % Math.max(1, this.filteredCommands.length);
        this.updateSelection();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        p5rAudio.playMenuNavigate();
        this.selectedIndex = (this.selectedIndex - 1 + this.filteredCommands.length) % Math.max(1, this.filteredCommands.length);
        this.updateSelection();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.executeSelected();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
      }
    });

    // Global click listener for palette triggers
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('#btn-command-palette, .btn-command-palette, [data-trigger="palette"]')) {
        e.preventDefault();
        this.open();
      }
    });
  }

  private filterCommands(query: string): void {
    const q = query.trim().toLowerCase().replace(/^\/+/, '');
    if (!q) {
      this.filteredCommands = [...this.commands];
    } else {
      this.filteredCommands = this.commands.filter(c => {
        const cmdName = c.command.toLowerCase().replace(/^\/+/, '');
        const lbl = c.label.toLowerCase();
        const desc = c.desc.toLowerCase();
        const aliasMatch = c.aliases ? c.aliases.some(a => a.toLowerCase().includes(q)) : false;
        return cmdName.includes(q) || lbl.includes(q) || desc.includes(q) || aliasMatch;
      });
    }
    this.selectedIndex = 0;
    this.renderList();
  }

  private renderList(): void {
    if (!this.listEl) return;

    if (this.filteredCommands.length === 0) {
      this.listEl.innerHTML = `
        <div class="cmd-item-empty">
          <span class="text-[#E60012] font-black">NO MATCHING METAVERSE FREQUENCIES FOUND</span>
          <div class="text-[11px] text-zinc-500 mt-1">Try /schedule, /browser, /grill-me, /teamwork-preview, /learn, or /boost</div>
        </div>
      `;
      return;
    }

    this.listEl.innerHTML = this.filteredCommands.map((cmd, i) => `
      <div class="cmd-item cmd-item-row ${i === this.selectedIndex ? 'selected' : ''}" data-idx="${i}" role="option">
        <div class="cmd-icon-col">${cmd.icon}</div>
        <div class="cmd-info-col">
          <div class="flex items-center gap-2">
            <span class="cmd-command-tag">${cmd.command}</span>
            <span class="cmd-label-text">${cmd.label}</span>
            ${cmd.badge ? `<span class="cmd-badge">${cmd.badge}</span>` : ''}
          </div>
          <div class="cmd-desc-text">${cmd.desc}</div>
        </div>
        <div class="cmd-action-key">ENTER ↵</div>
      </div>
    `).join('');

    // Attach click listeners to rows
    const rows = this.listEl.querySelectorAll<HTMLElement>('.cmd-item-row');
    rows.forEach((row) => {
      row.addEventListener('click', () => {
        const idx = parseInt(row.getAttribute('data-idx') || '0', 10);
        this.selectedIndex = idx;
        this.executeSelected();
      });
      row.addEventListener('mouseenter', () => {
        const idx = parseInt(row.getAttribute('data-idx') || '0', 10);
        this.selectedIndex = idx;
        this.updateSelection();
      });
    });
  }

  private updateSelection(): void {
    if (!this.listEl) return;
    const rows = this.listEl.querySelectorAll<HTMLElement>('.cmd-item-row');
    rows.forEach((r, i) => {
      r.classList.toggle('selected', i === this.selectedIndex);
      if (i === this.selectedIndex) {
        r.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  private executeSelected(): void {
    const selected = this.filteredCommands[this.selectedIndex];
    if (selected) {
      p5rAudio.playMenuSelect();
      this.close();
      setTimeout(() => {
        selected.action();
      }, 100);
    }
  }

  public open(): void {
    if (!this.overlayEl) this.createDom();
    if (!this.overlayEl) return;

    p5rAudio.playMenuOpen();
    this.overlayEl.classList.remove('hidden');
    requestAnimationFrame(() => {
      this.overlayEl?.classList.add('visible');
      document.body.classList.add('modal-open');
      this.isPaletteOpen = true;

      if (this.inputEl) {
        this.inputEl.value = '';
        this.filterCommands('');
        this.inputEl.focus();
      }
    });
  }

  public close(): void {
    if (!this.overlayEl || !this.isPaletteOpen) return;

    p5rAudio.playMenuBack();
    this.overlayEl.classList.remove('visible');
    setTimeout(() => {
      this.overlayEl?.classList.add('hidden');
      document.body.classList.remove('modal-open');
      this.isPaletteOpen = false;
    }, 250);
  }

  public isOpen(): boolean {
    return this.isPaletteOpen;
  }
}

export const commandPaletteController: CommandPaletteController = new CommandPaletteControllerImpl();
