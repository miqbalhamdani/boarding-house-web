import { create } from "zustand";
import type { NewUser, User } from "@/lib/validation";

let counter = 0;
function nextId(): string {
  counter += 1;
  return `u_${Date.now().toString(36)}_${counter}`;
}

interface UserState {
  users: User[];
  addUser: (input: NewUser) => void;
  removeUser: (id: string) => void;
  reset: (users: User[]) => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  addUser: (input) =>
    set((state) => ({
      users: [
        ...state.users,
        { ...input, id: nextId(), createdAt: new Date().toISOString() },
      ],
    })),
  removeUser: (id) =>
    set((state) => ({ users: state.users.filter((u) => u.id !== id) })),
  reset: (users) => set({ users }),
}));
