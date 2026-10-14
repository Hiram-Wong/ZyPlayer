let apiToken = '';

export const setApiToken = (token: string): void => {
  apiToken = token;
};

export const getApiAuthorization = (): string => (apiToken ? `Bearer ${apiToken}` : '');
