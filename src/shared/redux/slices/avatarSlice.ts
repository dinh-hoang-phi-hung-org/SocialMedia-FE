import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AvatarState {
  avatar: string;
}

const initialState: AvatarState = {
  avatar: "",
};

const avatarSlice = createSlice({
  name: "avatar",
  initialState,
  reducers: {
    setAvatar: (state: AvatarState, action: PayloadAction<string>) => {
      state.avatar = action.payload;
    },
  },
});

export const { setAvatar } = avatarSlice.actions;
export default avatarSlice.reducer;
