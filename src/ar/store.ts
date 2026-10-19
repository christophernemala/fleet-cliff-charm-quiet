import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FollowUp, NoteType, Period } from "@/ar/engine";

export type ViewId =
  | "dashboard"
  | "aging"
  | "transactions"
  | "roll"
  | "collections"
  | "forecast"
  | "cash"
  | "validation"
  | "exceptions"
  | "overdue"
  | "assignments";

type State = {
  view: ViewId;
  period: Period;
  query: string;
  customer: string | null;
  noteCustomer: string | null;
  notes: FollowUp[];
  allocated: number[];
  page: number;
  validation: "all" | "Valid" | "Warning" | "Error";
  severity: "all" | "High" | "Medium";
  priority: "all" | "Critical" | "High" | "Medium" | "Watch";
  toast: string;
  setView: (view: ViewId) => void;
  setPeriod: (period: Period) => void;
  setQuery: (query: string) => void;
  openCustomer: (name: string | null) => void;
  openNote: (name: string | null) => void;
  setPage: (page: number) => void;
  setValidation: (validation: State["validation"]) => void;
  setSeverity: (severity: State["severity"]) => void;
  setPriority: (priority: State["priority"]) => void;
  addNote: (note: Omit<FollowUp, "id" | "createdAt">) => void;
  toggleAllocated: (serial: number) => void;
  flash: (toast: string) => void;
};

export const useAr = create<State>()(
  persist(
    (set) => ({
      view: "dashboard",
      period: "july",
      query: "",
      customer: null,
      noteCustomer: null,
      notes: [],
      allocated: [],
      page: 0,
      validation: "all",
      severity: "all",
      priority: "all",
      toast: "",
      setView: (view) => set({ view, page: 0, customer: null }),
      setPeriod: (period) => set({ period, page: 0 }),
      setQuery: (query) => set({ query, page: 0 }),
      openCustomer: (customer) => set({ customer }),
      openNote: (noteCustomer) => set({ noteCustomer }),
      setPage: (page) => set({ page }),
      setValidation: (validation) => set({ validation, page: 0 }),
      setSeverity: (severity) => set({ severity, page: 0 }),
      setPriority: (priority) => set({ priority, page: 0 }),
      addNote: (note) =>
        set((state) => ({
          notes: [
            {
              ...note,
              id: `${Date.now()}`,
              createdAt: Date.now(),
            },
            ...state.notes,
          ],
          noteCustomer: null,
          toast: "Follow-up saved on this device",
        })),
      toggleAllocated: (serial) =>
        set((state) => ({
          allocated: state.allocated.includes(serial)
            ? state.allocated.filter((n) => n !== serial)
            : [...state.allocated, serial],
        })),
      flash: (toast) => set({ toast }),
    }),
    {
      name: "convergint-ar",
      partialize: (state) => ({ notes: state.notes, allocated: state.allocated, period: state.period }),
    },
  ),
);

export const NOTE_LABEL: Record<NoteType, string> = {
  call_outcome: "Call outcome",
  payment_commitment: "Payment commitment",
  followup_scheduled: "Follow-up scheduled",
  dispute: "Dispute",
  general: "General",
};
