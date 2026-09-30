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
): void => {
  if (type === "success") {
    toast.success(message, {
      position: "top-center",
      duration: 3000,
    });
  } else if (type === "error") {
    toast.error(message, {
      position: "top-center",
      duration: 3000,
    });
  } else if (type === "loading") {
    toast.loading(message, {
      position: "top-center",
    });
  } else if (type === "warning") {
    toast(message, {
      icon: "⚠️", // Warning icon
      style: { background: "#facc15", color: "#000" }, // Yellow background
      position: "top-center",
      duration: 3000,
    });
  } else if (type === "info") {
    toast(message, {
      icon: "ℹ️", // Info icon
      style: { background: "#F0F5FF", color: "black" }, // Blue background
      position: "top-right",
      duration: 3000,
    });
  } else {
    toast(message, {
      position: "top-center",
      duration: 3000,
    });
  }
};
