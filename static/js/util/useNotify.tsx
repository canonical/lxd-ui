import { NotifyContext } from "util/useNotification";
import { useContext } from "react";

export default function useNotify() {
  return useContext(NotifyContext);
}
