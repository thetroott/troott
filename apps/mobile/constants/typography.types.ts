export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body1'
  | 'subtitle1'
  | 'subtitle2'
  | 'body2'
  | 'caption'
  | 'small'
  | 'button'
  | 'buttonSecondary';

export interface TypographyStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: '400' | '500' | '600' | '700';
  lineHeight: number;
  letterSpacing: number;
}

export type FontWeight = '400' | '500' | '600' | '700';
export type FontFamily = 'matter';

