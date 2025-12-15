import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { toast } from "sonner";

export function useRoomDestruction(roomId: string) {
  const { mutate: destroyRoom, isPending: isDestroying } = useMutation({
    mutationFn: async () => {
      await client.room.delete(null, { query: { roomId } });
    },
    onError: (error) => {
      toast.error("Failed to destroy room", {
        description: error.message || "Please try again.",
      });
    },
  });

  return { destroyRoom, isDestroying };
}
