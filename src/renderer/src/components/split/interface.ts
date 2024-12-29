export interface SplitProps {
  component: string;
  direction: 'horizontal' | 'vertical';
  size: number | string | undefined;
  defaultSize: number | string;
  min: number | string | undefined;
  max: number | string | undefined;
  disabled: boolean;
}
