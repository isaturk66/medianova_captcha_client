import '../globals';

export const i18n = {
  ariaLinkLabel: 'زور Medianova.com',
  enterCode: 'أدخل الرمز',
  enterCodeAria: 'أدخل الرمز الذي تسمعه. اضغط على المسافة لتشغيل الصوت.',
  error: 'فشل التحقق. حاول مرة أخرى لاحقاً.',
  expired: 'انتهت صلاحية التحقق. حاول مرة أخرى.',
  verificationRequired: 'مطلوب التحقق!',
  footer:
    'محمي بواسطة <a href="https://www.medianova.com/" target="_blank" aria-label="زور Medianova.com">Medianova</a>',
  getAudioChallenge: 'احصل على تحدي صوتي',
  label: 'أنا لست روبوتاً',
  loading: 'جارٍ التحميل...',
  reload: 'إعادة تحميل',
  verify: 'تحقق',
  verified: 'تم التحقق',
  verifying: 'جارٍ التحقق...',
  waitAlert: 'جارٍ التحقق... يرجى الانتظار.',
};

globalThis.altchaI18n.set('ar', i18n);
