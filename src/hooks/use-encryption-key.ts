"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { validateEncryptionKey } from "@/lib/encryption";

export function useEncryptionKey() {
  const router = useRouter();
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      const validation = validateEncryptionKey(hash);

      if (!validation.valid) {
        const errorCode = !hash ? "missing-key" : "invalid-key";
        router.push(`/?error=${errorCode}`);
      } else {
        setEncryptionKey(hash);
      }
    };

    // Initial check
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [router]);

  return encryptionKey;
}
