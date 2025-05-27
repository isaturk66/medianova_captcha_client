import '../globals';

export const i18n = {
  ariaLinkLabel: 'Obiščite Medianova.com',
  enterCode: 'Vnesite kodo',
  enterCodeAria:
    'Vnesite kodo, ki jo slišite. Pritisnite preslednico za predvajanje zvoka.',
  error: 'Preverjanje ni uspelo. Poskusite znova kasneje.',
  expired: 'Preverjanje je poteklo. Poskusite znova.',
  verificationRequired: 'Potrebna je preveritev!',
  footer:
    'Zaščiteno z <a href="https://www.medianova.com/" target="_blank" aria-label="Obiščite Medianova.com">Medianova</a>',
  getAudioChallenge: 'Pridobite zvočni izziv',
  label: 'Nisem robot',
  loading: 'Nalagam...',
  reload: 'Ponovno naloži',
  verify: 'Preveri',
  verified: 'Preverjeno',
  verifying: 'Preverjanje...',
  waitAlert: 'Preverjanje... prosim počakajte.',
};

globalThis.altchaI18n.set('sl', i18n);
