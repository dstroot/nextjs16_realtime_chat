import { useMutation, useQuery } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { encrypt } from "@/lib/encryption";
import { useUsername } from "./use-username";
import { toast } from "sonner";

export function useMessages(roomId: string, encryptionKey: string | null) {
  const { username } = useUsername();

  const { data: messages, refetch } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: async () => {
      const res = await client.messages.get({ query: { roomId } });
      return res.data;
    },
  });

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async ({ text }: { text: string }) => {
      // Encrypt message before sending
      const encrypted = encryptionKey
        ? await encrypt(text, encryptionKey)
        : text;

      await client.messages.post(
        { sender: username, text: encrypted },
        { query: { roomId } }
      );
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to send message", {
        description: error.message || "Please try again.",
      });
    },
  });

  return {
    messages: messages?.messages || [],
    sendMessage,
    isPending,
    refetch,
  };
}
