
import type { EventInput } from "@fullcalendar/core";

export type AccountType = "admin" | "user";

export interface TokenPayload {
  type: AccountType;
}

export interface Event extends EventInput {
  description: string;
}

export interface User {
  id: number;
  name: string;
  studentId: string;
  username: string;
  added: string;
}
