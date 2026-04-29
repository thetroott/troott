import { uploadActions, type UploadDispatch } from '@/context/upload/upload.context';

export function titleFromAudioFilename(file: File): string {
  const fileName = file.name;
  const titleFromFile =
    fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
  return titleFromFile
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

/** Same as FileUploadZone.handleFileSelect after validation — file + title + progress step. */
export function applySelectedAudioToUpload(
  dispatch: UploadDispatch,
  file: File,
): void {
  dispatch(uploadActions.setActiveOption('upload'));
  dispatch(uploadActions.setFile(file));
  dispatch(uploadActions.setUploadData({ title: titleFromAudioFilename(file) }));
  dispatch(uploadActions.setStep('progress'));
}
