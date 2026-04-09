import type { Theme } from "../../utils/types.util";

export type ThemeAction =
  | { type: "TOGGLE_THEME" }
  | { type: "SET_THEME"; payload: Theme };

export type UserAction =
  | { type: "SET_USER"; payload: { id: string; name: string; email: string } }
  | { type: "LOGOUT_USER" };

export type AppAction = ThemeAction | UserAction;
