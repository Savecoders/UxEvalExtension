import {
  IHeuristic,
  IEvaluation,
  Severity,
  DomainEvaluation,
  PageEvaluation,
} from '@/types/evaluation';
import { PageMetadata } from './page.service';

class EvaluationService {
  private evaluations: { [domain: string]: DomainEvaluation } = {};

  constructor() {
    this.loadEvaluations();
  }

  /**
   * Agrega una nueva evaluación para la página actual
   */
  async addEvaluation(
    pageMetadata: PageMetadata,
    evaluation: {
      elementSelector: string;
      heuristic: IHeuristic;
      severity: Severity;
      notes: string;
      recommendation: string;
      screenshot?: string;
    },
  ): Promise<IEvaluation> {
    const { hostname, path } = pageMetadata;

    if (!hostname || !path) {
      throw new Error('Invalid page metadata');
    }

    const newEvaluation: IEvaluation = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      url: pageMetadata.url || '',
      ...evaluation,
    };

    // Inicializar estructura si no existe
    if (!this.evaluations[hostname]) {
      this.evaluations[hostname] = {
        domain: hostname,
        pages: {},
      };
    }

    if (!this.evaluations[hostname].pages[path]) {
      this.evaluations[hostname].pages[path] = {
        metadata: pageMetadata,
        evaluations: [],
      };
    }

    this.evaluations[hostname].pages[path].evaluations.push(newEvaluation);

    await this.saveEvaluations();
    return newEvaluation;
  }

  getDomainEvaluations(domain: string): DomainEvaluation | undefined {
    return this.evaluations[domain];
  }

  getPageEvaluations(domain: string, path: string): PageEvaluation | undefined {
    return this.evaluations[domain]?.pages[path];
  }

  getCurrentPageEvaluations(pageMetadata: PageMetadata): IEvaluation[] {
    const { hostname, path } = pageMetadata;
    if (!hostname || !path) return [];

    return this.evaluations[hostname]?.pages[path]?.evaluations || [];
  }

  async deleteEvaluation(
    domain: string,
    path: string,
    evaluationId: string,
  ): Promise<void> {
    if (this.evaluations[domain]?.pages[path]) {
      const pageEval = this.evaluations[domain].pages[path];
      pageEval.evaluations = pageEval.evaluations.filter(
        (e: IEvaluation) => e.id !== evaluationId,
      );
      await this.saveEvaluations();
    }
  }

  /**
   * Guarda las evaluaciones en el storage
   */
  private async saveEvaluations(): Promise<void> {
    try {
      if (chrome?.storage?.local) {
        await chrome.storage.local.set({
          domainEvaluations: this.evaluations,
        });
      } else {
        // Fallback a localStorage si chrome.storage no está disponible
        localStorage.setItem(
          'domainEvaluations',
          JSON.stringify(this.evaluations),
        );
      }
    } catch (error) {
      console.error('Error saving evaluations:', error);
    }
  }

  /**
   * Carga las evaluaciones desde el storage
   */
  private async loadEvaluations(): Promise<void> {
    try {
      if (chrome?.storage?.local) {
        const data = await chrome.storage.local.get('domainEvaluations');
        this.evaluations = data.domainEvaluations || {};
      } else {
        // Fallback a localStorage si chrome.storage no está disponible
        const stored = localStorage.getItem('domainEvaluations');
        this.evaluations = stored ? JSON.parse(stored) : {};
      }
    } catch (error) {
      console.error('Error loading evaluations:', error);
      this.evaluations = {};
    }
  }

  /**
   * Exporta las evaluaciones de un dominio específico
   */
  async exportDomainEvaluations(domain: string): Promise<string> {
    return JSON.stringify(this.evaluations[domain], null, 2);
  }
}

export default EvaluationService;
