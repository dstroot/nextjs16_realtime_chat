"use client";

import { useUsername } from "@/hooks/use-username";
import { client } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
  const { username } = useUsername();
  const router = useRouter();

  const searchParams = useSearchParams();
  const wasDestroyed = searchParams.get("destroyed") === "true";
  const error = searchParams.get("error") as ErrorCode | null;

  const { mutate: createRoom, isPending } = useMutation({
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
        {wasDestroyed && <ErrorAlert errorCode={ERROR_CODES.ROOM_DESTROYED} />}
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
            <div className="space-y-2">
              <Label className="text-muted-foreground">Your Identity:</Label>
              <div className="bg-muted/50 border border-border p-3 text-sm text-muted-foreground font-mono rounded-md">
                {username}
              </div>
            </div>

            <Button
              onClick={() => createRoom()}
              disabled={isPending}
              size="lg"
              className="w-full font-bold"
            >
              {isPending ? "CREATING..." : "CREATE SECURE ROOM"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
