import { useQuery } from "@tanstack/react-query";
import { decrypt } from "@/lib/encryption";

export function useDecryptedMessage(
  text: string,
  encryptionKey: string | null
) {
  const { data: decrypted, isLoading } = useQuery({
    queryKey: ["decrypted", text, encryptionKey],
    queryFn: async () => {
      if (!encryptionKey) return null;
      return await decrypt(text, encryptionKey);
    },
    staleTime: Infinity,
    retry: false,
  });

  if (!encryptionKey) {
    return { message: "Missing encryption key", isLoading: false };
  }

  if (isLoading) {
    return { message: "...", isLoading: true };
  }

  if (decrypted === null && encryptionKey) {
    return { message: "Decryption Failed", isLoading: false };
  }

  return { message: decrypted || "", isLoading: false };
}
