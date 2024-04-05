export default {
  type: 'film',
  setting: {
    broadcasterType: 'xgplayer',
    externalPlayer: '',
    snifferType: {
      type: 'pie' as 'pie' | 'iframe' | 'custom',
      url: ''
    },
    skipStartEnd: true,
  },
  data: {
    info: {},
    ext: {},
  },
};
