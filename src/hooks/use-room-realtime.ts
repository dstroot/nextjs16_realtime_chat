import { useRouter } from "next/navigation";
import { useRealtime } from "@/lib/realtime-client";

export function useRoomRealtime(roomId: string, onMessageReceived: () => void) {
  const router = useRouter();

  useRealtime({
    channels: [roomId],
    events: ["chat.message", "chat.destroy"],
    onData: ({ event }) => {
      if (event === "chat.message") {
        onMessageReceived();
      }

      if (event === "chat.destroy") {
        router.push("/?destroyed=true");
      }
    },
  });
}
