export default {
  name: 'Film',
  noDesc: 'No Synopsis',
  info: {
    unknown: 'Unknown',
    type: 'Type',
    area: 'Area',
    release: 'Release',
  },
  infiniteLoading: {
    complete: 'Load Complete',
    error: 'Load Error',
    noMore: 'Nothing More',
    noData: 'No data, please go to [Settings->MovieConfig] to configure the data',
    networkError: 'Network request failed, Please try to refresh manually',
    categoryError: 'Set category exception, Please go to Setting to check source category then try to refresh manually',
  },
  message: {
    formatSeasonError: 'Data source formatting episode error, check if the data source is normal',
    notSelectAnalyze: 'Recognized official data, but no analyze selected',
    notSelectSourceBeforeSearch: 'No data source selected or Site Mode data source search status is off',
  },
};
