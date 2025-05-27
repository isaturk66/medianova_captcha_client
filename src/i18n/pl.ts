import '../globals';

export const i18n = {
  ariaLinkLabel: 'Odwiedź Medianova.com',
  enterCode: 'Wprowadź kod',
  enterCodeAria:
    'Wpisz kod, który słyszysz. Naciśnij Spację, aby odtworzyć dźwięk.',
  error: 'Weryfikacja nie powiodła się. Spróbuj ponownie później.',
  expired: 'Weryfikacja wygasła. Spróbuj ponownie.',
  verificationRequired: 'Wymagana weryfikacja!',
  footer:
    'Chronione przez <a href="https://www.medianova.com/" target="_blank" aria-label="Odwiedź Medianova.com">Medianova</a>',
  getAudioChallenge: 'Pobierz zadanie dźwiękowe',
  label: 'Nie jestem robotem',
  loading: 'Ładowanie...',
  reload: 'Odśwież',
  verify: 'Zweryfikuj',
  verified: 'Zweryfikowano',
  verifying: 'Weryfikacja...',
  waitAlert: 'Trwa weryfikacja... proszę czekać.',
};

globalThis.altchaI18n.set('pl', i18n);
