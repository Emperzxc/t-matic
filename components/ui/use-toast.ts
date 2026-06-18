"use client";

import * as React from "react";

type Toast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const listeners: Array<(toasts: Toast[]) => void> = [];
let memoryState: Toast[] = [];

function dispatch(toast: Toast) {
  memoryState = [toast, ...memoryState].slice(0, 3);
  listeners.forEach((listener) => listener(memoryState));
}

export function toast(props: Omit<Toast, "id">) {
  const id = crypto.randomUUID();
  dispatch({
    ...props,
    id,
    open: true,
    onOpenChange: (open) => {
      if (!open) {
        memoryState = memoryState.filter((item) => item.id !== id);
        listeners.forEach((listener) => listener(memoryState));
      }
    },
  });
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>(memoryState);

  React.useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const index = listeners.indexOf(setToasts);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return { toasts, toast };
}
