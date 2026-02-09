import { createTwoFilesPatch } from 'diff';

export function generateDiff(docName: string, baseContent: string, docContent: string): string {
  // We use createTwoFilesPatch to generate a unified diff.
  // We treat baseContent as the "original" and docContent as the "new" version.
  // We can pass empty strings for headers if we want cleaner output, or meaningful names.
  
  if (!baseContent && !docContent) return '';

  try {
    // createTwoFilesPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader)
    const patch = createTwoFilesPatch(
      'Base',
      docName || 'Current',
      baseContent || '',
      docContent || '',
      'Base Version',
      'Current Version'
    );

    return patch;
  } catch (e) {
    console.error("Diff generation failed", e);
    return "Error generating diff.";
  }
}
