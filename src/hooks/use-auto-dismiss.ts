import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAutoDismiss(
  shouldDismiss: boolean,
  onDismiss: () => void,
  delay: number = 4000
) {
  const router = useRouter();

  useEffect(() => {
    if (!shouldDismiss) return;

    const timer = setTimeout(() => {
      onDismiss();
      router.replace("/", { scroll: false });
    }, delay);

    return () => clearTimeout(timer);
  }, [shouldDismiss, onDismiss, delay, router]);
}
