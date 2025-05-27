import '../globals';

export const i18n = {
  ariaLinkLabel: 'Перейти на Medianova.com',
  enterCode: 'Введите код',
  enterCodeAria:
    'Введите код, который слышите. Нажмите пробел для воспроизведения аудио.',
  error: 'Ошибка верификации. Попробуйте позже.',
  expired: 'Срок действия верификации истек. Попробуйте снова.',
  verificationRequired: 'Требуется проверка!',
  footer:
    'Защищено <a href="https://www.medianova.com/" target="_blank" aria-label="Перейти на Medianova.com">Medianova</a>',
  getAudioChallenge: 'Получить аудио задачу',
  label: 'Я не робот',
  loading: 'Загрузка...',
  reload: 'Перезагрузить',
  verify: 'Проверить',
  verified: 'Проверено',
  verifying: 'Идет проверка...',
  waitAlert: 'Идет проверка... Пожалуйста, подождите.',
};

globalThis.altchaI18n.set('ru', i18n);
