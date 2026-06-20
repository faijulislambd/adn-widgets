import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import { DEFAULT_ACTION_PASSWORD, fetchActionPassword } from "@/lib/password"

export const loadPassword = createAsyncThunk("password/load", async () => {
  return fetchActionPassword()
})

type PasswordState = {
  password: string
  source: "remote" | "fallback"
  status: "idle" | "loading" | "ready" | "failed"
}

const initialState: PasswordState = {
  password: DEFAULT_ACTION_PASSWORD,
  source: "fallback",
  status: "idle",
}

const passwordSlice = createSlice({
  name: "password",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadPassword.pending, (state) => {
        state.status = "loading"
      })
      .addCase(loadPassword.fulfilled, (state, action) => {
        state.password = action.payload.password
        state.source = action.payload.source
        state.status = "ready"
      })
      .addCase(loadPassword.rejected, (state) => {
        state.password = DEFAULT_ACTION_PASSWORD
        state.source = "fallback"
        state.status = "failed"
      })
  },
})

export default passwordSlice.reducer
