export type DocumentType = "driver-license" | "passport-file" | "nin" | "international-passport";

export interface FinalStepProps {
  documentType: DocumentType | null;
}
