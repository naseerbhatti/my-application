import toast from "react-hot-toast";

type ToastType =
  | "success"
  | "error"
  | "loading"
  | "warning"
  | "info"
  | "destructive";

export const showToast = (
  message: string,
  type: ToastType = "success",
) => {
  const options = {
    position: "top-center" as const,
    duration: type === "loading" ? Infinity : 3000,
  };

  switch (type) {
    case "success":
      return toast.success(message, options);
    case "error":
    case "destructive":
      return toast.error(message, options);
    case "loading":
      return toast.loading(message, options);
    case "warning":
      return toast(message, {
        ...options,
        icon: "⚠️",
      });
    case "info":
      return toast(message, {
        ...options,
        icon: "ℹ️",
      });
    default:
      return toast(message, options);
  }
};

export const customToast = {
  success: (msg: string) => showToast(msg, "success"),
  error: (msg: string) => showToast(msg, "error"),
  loading: (msg: string) => showToast(msg, "loading"),
  warning: (msg: string) => showToast(msg, "warning"),
  info: (msg: string) => showToast(msg, "info"),
};

export default customToast;

