import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/client";

export function useRoomDestruction(roomId: string) {
  const { mutate: destroyRoom, isPending: isDestroying } = useMutation({
    mutationFn: async () => {
      await client.room.delete(null, { query: { roomId } });
    },
    onError: (error) => {
      // TODO: Add error handling
      console.error(error);
    },
  });

  return { destroyRoom, isDestroying };
}
