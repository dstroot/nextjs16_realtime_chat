"use client"

import { useUsername } from "@/hooks/use-username"
import { client } from "@/lib/client"
import { useRealtime } from "@/lib/realtime-client"
import { useMutation, useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Copy, Check, Bomb } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

function formatTimeRemaining(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

const Page = () => {
  const params = useParams()
  const roomId = params.roomId as string

  const router = useRouter()

  const { username } = useUsername()
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle")
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  const { data: ttlData } = useQuery({
    queryKey: ["ttl", roomId],
    queryFn: async () => {
      const res = await client.room.ttl.get({ query: { roomId } })
      return res.data
    },
  })

  useEffect(() => {
    if (ttlData?.ttl !== undefined) setTimeRemaining(ttlData.ttl)
  }, [ttlData])

  useEffect(() => {
    if (timeRemaining === null || timeRemaining < 0) return

    if (timeRemaining === 0) {
      router.push("/?destroyed=true")
      return
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, router])

  const { data: messages, refetch } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: async () => {
      const res = await client.messages.get({ query: { roomId } })
      return res.data
    },
  })

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async ({ text }: { text: string }) => {
      await client.messages.post({ sender: username, text }, { query: { roomId } })

      setInput("")
    },
  })

  useRealtime({
    channels: [roomId],
    events: ["chat.message", "chat.destroy"],
    onData: ({ event }) => {
      if (event === "chat.message") {
        refetch()
      }

      if (event === "chat.destroy") {
        router.push("/?destroyed=true")
      }
    },
  })

  const { mutate: destroyRoom, isPending: isDestroying } = useMutation({
    mutationFn: async () => {
      await client.room.delete(null, { query: { roomId } })
    },
  })

  const copyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopyStatus("copied")
    setTimeout(() => setCopyStatus("idle"), 2000)
  }

  return (
    <main className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Header */}
      <header className="border-b border-border p-4 flex items-center justify-between bg-card/30">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Room ID</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-green-500 truncate">{roomId.slice(0, 10) + "..."}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={copyLink}
                className="h-6 w-6"
              >
                {copyStatus === "copied" ? (
                  <Check className="size-3 text-green-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </Button>
            </div>
          </div>

          <Separator orientation="vertical" className="h-8" />

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Self-Destruct</span>
            <span
              className={`text-sm font-bold ${
                timeRemaining !== null && timeRemaining < 60
                  ? "text-red-500"
                  : "text-amber-500"
              }`}
            >
              {timeRemaining !== null ? formatTimeRemaining(timeRemaining) : "--:--"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button
            variant="destructive"
            size="default"
            onClick={() => destroyRoom()}
            disabled={isDestroying}
            className="font-bold"
          >
            <Bomb className="size-4" />
            {isDestroying ? "DESTROYING..." : "DESTROY ROOM NOW"}
          </Button>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {messages?.messages.length === 0 && (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
              <p className="text-muted-foreground text-sm font-mono">
                No messages yet, start the conversation.
              </p>
            </div>
          )}

          {messages?.messages.map((msg) => (
            <div key={msg.id} className="flex flex-col items-start">
              <div className="max-w-[80%] group">
                <div className="flex items-baseline gap-3 mb-1">
                  <span
                    className={`text-xs font-bold ${
                      msg.sender === username ? "text-green-500" : "text-blue-500"
                    }`}
                  >
                    {msg.sender === username ? "YOU" : msg.sender}
                  </span>

                  <span className="text-[10px] text-muted-foreground">
                    {format(msg.timestamp, "HH:mm:ss")}
                  </span>
                </div>

                <p className="text-sm text-foreground leading-relaxed break-all">
                  {msg.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/30">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 animate-pulse font-mono">
              {">"}
            </span>
            <Input
              ref={inputRef}
              autoFocus
              type="text"
              value={input}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim()) {
                  sendMessage({ text: input })
                  inputRef.current?.focus()
                }
              }}
              placeholder="Type message..."
              onChange={(e) => setInput(e.target.value)}
              className="pl-7 bg-background border-border"
            />
          </div>

          <Button
            onClick={() => {
              sendMessage({ text: input })
              inputRef.current?.focus()
            }}
            disabled={!input.trim() || isPending}
            className="font-bold"
          >
            {isPending ? "SENDING..." : "SEND"}
          </Button>
        </div>
      </div>
    </main>
  )
}

export default Page
