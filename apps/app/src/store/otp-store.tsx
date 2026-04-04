// stores/useForgotPasswordStore.ts
import { create } from "zustand";

export interface IForgotPasswordStore {
  step: "email" | "otp" | "success";
  formData: { email: string; otp: string[] };
  errors: { email?: string; otp?: string };
  touched: { email: boolean; otp: boolean };
  resendCountdown: number;

  setStep: (step: IForgotPasswordStore["step"]) => void;
  setFormData: (data: Partial<IForgotPasswordStore["formData"]>) => void;
  setErrors: (errors: Partial<IForgotPasswordStore["errors"]>) => void;
  setTouched: (touched: Partial<IForgotPasswordStore["touched"]>) => void;
  setResendCountdown: (count: number) => void;
}

export const useForgotPasswordStore = create<IForgotPasswordStore>((set) => ({
  step: "email",
  formData: { email: "", otp: Array(6).fill("") },
  errors: {},
  touched: { email: false, otp: false },
  resendCountdown: 0,

  setStep: (step) => set({ step }),
  setFormData: (data) =>
    set((state) => ({ formData: { ...state.formData, ...data } })),
  setErrors: (errors) =>
    set((state) => ({ errors: { ...state.errors, ...errors } })),
  setTouched: (touched) =>
    set((state) => ({ touched: { ...state.touched, ...touched } })),
  setResendCountdown: (count) => set({ resendCountdown: count }),
}));
