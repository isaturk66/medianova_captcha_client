import '../globals';

export const i18n = {
  ariaLinkLabel: 'Külasta Medianova.com',
  enterCode: 'Sisesta kood',
  enterCodeAria: 'Sisestage kuuldu kood. Vajutage tühikut, et esitada heli.',
  error: 'Kinnitamine ebaõnnestus. Proovi hiljem uuesti.',
  expired: 'Kinnitamine aegus. Proovi uuesti.',
  verificationRequired: 'Kontroll on vajalik!',
  footer:
    'Kaitstud <a href="https://www.medianova.com/" target="_blank" aria-label="Külasta Medianova.com">Medianova</a> poolt',
  getAudioChallenge: 'Hangi heliülesanne',
  label: 'Ma ei ole robot',
  loading: 'Laadimine...',
  reload: 'Laadi uuesti',
  verify: 'Kinnita',
  verified: 'Kinnitatud',
  verifying: 'Kinnitamine...',
  waitAlert: 'Kinnitamine... palun oota.',
};

globalThis.altchaI18n.set('et', i18n);
