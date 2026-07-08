export type PasswordSource = "remote" | "fallback";

export type PasswordResponse = {
  password?: unknown;
};

export type PasswordStatus = "idle" | "loading" | "ready" | "failed";

export type PasswordState = {
  password: string;
  source: PasswordSource;
  status: PasswordStatus;
};
