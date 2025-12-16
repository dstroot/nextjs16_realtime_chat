"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useCallback } from "react";
import { toast } from "sonner";

// hooks
import { useAutoDismiss } from "@/hooks/use-auto-dismiss";

// lib
import { client } from "@/lib/client";
import { ERROR_CODES, type ErrorCode } from "@/lib/constants";
import { generateKey } from "@/lib/encryption";

// components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ModeToggle } from "@/components/mode-toggle";
import { ErrorAlert } from "@/components/error-alert";

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Lobby />
    </Suspense>
  );
};

export default Page;

function Lobby() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Error handling/notifications
  const wasDestroyed = searchParams.get("destroyed") === "true";
  const error = searchParams.get("error") as ErrorCode | null;

  // State
  const [showDestroyed, setShowDestroyed] = useState(wasDestroyed);
  const [showError, setError] = useState(error);

  // Auto-dismiss alerts after 4 seconds
  useAutoDismiss(
    showDestroyed,
    useCallback(() => setShowDestroyed(false), [])
  );
  useAutoDismiss(
    !!showError,
    useCallback(() => setError(null), [])
  );

  const {
    mutate: createRoom,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: async () => {
      const res = await client.room.create.post();

      // Navigate to the newly created room
      if (res.status === 200) {
        // Add a generated encryption key as a URL fragment
        router.push(`/room/${res.data?.roomId}#${generateKey()}`);
      } else {
        throw new Error("Failed to create room");
      }
    },
    onError: (error) => {
      toast.error("Failed to create room", {
        description: error.message || "Please try again later.",
      });
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="w-full max-w-md space-y-6">
        {showDestroyed && <ErrorAlert errorCode={ERROR_CODES.ROOM_DESTROYED} />}
        {showError && <ErrorAlert errorCode={error} />}

        <Card className="border-border bg-card/50 backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2 font-bold tracking-tight text-green-500">
              {">private_chat"}
            </CardTitle>
            <CardDescription className="mb-4">
              Create a private, self-destructing chat room. No personal
              identifiable information of any type is ever collected. Messages
              are encrypted end-to-end. Nothing is retained after you leave. No
              accounts, no identifying data in logs. Rooms self-destruct after
              10 minutes or on demand.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Button
              onClick={() => createRoom()}
              disabled={isPending}
              size="lg"
              variant="default"
              className="w-full font-bold"
            >
              {isPending && <Spinner className="mr-1" />}
              {isSuccess ? "ROOM CREATED!" : "CREATE SECURE ROOM"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
