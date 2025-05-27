import '../globals';

export const i18n = {
  ariaLinkLabel: 'Vieraile sivulla Medianova.com',
  enterCode: 'Syötä koodi',
  enterCodeAria:
    'Kirjoita kuulemasi koodi. Paina välilyöntiä toistaaksesi äänen.',
  error: 'Varmennus epäonnistui. Yritä myöhemmin uudelleen.',
  expired: 'Varmennus vanhentui. Yritä uudelleen.',
  verificationRequired: 'Vahvistus vaaditaan!',
  footer:
    'Suojattu <a href="https://www.medianova.com/" target="_blank" aria-label="Vieraile sivulla Medianova.com">Medianova</a>:lla',
  getAudioChallenge: 'Hae äänitehtävä',
  label: 'En ole robotti',
  loading: 'Ladataan...',
  reload: 'Lataa uudelleen',
  verify: 'Vahvista',
  verified: 'Vahvistettu',
  verifying: 'Vahvistetaan...',
  waitAlert: 'Vahvistetaan... odota hetki.',
};

globalThis.altchaI18n.set('fi', i18n);
