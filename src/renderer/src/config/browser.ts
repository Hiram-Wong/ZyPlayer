export interface IBrowserItem {
  id: string;
  title: string;
  url: string;
  favicon: string;
}

export interface IBrowser {
  activeTab: string;
  tabs: IBrowserItem[];
  history: IBrowserItem[];
}

export const init: IBrowser = {
  activeTab: '',
  tabs: [],
  history: [],
};

export default init;
