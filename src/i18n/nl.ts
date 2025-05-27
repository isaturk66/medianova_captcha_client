import '../globals';

export const i18n = {
  ariaLinkLabel: 'Bezoek Medianova.com',
  enterCode: 'Voer code in',
  enterCodeAria:
    'Voer de code in die je hoort. Druk op Spatie om de audio af te spelen.',
  error: 'Verificatie mislukt. Probeer het later opnieuw.',
  expired: 'Verificatie verlopen. Probeer het opnieuw.',
  verificationRequired: 'Verificatie vereist!',
  footer:
    'Beschermd door <a href="https://www.medianova.com/" target="_blank" aria-label="Bezoek Medianova.com">Medianova</a>',
  getAudioChallenge: 'Audio-uitdaging ontvangen',
  label: 'Ik ben geen robot',
  loading: 'Laden...',
  reload: 'Herladen',
  verify: 'Verifiëren',
  verified: 'Geverifieerd',
  verifying: 'Bezig met verifiëren...',
  waitAlert: 'Bezig met verifiëren... even geduld a.u.b.',
};

globalThis.altchaI18n.set('nl', i18n);
