import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";
import { useDecryptedMessage } from "@/hooks/use-decrypted-message";

vi.mock("@/lib/encryption", () => ({
  decrypt: vi.fn(async (text: string) => `dec:${text}`),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

function TestComponent({
  text,
  keyProp,
}: {
  text: string;
  keyProp: string | null;
}) {
  const res = useDecryptedMessage(text, keyProp);
  return <div data-testid="out">{res.message}</div>;
}

describe("useDecryptedMessage", () => {
  it("returns missing key message when encryption key is null", () => {
    render(
      <Wrapper>
        <TestComponent text={"abc"} keyProp={null} />
      </Wrapper>
    );

    expect(screen.getByTestId("out")).toHaveTextContent(
      "Missing encryption key"
    );
  });

  it("decrypts and returns decrypted message when key provided", async () => {
    render(
      <Wrapper>
        <TestComponent text={"hello"} keyProp={"secret"} />
      </Wrapper>
    );

    await waitFor(() =>
      expect(screen.getByTestId("out")).toHaveTextContent("dec:hello")
    );
  });
});
