import '../globals';

export const i18n = {
  ariaLinkLabel: 'בקר באתר Medianova.com',
  enterCode: 'הזן קוד',
  enterCodeAria: 'הזן את הקוד שאתה שומע. לחץ על רווח להפעלת השמע.',
  error: 'האימות נכשל. נסה שוב מאוחר יותר.',
  expired: 'תוקף האימות פג. נסה שוב.',
  verificationRequired: 'נדרש אימות!',
  footer:
    'מוגן על ידי <a href="https://www.medianova.com/" target="_blank" aria-label="בקר באתר Medianova.com">Medianova</a>',
  getAudioChallenge: 'קבל אתגר שמע',
  label: 'אני לא רובוט',
  loading: 'טוען...',
  reload: 'טען מחדש',
  verify: 'אמת',
  verified: 'אומת',
  verifying: 'מאמת...',
  waitAlert: 'מבצע אימות... אנא המתן.',
};

globalThis.altchaI18n.set('he', i18n);
