import type { IAppState } from "../../utils/app.util";
import type { AppAction } from "./app.actions";


export const appReducer = (state: IAppState, action: AppAction): IAppState => {
  switch (action.type) {
    case "TOGGLE_THEME":
      return {
        ...state,
        theme: {
          mode: state.theme.mode === "light" ? "dark" : "light",
        },
      };
    case "SET_THEME":
      return {
        ...state,
        theme: { mode: action.payload },
      };
    case "SET_USER":
      return {
        ...state,
        user: action.payload
      };
    case "LOGOUT_USER":
      return {
        ...state,
        user: null,
      };
    default:
      return state;
  }
};
