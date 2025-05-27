import '../globals';

export const i18n = {
  ariaLinkLabel: 'Відвідати Medianova.com',
  enterCode: 'Введіть код',
  enterCodeAria:
    'Введіть код, який ви чуєте. Натисніть пробіл, щоб відтворити аудіо.',
  error: 'Перевірка не вдалася. Спробуйте пізніше.',
  expired: 'Перевірка прострочена. Спробуйте знову.',
  verificationRequired: 'Потрібна перевірка!',
  footer:
    'Захищено <a href="https://www.medianova.com/" target="_blank" aria-label="Відвідати Medianova.com">Medianova</a>',
  getAudioChallenge: 'Отримати аудіо-челлендж',
  label: 'Я не робот',
  loading: 'Завантаження...',
  reload: 'Перезавантажити',
  verify: 'Перевірити',
  verified: 'Перевірено',
  verifying: 'Перевіряється...',
  waitAlert: 'Перевірка... будь ласка, зачекайте.',
};

globalThis.altchaI18n.set('uk', i18n);
