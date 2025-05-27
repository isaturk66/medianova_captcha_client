import '../globals';

export const i18n = {
  ariaLinkLabel: 'Visita Medianova.com',
  enterCode: 'Introdueix el codi',
  enterCodeAria: 'Introdueix el codi que escoltes. Prem Espai per reproduir l’àudio.',
  error: 'Verificació fallida. Torna-ho a provar més tard.',
  expired: 'Verificació expirada. Torna-ho a provar.',
  footer:
    'Protegit per <a href="https://www.medianova.com/" target="_blank" aria-label="Visita Medianova.com">Medianova</a>',
  getAudioChallenge: 'Obtenir un desafiament d’àudio',
  label: "No sóc un robot",
  loading: 'Carregant...',
  reload: 'Torna a carregar',
  verify: 'Verificar',
  verificationRequired: 'Es requereix verificació!',
  verified: 'Verificat',
  verifying: 'Verificant...',
  waitAlert: 'Verificant... si us plau, espera.',
};

globalThis.altchaI18n.set('ca', i18n);
