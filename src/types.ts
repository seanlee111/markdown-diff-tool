export interface MarkdownDoc {
  id: string;
  name: string;
  content: string;
}

export type ViewMode = 'edit' | 'preview' | 'diff';
