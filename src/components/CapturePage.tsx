import { useEffect, useRef, useState, type FormEvent } from 'react';

const LEAD_API_URL = '/api/lead';
const SALES_PAGE_URL = '/200-recetas-para-diabeticos?enviado=1';
const GENERIC_ERROR = 'No pudimos registrar tu email. Inténtalo de nuevo.';

const benefits = [
  '7 desayunos fáciles y ricos',
  'Ingredientes sencillos y prácticos',
  'Acceso digital inmediato',
];

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" />
      <path d="M2 21c0-3 1.9-5.4 5.1-6.3C9.7 14 12 12.5 14 10" />
    </svg>
  );
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function CapturePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState(GENERIC_ERROR);
  const openerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;

    const form = new FormData(event.currentTarget);
    setStatus('sending');

    try {
      const response = await fetch(LEAD_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), hp: form.get('hp_check') }),
      });
      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (!response.ok || !data?.ok) {
        setErrorMessage(data?.error ?? GENERIC_ERROR);
        setStatus('error');
        return;
      }

      // Éxito: dejamos el botón en "Enviando..." hasta que el navegador cambie de página.
      // GA4: conversión "lead". `beacon` asegura el envío aunque la página cambie enseguida.
      (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag?.('event', 'generate_lead', {
        transport_type: 'beacon',
      });
      window.location.assign(SALES_PAGE_URL);
    } catch {
      setErrorMessage(GENERIC_ERROR);
      setStatus('error');
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const body = document.body;
    const wasOverflowHidden = body.classList.contains('overflow-hidden');
    body.classList.add('overflow-hidden');

    firstInputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => !element.hasAttribute('disabled') && element.tabIndex >= 0);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (!wasOverflowHidden) body.classList.remove('overflow-hidden');
      openerRef.current?.focus();
    };
  }, [isOpen]);

  return (
    <main className="capture-background relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-7 sm:px-6 sm:py-11">
      <section
        className="mx-auto grid w-full max-w-[1180px] grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-[70px]"
        aria-labelledby="capture-title"
        inert={isOpen}
      >
        <div className="relative z-10 text-center lg:text-left">
          <img
            src="/assets/logo-vividia.png"
            className="mx-auto mb-7 block w-full max-w-[150px] lg:mx-0 lg:mb-9 lg:max-w-[185px]"
            alt="Vividia Oficial"
            width="1774"
            height="887"
          />

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-vividia-green-dark/10 bg-vividia-green/10 px-3.5 py-2 text-[10px] font-bold tracking-[0.7px] text-vividia-green-dark sm:text-xs">
            <span className="size-2 rounded-full bg-vividia-coral" aria-hidden="true" />
            PDF GRATUITO
          </div>

          <h1
            id="capture-title"
            className="mx-auto mb-5 max-w-[700px] font-display text-[39px] leading-[1.05] font-extrabold tracking-[-1.8px] text-vividia-text sm:text-5xl lg:mx-0 lg:text-[clamp(42px,5vw,68px)] lg:leading-[1.04] lg:tracking-[-2.8px]"
          >
            Descubre <span className="text-vividia-green-dark">7 desayunos</span> fáciles para
            personas con <span className="text-vividia-coral">diabetes</span>
          </h1>

          <p className="mx-auto mb-7 max-w-[620px] text-base leading-[1.6] text-vividia-muted sm:text-lg sm:leading-[1.65] lg:mx-0">
            Recibe gratis un mini recetario con{' '}
            <strong className="font-bold text-vividia-text">7 ideas sencillas</strong> para empezar el
            día con más variedad y nuevas opciones saludables.
          </p>

          <ul className="mx-auto mb-7 flex max-w-[480px] flex-col gap-3 text-left lg:mx-0 lg:mb-8">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-sm leading-[1.45] font-medium sm:text-[15px]">
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-full bg-vividia-green text-[13px] font-bold text-white"
                  aria-hidden="true"
                >
                  ✓
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          <button
            ref={openerRef}
            type="button"
            onClick={() => setIsOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            className="group inline-flex min-h-[58px] w-full max-w-[480px] cursor-pointer items-center justify-center rounded-[13px] bg-linear-to-br from-[#f48769] to-[#f27659] px-5 text-base font-bold text-white shadow-[0_12px_28px_rgba(242,127,98,.28)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(242,127,98,.34)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-vividia-green-dark sm:min-h-[62px] sm:w-auto sm:px-8 sm:text-[17px]"
          >
            Quiero mis 7 desayunos gratis
            <span className="ml-2.5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
              →
            </span>
          </button>
        </div>

        <div className="relative flex min-h-0 items-center justify-center lg:min-h-[560px]" aria-label="Vista previa del PDF gratuito">
          <div className="absolute size-[285px] rounded-full bg-linear-to-br from-[#e8f0e4] to-[#f4f7f1] before:absolute before:top-[15%] before:left-[15%] before:size-[70%] before:rounded-full before:border before:border-dashed before:border-vividia-green-dark/20 sm:size-[360px] lg:size-[470px]" />
          <span className="absolute top-[7%] left-[4%] size-5 rounded-full bg-vividia-coral" aria-hidden="true" />
          <span className="absolute top-[22%] right-[3%] size-3 rounded-full bg-vividia-green" aria-hidden="true" />
          <span className="absolute bottom-[12%] left-[5%] size-[17px] rounded-full border-3 border-vividia-coral" aria-hidden="true" />

          <article className="relative z-10 w-full max-w-[420px] rotate-[1.5deg] rounded-[22px] bg-white p-3.5 shadow-[0_35px_70px_rgba(52,71,56,.17)] lg:max-w-[480px] lg:rounded-[28px] lg:p-[22px]">
            <span className="absolute top-3.5 -right-1.5 z-10 rotate-5 rounded-lg bg-vividia-coral px-3 py-2 text-[9px] font-extrabold tracking-[1px] text-white shadow-[0_10px_22px_rgba(242,127,98,.24)] lg:top-[30px] lg:-right-[18px] lg:px-[17px] lg:py-2.5 lg:text-[11px]">
              GRATIS
            </span>
            <img
              src="/assets/portada.png"
              alt="Recetario 7 desayunos saludables para diabéticos"
              className="block h-auto w-full rounded-[17px]"
              width="1254"
              height="1254"
              loading="eager"
              fetchPriority="high"
            />
            <div className="flex items-center justify-between px-1 pt-[18px] pb-1">
              <div>
                <p className="m-0 text-xs text-vividia-muted">PDF gratuito</p>
                <p className="m-0 font-display text-[25px] font-extrabold text-vividia-text">7 desayunos</p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-full bg-vividia-green-light text-vividia-green-dark">
                <LeafIcon className="size-6" />
              </span>
            </div>
          </article>
        </div>
      </section>

      <div
        className={`modal-backdrop fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto p-3.5 transition-[opacity,visibility] duration-200 sm:p-5 ${
          isOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
        }`}
        aria-hidden={!isOpen}
        inert={!isOpen}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsOpen(false);
        }}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="capture-dialog-title"
          aria-describedby="capture-dialog-description"
          tabIndex={-1}
          className={`modal-card relative my-auto w-full max-w-[520px] shrink-0 overflow-hidden rounded-[23px] bg-linear-to-br from-white to-[#fbf9f4] px-5 pt-[38px] pb-7 shadow-[0_35px_100px_rgba(0,0,0,.22)] transition-transform duration-300 sm:rounded-[28px] sm:px-10 sm:pt-11 sm:pb-9 ${
            isOpen ? 'translate-y-0 scale-100' : 'translate-y-6 scale-[.97]'
          }`}
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-[17px] z-10 flex size-[38px] cursor-pointer items-center justify-center rounded-full border-0 bg-vividia-green-dark/10 text-[22px] text-vividia-green-dark transition hover:rotate-6 hover:bg-vividia-green-dark/15 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-vividia-coral"
            aria-label="Cerrar formulario"
          >
            ×
          </button>

          <div className="relative z-[1] text-center">
            <div className="mx-auto mb-[18px] flex size-[55px] items-center justify-center rounded-[17px] bg-vividia-green-light text-vividia-green-dark">
              <LeafIcon className="size-7" />
            </div>
            <p className="mb-2.5 text-[11px] font-extrabold tracking-[0.8px] text-vividia-green-dark">
              DESCARGA GRATUITA
            </p>
            <h2
              id="capture-dialog-title"
              className="mb-2.5 font-display text-[27px] leading-[1.15] font-extrabold tracking-[-0.8px] text-vividia-text sm:text-[31px] sm:tracking-[-1.1px]"
            >
              ¿Dónde te enviamos tus <span className="text-vividia-coral">7 desayunos?</span>
            </h2>
            <p
              id="capture-dialog-description"
              className="mx-auto mb-5 max-w-[390px] text-[13px] leading-[1.6] text-vividia-muted sm:mb-[26px] sm:text-sm"
            >
              Introduce tu email y recibe el PDF directamente en tu correo.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Honeypot anti-bot: fuera de pantalla, sin foco y oculto a lectores de pantalla. */}
              <input
                type="text"
                name="hp_check"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="pointer-events-none absolute -left-[9999px] size-px opacity-0"
              />
              <label htmlFor="email" className="sr-only">
                Tu mejor correo electrónico
              </label>
              <input
                ref={firstInputRef}
                id="email"
                type="email"
                name="email"
                placeholder="Tu mejor email"
                autoComplete="email"
                required
                className="h-14 w-full rounded-[13px] border-[1.5px] border-[#dce4d9] bg-white px-[17px] text-base text-vividia-text outline-none transition placeholder:text-[#99a199] focus:border-vividia-green focus:ring-4 focus:ring-vividia-green/10 sm:h-[58px] sm:text-[15px]"
              />

              <button
                type="submit"
                disabled={status === 'sending'}
                className="mt-0.5 min-h-[58px] w-full cursor-pointer rounded-[13px] border-0 bg-linear-to-br from-[#f48769] to-[#f27659] px-5 text-[15px] font-bold text-white shadow-[0_11px_25px_rgba(242,127,98,.25)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(242,127,98,.32)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-vividia-green-dark disabled:cursor-wait disabled:opacity-70 sm:min-h-[60px] sm:text-base"
              >
                {status === 'sending' ? 'Enviando...' : 'Recibir mis 7 desayunos →'}
              </button>
              {status === 'error' && (
                <p role="alert" className="m-0 text-[13px] text-vividia-coral-dark">
                  {errorMessage}
                </p>
              )}
            </form>

            <p className="mt-[15px] text-center text-[11px] text-[#899188]">Tus datos están protegidos. Nada de spam.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
