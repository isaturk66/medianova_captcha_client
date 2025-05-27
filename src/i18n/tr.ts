import '../globals';

export const i18n = {
  ariaLinkLabel: "Medianova.com'u ziyaret edin",
  enterCode: 'Kodu girin',
  enterCodeAria:
    'Duyduğunuz kodu girin. Ses dosyasını oynatmak için Boşluk tuşuna basın.',
  error: 'Doğrulama başarısız oldu. Lütfen daha sonra tekrar deneyin.',
  expired: 'Doğrulama süresi doldu. Lütfen tekrar deneyin.',
  verificationRequired: 'Doğrulama gerekli!',
  footer:
    'Medianova tarafından korunuyor <a href="https://www.medianova.com/" target="_blank" aria-label="Medianova.com\'yu ziyaret edin">Medianova</a>',
  getAudioChallenge: 'Sesli doğrulama al',
  label: 'Robot değilim',
  loading: 'Yükleniyor...',
  reload: 'Yeniden yükle',
  verify: 'Doğrula',
  verified: 'Doğrulandı',
  verifying: 'Doğrulama yapılıyor...',
  waitAlert: 'Doğrulama yapılıyor... lütfen bekleyin.',
};

globalThis.altchaI18n.set('tr', i18n);
