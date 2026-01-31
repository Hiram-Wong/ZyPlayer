import { SITE_API_MAP, SITE_TYPE } from '@shared/config/film';

import { fileManageApi } from '@/utils/env';

export const DEBUG_PREFIX = 'debug';

export const SITE_SUFFIX_MAP = {
  [SITE_TYPE.T0_XML]: '',
  [SITE_TYPE.T1_JSON]: '',
  [SITE_TYPE.T4_DRPYJS0]: 'js',
  [SITE_TYPE.T4_DRPYS]: 'js',
  [SITE_TYPE.T3_DRPY]: 'js',
  [SITE_TYPE.T4_CATVOD]: 'js',
  [SITE_TYPE.T3_XBPQ]: 'json',
  [SITE_TYPE.T3_XYQ]: 'json',
  [SITE_TYPE.T3_APPYSV2]: '',
  [SITE_TYPE.T3_PY]: 'py',
  [SITE_TYPE.T3_ALIST]: '',
  [SITE_TYPE.T3_CATOPEN]: 'js',
};

export const SITE_PATH_MAP = {
  [SITE_TYPE.T0_XML]: '',
  [SITE_TYPE.T1_JSON]: '',
  [SITE_TYPE.T4_DRPYJS0]: '',
  [SITE_TYPE.T4_DRPYS]: 'plugin/drpy-node/spider/js/',
  [SITE_TYPE.T3_DRPY]: 'file/drpy_dzlive/drpy_js/',
  [SITE_TYPE.T4_CATVOD]: 'plugin/catvod/',
  [SITE_TYPE.T3_XBPQ]: 'file/xbpq/',
  [SITE_TYPE.T3_XYQ]: 'file/xyq/',
  [SITE_TYPE.T3_APPYSV2]: '',
  [SITE_TYPE.T3_PY]: 'file/py/',
  [SITE_TYPE.T3_ALIST]: '',
  [SITE_TYPE.T3_CATOPEN]: 'file/catopen/',
};

const monacoInjectModules = import.meta.glob<{ default?: any }>('./inject/**/suggestions.*', { eager: true });
const monacoInjectExtraLibs = import.meta.glob<{ default?: any }>('./inject/**/extraLib.*', {
  eager: true,
  query: '?raw',
});

const mapMonacoInject = ((
  suggestions: Record<string, { default?: any }>,
  extraLibs: Record<string, { default?: any }>,
) => {
  const res = {};

  Object.entries(suggestions).forEach(([key, mod]) => {
    const parts = key.split('/');
    const type = parts.at(2)!;

    res[type] ||= {};
    res[type].suggestions = mod?.default ?? null;
  });

  Object.entries(extraLibs).forEach(([key, mod]) => {
    const parts = key.split('/');
    const type = parts.at(2)!;

    res[type] ||= {};
    res[type].extraLib = mod?.default ?? null;
  });

  return res;
})(monacoInjectModules, monacoInjectExtraLibs);

