import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ERROR_ALERTS, type ErrorCode } from "@/lib/constants";
import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  errorCode: ErrorCode | null;
}

export function ErrorAlert({ errorCode }: ErrorAlertProps) {
  if (!errorCode || !(errorCode in ERROR_ALERTS)) {
    return null;
  }

  const alertConfig = ERROR_ALERTS[errorCode as keyof typeof ERROR_ALERTS];

  return (
    <Alert
      variant="destructive"
      className="dark:border-red-900 border-red-600 bg-red-200/50 dark:bg-red-950/50"
    >
      <AlertCircle className="size-4" />
      <AlertTitle className="font-bold">{alertConfig.title}</AlertTitle>
      <AlertDescription>{alertConfig.description}</AlertDescription>
    </Alert>
  );
}
