import { createActionFactory } from "@neufund/shared";

export const jwtActions = {
  loadJWT: createActionFactory("AUTH_LOAD_JWT", (jwt: string) => ({ jwt })),
  jwtTimeout: createActionFactory("AUTH_JWT_TIMEOUT"),
};
