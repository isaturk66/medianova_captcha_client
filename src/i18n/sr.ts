import '../globals';

export const i18n = {
  ariaLinkLabel: 'Posetite Medianova.com',
  enterCode: 'Unesite kod',
  enterCodeAria: 'Unesite kod koji čujete. Pritisnite Space da biste pustili zvuk.',
  error: 'Verifikacija nije uspela. Pokušajte ponovo kasnije.',
  expired: 'Verifikacija je istekla. Pokušajte ponovo.',
  footer:
    'Zaštićeno od strane <a href="https://www.medianova.com/" target="_blank" aria-label="Posetite Medianova.com">Medianova</a>',
  getAudioChallenge: 'Dohvatite audio izazov',
  label: "Nisam robot",
  loading: 'Učitavanje...',
  reload: 'Ponovo učitaj',
  verify: 'Verifikuj',
  verificationRequired: 'Verifikacija je obavezna!',
  verified: 'Verifikovano',
  verifying: 'Verifikacija u toku...',
  waitAlert: 'Verifikacija u toku... molimo vas da sačekate.',
};

globalThis.altchaI18n.set('sr', i18n);
