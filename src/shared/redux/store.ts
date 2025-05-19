import { configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import avatarReducer from "./slices/avatarSlice";

export const store = configureStore({
  reducer: {
    avatar: avatarReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disable serializableCheck for redux-persist actions
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
