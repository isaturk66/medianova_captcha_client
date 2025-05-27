import '../globals';

export const i18n = {
  ariaLinkLabel: 'Visita Medianova.com',
  enterCode: 'Inserisci il codice',
  enterCodeAria:
    "Inserisci il codice che senti. Premi Spazio per riprodurre l'audio.",
  error: 'Verifica fallita. Riprova più tardi.',
  expired: 'Verifica scaduta. Riprova.',
  verificationRequired: 'Verifica richiesta!',
  footer:
    'Protetto da <a href="https://www.medianova.com/" target="_blank" aria-label="Visita Medianova.com">Medianova</a>',
  getAudioChallenge: 'Ottieni una sfida audio',
  label: 'Non sono un robot',
  loading: 'Caricamento...',
  reload: 'Ricarica',
  verify: 'Verifica',
  verified: 'Verificato',
  verifying: 'Verifica in corso...',
  waitAlert: 'Verifica in corso... attendere.',
};

globalThis.altchaI18n.set('it', i18n);
