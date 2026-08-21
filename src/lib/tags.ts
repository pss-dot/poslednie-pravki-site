// Tag slugs are Latin (used in URLs and CSS data-tag selectors); this maps
// them to the Russian labels shown to readers.
export const TAG_LABELS: Record<string, string> = {
  rassylka: 'Рассылка',
  avtory: 'Авторы',
  perepiska: 'Переписка',
  'poslednie-pravki': 'Последние правки',
};

export const TAG_SLUGS = ['rassylka', 'avtory', 'perepiska', 'poslednie-pravki'] as const;
