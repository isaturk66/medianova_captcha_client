import '../globals';

export const i18n = {
  ariaLinkLabel: 'Besøg Medianova.com',
  enterCode: 'Indtast kode',
  enterCodeAria:
    'Indtast den kode, du hører. Tryk på mellemrumstasten for at afspille lyd.',
  error: 'Verificering mislykkedes. Prøv venligst igen senere.',
  expired: 'Verificering udløbet. Prøv venligst igen.',
  verificationRequired: 'Verificering kræves!',
  footer:
    'Beskyttet af <a href="https://www.medianova.com/" target="_blank" aria-label="Besøg Medianova.com">Medianova</a>',
  getAudioChallenge: 'Hent lydudfordring',
  label: 'Jeg er ikke en robot',
  loading: 'Indlæser...',
  reload: 'Genindlæs',
  verify: 'Verificer',
  verified: 'Verificeret',
  verifying: 'Verificerer...',
  waitAlert: 'Verificerer... vent venligst.',
};

globalThis.altchaI18n.set('da', i18n);
