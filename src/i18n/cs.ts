import '../globals';

export const i18n = {
  ariaLinkLabel: 'Navštivte Medianova.com',
  enterCode: 'Zadejte kód',
  enterCodeAria:
    'Zadejte kód, který slyšíte. Stisknutím mezerníku přehrajete zvuk.',
  error: 'Ověření selhalo. Zkuste to prosím později.',
  expired: 'Ověření vypršelo. Zkuste to prosím znovu.',
  verificationRequired: 'Vyžaduje se ověření!',
  footer:
    'Chráněno pomocí <a href="https://www.medianova.com/" target="_blank" aria-label="Navštivte Medianova.com">Medianova</a>',
  getAudioChallenge: 'Získat audio výzvu',
  label: 'Nejsem robot',
  loading: 'Načítání...',
  reload: 'Znovu načíst',
  verify: 'Ověřit',
  verified: 'Ověřeno',
  verifying: 'Ověřování...',
  waitAlert: 'Probíhá ověření... prosím počkejte.',
};

globalThis.altchaI18n.set('cs', i18n);
