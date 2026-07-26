"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { sendContactMessageAction } from "@/lib/actions/contact";
import type { Locale, Messages } from "@/lib/i18n";

export function ContactMessageDialog({
  locale,
  messages,
  shopEmail,
}: {
  locale: Locale;
  messages: Messages;
  shopEmail: string;
}) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function openDialog() {
    setError(null);
    setSent(false);
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await sendContactMessageAction({
          locale,
          name,
          replyEmail,
          message,
        });
        if (!result.ok) {
          if (result.error === "rate_limited") {
            setError(messages.errorRateLimited);
          } else if (result.error === "validation") {
            setError(messages.errorGeneric);
          } else if (result.error === "not_configured") {
            setError(messages.contactNotConfigured);
          } else {
            setError(messages.contactSendFailed);
          }
          return;
        }
        setSent(true);
        setName("");
        setReplyEmail("");
        setMessage("");
      } catch {
        setError(messages.contactSendFailed);
      }
    });
  }

  return (
    <>
      {shopEmail ? (
        <button
          type="button"
          onClick={openDialog}
          className="mt-1 inline-block cursor-pointer break-all text-start text-base text-mm-primary hover:opacity-70"
          dir="ltr"
        >
          {shopEmail}
        </button>
      ) : (
        <button
          type="button"
          onClick={openDialog}
          className="mm-btn mt-2 cursor-pointer"
        >
          {messages.contactWriteUs}
        </button>
      )}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-md rounded-xl border border-mm-line bg-white p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 id={titleId} className="font-heading text-2xl text-mm-primary">
                {messages.contactWriteUs}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="cursor-pointer text-sm text-mm-secondary hover:opacity-70"
              >
                {messages.contactClose}
              </button>
            </div>

            {sent ? (
              <div className="space-y-4">
                <p className="text-sm text-mm-secondary">{messages.contactSent}</p>
                <button
                  type="button"
                  className="mm-btn cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  {messages.contactClose}
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-3">
                {shopEmail ? (
                  <p className="text-xs text-mm-secondary" dir="ltr">
                    → {shopEmail}
                  </p>
                ) : null}
                <label className="block space-y-1 text-sm text-mm-secondary">
                  <span>{messages.contactYourName}</span>
                  <input
                    required
                    maxLength={120}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mm-field w-full"
                    autoComplete="name"
                  />
                </label>
                <label className="block space-y-1 text-sm text-mm-secondary">
                  <span>{messages.contactYourEmail}</span>
                  <input
                    required
                    type="email"
                    maxLength={200}
                    value={replyEmail}
                    onChange={(e) => setReplyEmail(e.target.value)}
                    className="mm-field w-full"
                    dir="ltr"
                    autoComplete="email"
                  />
                </label>
                <label className="block space-y-1 text-sm text-mm-secondary">
                  <span>{messages.contactMessage}</span>
                  <textarea
                    required
                    maxLength={4000}
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mm-field w-full"
                  />
                </label>
                {error ? <p className="text-sm text-red-700">{error}</p> : null}
                <button
                  type="submit"
                  disabled={pending}
                  className="mm-btn w-full cursor-pointer disabled:opacity-60"
                >
                  {pending ? messages.contactSending : messages.contactSend}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
