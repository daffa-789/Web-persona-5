/**
 * ==========================================================================
 * PERSONA 5 ROYAL (P5R) - COMBAT PARAMETERS RADAR & AFFINITIES
 * File: src/ui/skills.ts
 *
 * Renders 5-Axis Game Dev Persona Radar Chart (ST, MA, EN, AG, LU):
 *  - Trigonometric coordinate mapping (Math.cos / Math.sin) for 5 pentagon vertices
 *  - Valid SVG polygon points generation without NaN values
 *  - Scalable viewBox container with crimson glow filter
 *  - Interactive parameter tooltips & descriptions on hover
 * ==========================================================================
 */

import { PORTFOLIO_CONFIG, RadarStat } from '../config/portfolio';

export interface Point2D {
  x: number;
  y: number;
}

export class SkillsController {
  private container: HTMLElement | null = null;
  private readonly size: number = 320;
  private readonly radius: number = 100;

  constructor() {
    this.init();
  }

  public init(): void {
    if (typeof document === 'undefined') return;
    this.container = document.getElementById('radar-chart-container');
    this.renderRadar();
  }

  public calculateVertex(center: number, radius: number, angle: number): Point2D {
    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
    };
  }

  public generatePolygonPoints(stats: RadarStat[], center: number, maxRadius: number): string {
    const count = stats.length || 5;
    const angleStep = (Math.PI * 2) / count;

    const points: string[] = stats.map((stat, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const score = typeof stat.value === 'number' && !isNaN(stat.value)
        ? stat.value
        : (stat.score || 50);
      const ratio = Math.min(Math.max(score / 100, 0.1), 1.0);
      const vertex = this.calculateVertex(center, maxRadius * ratio, angle);
      return `${vertex.x.toFixed(1)},${vertex.y.toFixed(1)}`;
    });

    return points.join(' ');
  }

  public renderRadar(): void {
    if (!this.container) return;

    const stats = PORTFOLIO_CONFIG.statsRadar || [];
    const center = this.size / 2;
    const count = stats.length || 5;
    const angleStep = (Math.PI * 2) / count;

    // Background Web Grid Polygons (25%, 50%, 75%, 100%)
    const webs = [0.25, 0.5, 0.75, 1.0].map((level) => {
      const pts = [];
      for (let i = 0; i < count; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const pt = this.calculateVertex(center, this.radius * level, angle);
        pts.push(`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`);
      }
      return `<polygon points="${pts.join(' ')}" class="radar-web" stroke="#333333" stroke-width="1" fill="none" />`;
    }).join('');

    // Axis lines and labels
    let axesSvg = '';
    let labelSvg = '';
    stats.forEach((stat, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const axisEnd = this.calculateVertex(center, this.radius, angle);
      axesSvg += `<line x1="${center}" y1="${center}" x2="${axisEnd.x.toFixed(1)}" y2="${axisEnd.y.toFixed(1)}" class="radar-axis" stroke="#444" stroke-dasharray="2 2" />`;

      const labelDist = this.radius + 28;
      const labelPt = this.calculateVertex(center, labelDist, angle);
      const score = stat.value ?? stat.score ?? 50;
      labelSvg += `
        <g class="radar-node-group" data-tooltip="${stat.label}: ${stat.domain}">
          <title>${stat.code} - ${stat.label} (${score}/100): ${stat.description}</title>
          <text x="${labelPt.x.toFixed(1)}" y="${(labelPt.y - 5).toFixed(1)}" class="radar-label font-bold text-xs" fill="#ffffff" text-anchor="middle">${stat.code}</text>
          <text x="${labelPt.x.toFixed(1)}" y="${(labelPt.y + 10).toFixed(1)}" class="radar-val font-mono text-[11px]" fill="#FFDE00" text-anchor="middle">${score}</text>
        </g>
      `;
    });

    const polygonPoints = this.generatePolygonPoints(stats, center, this.radius);
    const polygonSvg = `
      <polygon points="${polygonPoints}" class="radar-polygon"
        fill="rgba(230, 0, 18, 0.35)"
        stroke="#E60012"
        stroke-width="2.5"
        filter="url(#radar-crimson-glow)" />
    `;

    this.container.innerHTML = `
      <svg class="radar-svg w-full h-full max-w-[320px] max-h-[320px]" viewBox="0 0 ${this.size} ${this.size}">
        <defs>
          <filter id="radar-crimson-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#E60012" flood-opacity="0.8" />
          </filter>
        </defs>
        ${webs}
        ${axesSvg}
        ${polygonSvg}
        ${labelSvg}
      </svg>
    `;
  }
}

export const skillsController = new SkillsController();
