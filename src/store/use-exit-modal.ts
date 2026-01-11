import { create } from "zustand";

type ExitModalState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  onConfirm: () => void;
};

export const useExitModal = create<ExitModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  onConfirm: () => {
    window.location.href = "/learn";
  },
}));