import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

/**
 * Área de rolagem de uma tabela larga (NFIN02): a tabela rola aqui dentro, nunca a página, e com
 * foco o teclado também a rola. Quando há colunas fora do enquadramento, o texto e a borda
 * esmaecida avisam, e o texto se atualiza ao chegar ao fim (#201).
 */
@Component({
  selector: 'bios-table-scroll',
  template: `
    @if (overflowing()) {
      <p class="hint">
        {{
          atEnd()
            ? 'Fim da tabela. Deslize de volta para ver o início.'
            : 'Há mais colunas à direita. Deslize a tabela para vê-las.'
        }}
      </p>
    }
    <div class="frame" [class.more]="overflowing() && !atEnd()">
      <div
        #region
        class="table-scroll"
        [class.bordered]="bordered()"
        role="region"
        tabindex="0"
        [attr.aria-label]="label()"
        (scroll)="measure()"
      >
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .hint {
      margin: 0 0 0.5rem;
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }

    .frame {
      position: relative;
    }

    .more::after {
      content: '';
      position: absolute;
      inset-block: 0;
      right: 0;
      width: 2.5rem;
      background: linear-gradient(to right, transparent, var(--mat-sys-surface));
      pointer-events: none;
    }

    .table-scroll {
      position: relative;
      overflow-x: auto;

      &:focus-visible {
        outline: 2px solid var(--mat-sys-primary);
        outline-offset: 2px;
      }
    }

    .bordered {
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: var(--mat-sys-corner-small);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableScroll {
  /** O nome da região, lido pelo leitor de tela. */
  readonly label = input.required<string>();
  readonly bordered = input(false, { transform: booleanAttribute });

  private readonly region = viewChild.required<ElementRef<HTMLElement>>('region');

  protected readonly overflowing = signal(false);
  protected readonly atEnd = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      this.measure();
      if (typeof ResizeObserver === 'undefined') return;

      const region = this.region().nativeElement;
      const observer = new ResizeObserver(() => {
        this.measure();
      });

      observer.observe(region);
      const table = region.querySelector('table');
      if (table) observer.observe(table);
      destroyRef.onDestroy(() => {
        observer.disconnect();
      });
    });
  }

  protected measure(): void {
    const { scrollLeft, scrollWidth, clientWidth } = this.region().nativeElement;

    this.overflowing.set(scrollWidth > clientWidth + 1);
    this.atEnd.set(scrollLeft + clientWidth >= scrollWidth - 1);
  }
}
