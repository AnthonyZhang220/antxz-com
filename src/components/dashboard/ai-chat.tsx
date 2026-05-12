"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Bot, Construction, SendHorizontal, Sparkles, Trash2, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MessageRole = "user" | "assistant";

type Message = {
	id: string;
	role: MessageRole;
	content: string;
	createdAt: Date;
};

function TypingIndicator() {
	return (
		<div className="flex gap-1 px-1 py-2">
			{[0, 1, 2].map((i) => (
				<span
					key={i}
					className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"
					style={{ animationDelay: `${i * 150}ms` }}
				/>
			))}
		</div>
	);
}

function ChatMessage({ message, youLabel, assistantLabel }: {
	message: Message;
	youLabel: string;
	assistantLabel: string;
}) {
	const isUser = message.role === "user";

	return (
		<div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
			<Avatar className="h-8 w-8 shrink-0 mt-0.5">
				<AvatarFallback className={cn(
					"text-xs font-semibold",
					isUser
						? "bg-primary text-primary-foreground"
						: "bg-muted text-muted-foreground"
				)}>
					{isUser ? <User className="size-4" /> : <Bot className="size-4" />}
				</AvatarFallback>
			</Avatar>
			<div className={cn("flex max-w-[75%] flex-col gap-1", isUser && "items-end")}>
				<span className="text-xs text-muted-foreground">
					{isUser ? youLabel : assistantLabel}
				</span>
				<div className={cn(
					"rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
					isUser
						? "rounded-tr-sm bg-primary text-primary-foreground"
						: "rounded-tl-sm bg-muted text-foreground"
				)}>
					{message.content}
				</div>
			</div>
		</div>
	);
}

export function AiChat() {
	const t = useTranslations("dashboard.search");
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isThinking, setIsThinking] = useState(false);
	const bottomRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isThinking]);

	const handleSend = async () => {
		const trimmed = input.trim();
		if (!trimmed || isThinking) return;

		const userMessage: Message = {
			id: crypto.randomUUID(),
			role: "user",
			content: trimmed,
			createdAt: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsThinking(true);

		// TODO: replace with real API call
		await new Promise((resolve) => setTimeout(resolve, 1200));
		const assistantMessage: Message = {
			id: crypto.randomUUID(),
			role: "assistant",
			content: t("errorMessage"),
			createdAt: new Date(),
		};
		setMessages((prev) => [...prev, assistantMessage]);
		setIsThinking(false);
		textareaRef.current?.focus();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			void handleSend();
		}
	};

	const handleClear = () => {
		setMessages([]);
		setInput("");
		textareaRef.current?.focus();
	};

	return (
		<div className="flex flex-col overflow-hidden h-full">			{/* ── WIP banner ───────────────────────────────────────── */}
			<div className="flex items-center justify-center gap-2 border-b bg-amber-50 px-4 py-2 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
				<Construction className="size-3.5 shrink-0" />
				<span>{t("wipBanner")}</span>
			</div>
			{/* ── Messages area ─────────────────────────────────── */}
			<div className="flex-1 overflow-y-auto px-4 py-6 lg:px-6">
				{messages.length === 0 ? (
					<div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
						<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
							<Sparkles className="size-7 text-primary" />
						</div>
						<div className="space-y-1.5">
							<p className="text-base font-semibold">{t("emptyTitle")}</p>
							<p className="max-w-xs text-sm text-muted-foreground">
								{t("emptyDescription")}
							</p>
						</div>
					</div>
				) : (
					<div className="space-y-6">
						{messages.map((message) => (
							<ChatMessage
								key={message.id}
								message={message}
								youLabel={t("you")}
								assistantLabel={t("assistant")}
							/>
						))}
						{isThinking && (
							<div className="flex gap-3">
								<Avatar className="h-8 w-8 shrink-0 mt-0.5">
									<AvatarFallback className="bg-muted text-muted-foreground text-xs">
										<Bot className="size-4" />
									</AvatarFallback>
								</Avatar>
								<div className="rounded-2xl rounded-tl-sm bg-muted px-4">
									<TypingIndicator />
								</div>
							</div>
						)}
						<div ref={bottomRef} />
					</div>
				)}
			</div>

			{/* ── Input bar ─────────────────────────────────────── */}
			<div className="border-t bg-background px-4 py-4 lg:px-6">
				<div className="mx-auto max-w-3xl">
					<div className="relative flex items-center gap-2 rounded-2xl border bg-muted/30 px-4 py-2 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/20 transition-[box-shadow,border-color]">
						{messages.length > 0 && (
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
								onClick={handleClear}
								tabIndex={-1}
							>
								<Trash2 className="size-3.5" />
								<span className="sr-only">{t("clearButton")}</span>
							</Button>
						)}
						<textarea
							ref={textareaRef}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={t("placeholder")}
							rows={1}
							className="max-h-36 flex-1 resize-none bg-transparent py-1 text-sm leading-6 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
							disabled={isThinking}
						/>
						<Button
							size="icon"
							className="h-8 w-8 shrink-0 rounded-xl"
							onClick={() => void handleSend()}
							disabled={!input.trim() || isThinking}
						>
							<SendHorizontal className="size-4" />
							<span className="sr-only">{t("sendButton")}</span>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
