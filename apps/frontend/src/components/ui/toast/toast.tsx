import { toast as sonnerToast } from "sonner";

export const toast = {
  success: (message: string, options?: { description?: string }) => {
    sonnerToast.success(message, {
      description: options?.description,
    });
  },
  error: (message: string, options?: { description?: string }) => {
    sonnerToast.error(message, {
      description: options?.description,
    });
  },
};
