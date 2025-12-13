"use client";

import { client } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";
import { ErrorAlert } from "@/components/error-alert";
import { ERROR_CODES, type ErrorCode } from "@/lib/constants";
import { toast } from "sonner";

const Page = () => {
  return (
    <Suspense>
      <Lobby />
    </Suspense>
  );
};

export default Page;

function Lobby() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wasDestroyed = searchParams.get("destroyed") === "true";
  const error = searchParams.get("error") as ErrorCode | null;
  const [showDestroyed, setShowDestroyed] = useState(wasDestroyed);

  useEffect(() => {
    if (showDestroyed) {
      // Clear URL params immediately
      router.replace("/", { scroll: false });
      // Auto-dismiss after 2 seconds
      const timer = setTimeout(() => setShowDestroyed(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showDestroyed, router]);

  const {
    mutate: createRoom,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: async () => {
      const res = await client.room.create.post();

      // Navigate to the newly created room
      if (res.status === 200) {
        router.push(`/room/${res.data?.roomId}`);
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
        {error && <ErrorAlert errorCode={error} />}

        <Card className="border-border bg-card/50 backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2 font-bold tracking-tight text-green-500">
              {">"}private_chat
            </CardTitle>
            <CardDescription className="mb-4">
              A private, self-destructing chat room.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <Button
              onClick={() => createRoom()}
              disabled={isPending}
              size="lg"
              className="w-full font-bold"
            >
              {isPending ?? (
                <div role="status" className="inline-block mb-0.5">
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4 mr-2 animate-spin"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              )}
              {isSuccess ? "ROOM CREATED" : "CREATE SECURE ROOM"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