export const SITE_MONACO_MAP = {
  [SITE_TYPE.T0_XML]: {
    language: 'plaintext',
    suggestions: mapMonacoInject[SITE_TYPE.T0_XML]?.suggestions ?? null,
    extraLib: mapMonacoInject[SITE_TYPE.T0_XML]?.extraLib ?? null,
  },
  [SITE_TYPE.T1_JSON]: {
    language: 'plaintext',
    suggestions: mapMonacoInject[SITE_TYPE.T1_JSON]?.suggestions ?? null,
    extraLib: mapMonacoInject[SITE_TYPE.T1_JSON]?.extraLib ?? null,
  },
  [SITE_TYPE.T4_DRPYJS0]: {
    language: 'javascript',
    suggestions: mapMonacoInject[SITE_TYPE.T4_DRPYJS0]?.suggestions ?? null,
    extraLib: mapMonacoInject[SITE_TYPE.T4_DRPYJS0]?.extraLib ?? null,
  },
  [SITE_TYPE.T4_DRPYS]: {
    language: 'javascript',
    suggestions: mapMonacoInject[SITE_TYPE.T4_DRPYS]?.suggestions ?? null,
    extraLib: mapMonacoInject[SITE_TYPE.T4_DRPYS]?.extraLib ?? null,
  },
  [SITE_TYPE.T3_DRPY]: {
    language: 'javascript',
    suggestions: mapMonacoInject[SITE_TYPE.T3_DRPY]?.suggestions ?? null,
    extraLib: mapMonacoInject[SITE_TYPE.T3_DRPY]?.extraLib ?? null,
  },
  [SITE_TYPE.T4_CATVOD]: {
    language: 'javascript',
    suggestions: mapMonacoInject[SITE_TYPE.T4_CATVOD]?.suggestions ?? null,
    extraLib: mapMonacoInject[SITE_TYPE.T4_CATVOD]?.extraLib ?? null,
  },
  [SITE_TYPE.T3_XBPQ]: {
    language: 'json',
    suggestions: mapMonacoInject[SITE_TYPE.T3_XBPQ]?.suggestions ?? null,
    extraLib: mapMonacoInject[SITE_TYPE.T3_XBPQ]?.extraLib ?? null,
  },
  [SITE_TYPE.T3_XYQ]: {
    language: 'json',
    suggestions: mapMonacoInject[SITE_TYPE.T3_XYQ]?.suggestions ?? null,
    extraLib: mapMonacoInject[SITE_TYPE.T3_XYQ]?.extraLib ?? null,
  },
  [SITE_TYPE.T3_APPYSV2]: {
    language: 'plaintext',
    suggestions: mapMonacoInject[SITE_TYPE.T3_APPYSV2]?.suggestions ?? null,
    extraLib: mapMonacoInject[SITE_TYPE.T3_APPYSV2]?.extraLib ?? null,
  },
  [SITE_TYPE.T3_PY]: {
    language: 'python',
    suggestions: mapMonacoInject[SITE_TYPE.T3_PY]?.suggestions ?? null,
    extraLib: mapMonacoInject[SITE_TYPE.T3_PY]?.extraLib ?? null,
  },
  [SITE_TYPE.T3_CATOPEN]: {
    language: 'javascript',
    suggestions: mapMonacoInject[SITE_TYPE.T3_CATOPEN]?.suggestions ?? null,
    extraLib: mapMonacoInject[SITE_TYPE.T3_CATOPEN]?.extraLib ?? null,
  },
  [SITE_TYPE.T3_ALIST]: {
    language: 'plaintext',
    suggestions: mapMonacoInject[SITE_TYPE.T3_ALIST]?.suggestions ?? null,
    extraLib: mapMonacoInject[SITE_TYPE.T3_ALIST]?.extraLib ?? null,
  },
};

export const SITE_DIFF_DEBUG_MAP = {
  [SITE_TYPE.T0_XML]: { type: SITE_TYPE.T0_XML, api: '', ext: '' },
  [SITE_TYPE.T1_JSON]: { type: SITE_TYPE.T1_JSON, api: '', ext: '' },
  [SITE_TYPE.T4_DRPYJS0]: { type: SITE_TYPE.T4_DRPYJS0, api: '', ext: '' },
  [SITE_TYPE.T4_DRPYS]: {
    type: SITE_TYPE.T4_DRPYS,
    api: `http://127.0.0.1:5757/api/${DEBUG_PREFIX}`,
    ext: '',
  },
  [SITE_TYPE.T3_DRPY]: {
    type: SITE_TYPE.T3_DRPY,
    api: SITE_API_MAP[SITE_TYPE.T3_DRPY],
    ext: `${fileManageApi}/drpy_dzlive/drpy_js/${DEBUG_PREFIX}.js`,
  },
  [SITE_TYPE.T4_CATVOD]: { type: SITE_TYPE.T4_CATVOD, api: '', ext: '' },
  [SITE_TYPE.T3_XBPQ]: { type: SITE_TYPE.T3_XBPQ, api: '', ext: '' },
  [SITE_TYPE.T3_XYQ]: { type: SITE_TYPE.T3_XYQ, api: '', ext: '' },
  [SITE_TYPE.T3_APPYSV2]: { type: SITE_TYPE.T3_APPYSV2, api: '', ext: '' },
  [SITE_TYPE.T3_PY]: {
    type: SITE_TYPE.T3_PY,
    api: `${fileManageApi}/py/${DEBUG_PREFIX}.py`,
    ext: '',
  },
  [SITE_TYPE.T3_CATOPEN]: { type: SITE_TYPE.T3_CATOPEN, api: `${fileManageApi}/catopen/${DEBUG_PREFIX}.js`, ext: '' },
  [SITE_TYPE.T3_ALIST]: { type: SITE_TYPE.T3_ALIST, api: '', ext: '' },
};
