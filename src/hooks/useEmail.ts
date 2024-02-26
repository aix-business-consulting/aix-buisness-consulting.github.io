import { Email } from "@/lib/types";
import { create } from "zustand";

interface EmailStore {
  selectedEmail: Email | undefined;
  setSelectedEmail: (selectedEmailId: Email) => void;
  showIgnored: boolean;
  setShowIgnored: (showIgnored: boolean) => void;
}

const useEmail = create<EmailStore>((set) => ({
  selectedEmail: undefined,
  setSelectedEmail: (selectedEmail: Email) => set({ selectedEmail }),
  showIgnored: false,
  setShowIgnored: (showIgnored: boolean) => set({ showIgnored }),
}));

export default useEmail;