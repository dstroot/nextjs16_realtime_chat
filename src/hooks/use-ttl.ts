import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/client";

export function useTTL(roomId: string) {
  const { data: ttlData } = useQuery({
    queryKey: ["ttl", roomId],
    queryFn: async () => {
      const res = await client.room.ttl.get({ query: { roomId } });
      return res.data;
    },
  });

  return ttlData;
}
