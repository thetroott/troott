import { create } from "zustand";
import type { ILoginrFormErrors } from "@/utils/interfaces.util";

interface LoginState {
  formData: { email: string; password: string };
  errors: ILoginrFormErrors;
  touched: { email: boolean; password: boolean };
  showPassword: boolean;
  passwordStrength: { score: number; feedback: string[]; label: string };

  setField: (field: "email" | "password", value: string) => void;
  setTouched: (field: "email" | "password") => void;
  setErrors: (errors: ILoginrFormErrors) => void;
  togglePassword: () => void;
  setPasswordStrength: (strength: LoginState["passwordStrength"]) => void;
  reset: () => void;
}

export const useLoginStore = create<LoginState>((set) => ({
  formData: { email: "", password: "" },
  errors: {},
  touched: { email: false, password: false },
  showPassword: false,
  passwordStrength: { score: 0, feedback: [], label: "Very Weak" },

  setField: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    })),

  setTouched: (field) =>
    set((state) => ({ touched: { ...state.touched, [field]: true } })),

  setErrors: (errors) => set({ errors }),
  togglePassword: () =>
    set((state) => ({ showPassword: !state.showPassword })),

  setPasswordStrength: (strength) => set({ passwordStrength: strength }),

  reset: () =>
    set({
      formData: { email: "", password: "" },
      errors: {},
      touched: { email: false, password: false },
      showPassword: false,
      passwordStrength: { score: 0, feedback: [], label: "Very Weak" },
    }),
}));
