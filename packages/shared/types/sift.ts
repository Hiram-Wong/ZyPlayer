export interface ISiftCategoryResult {
  title: string;
  uuid: string;
  raw: Array<{ title: string; uuid: string; path_url: string; source_url: string }>;
}
