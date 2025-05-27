import '../globals';

export const i18n = {
  ariaLinkLabel: 'Visitez Medianova.com',
  enterCode: 'Entrez le code',
  enterCodeAria:
    "Entrez le code que vous entendez. Appuyez sur Espace pour écouter l'audio.",
  error: 'Échec de la vérification. Essayez à nouveau plus tard.',
  expired: 'La vérification a expiré. Essayez à nouveau.',
  verificationRequired: 'Vérification requise !',
  footer:
    'Protégé par <a href="https://www.medianova.com/" target="_blank" aria-label="Visitez Medianova.com">Medianova</a>',
  getAudioChallenge: 'Obtenir un défi audio',
  label: 'Pas un robot',
  loading: 'Chargement...',
  reload: 'Recharger',
  verify: 'Vérifier',
  verified: 'Vérifié',
  verifying: 'Vérification en cours...',
  waitAlert: 'Vérification en cours... veuillez patienter.',
};

globalThis.altchaI18n.set('fr-fr', i18n);
