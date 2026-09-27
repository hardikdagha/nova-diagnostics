"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Mail, Send, X } from "lucide-react";
import { staffSupabase } from "@/lib/supabase/staffClient";

const SENDER_EMAIL = "contact@novadiagnosticslab.com";

export type AdminEmailDraft = {
  to?: string | null;
  recipientName?: string;
};

type AdminEmailContextValue = {
  openComposer: (draft?: AdminEmailDraft) => void;
};

const AdminEmailContext = createContext<AdminEmailContextValue | null>(null);

export function useAdminEmailComposer() {
  const context = useContext(AdminEmailContext);
  if (!context) throw new Error("useAdminEmailComposer must be used inside AdminEmailProvider");
  return context;
}

export function AdminEmailProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<AdminEmailDraft | null>(null);
  const [instance, setInstance] = useState(0);

  const openComposer = useCallback((nextDraft: AdminEmailDraft = {}) => {
    setDraft(nextDraft);
    setInstance((current) => current + 1);
  }, []);

  const closeComposer = useCallback(() => setDraft(null), []);

  return (
    <AdminEmailContext.Provider value={{ openComposer }}>
      {children}
      {draft ? (
        <EmailComposeDialog key={instance} draft={draft} onClose={closeComposer} />
      ) : null}
    </AdminEmailContext.Provider>
  );
}

export function AdminComposeEmailButton({ disabled = false }: { disabled?: boolean }) {
  const { openComposer } = useAdminEmailComposer();

  return (
    <button
      type="button"
      onClick={() => openComposer()}
      disabled={disabled}
      title="Compose email"
      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-[#0b2b45] transition hover:border-teal-300 hover:bg-teal-50/60 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Mail className="size-4" aria-hidden="true" />
      <span className="hidden md:inline">Compose email</span>
      <span className="sr-only md:hidden">Compose email</span>
    </button>
  );
}

function EmailComposeDialog({ draft, onClose }: { draft: AdminEmailDraft; onClose: () => void }) {
  const [to, setTo] = useState(draft.to?.trim() ?? "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const recipientRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    (draft.to?.trim() ? subjectRef : recipientRef).current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !sending) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [draft.to, onClose, sending]);

  async function sendEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!to.trim() || !subject.trim() || !message.trim()) {
      setError("Enter a recipient, subject, and message before sending.");
      return;
    }
    setSending(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !anonKey) throw new Error("email_not_configured");

      const { data: { session }, error: sessionError } = await staffSupabase.auth.getSession();
      if (sessionError || !session) throw new Error("unauthorized");

      const response = await fetch(`${supabaseUrl}/functions/v1/send-staff-email`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: anonKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: to.trim(),
          subject: subject.trim(),
          text: message.trim(),
        }),
      });

      const result = await response.json().catch(() => ({})) as { success?: boolean; error?: string };
      if (!response.ok || !result.success) {
        if (result.error === "email_not_configured") throw new Error("email_not_configured");
        if (result.error === "invalid_fields") throw new Error("invalid_fields");
        if (response.status === 401 || response.status === 403) throw new Error("unauthorized");
        throw new Error("send_failed");
      }

      setSent(true);
    } catch (sendError) {
      const code = sendError instanceof Error ? sendError.message : "send_failed";
      setError(
        code === "email_not_configured"
          ? "Email delivery is not configured on the server yet. Please contact the system administrator."
          : code === "unauthorized"
            ? "Your staff session could not be verified. Sign in again and retry."
            : code === "invalid_fields"
              ? "Check the recipient email, subject, and message, then try again."
            : "The email was not accepted for delivery. Please retry or use the lab’s usual email service.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#071a2b]/55 p-3 backdrop-blur-[2px] sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !sending) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-email-title"
        className="flex max-h-[min(92vh,820px)] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_24px_80px_rgba(4,20,37,0.24)]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-800">
              <Mail className="size-[18px]" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="admin-email-title" className="text-base font-semibold text-slate-950">
                {draft.recipientName ? `Email ${draft.recipientName}` : "Compose email"}
              </h2>
              <p className="mt-1 text-xs text-slate-500">Sent from {SENDER_EMAIL}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            title="Close composer"
            aria-label="Close email composer"
            className="flex size-9 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
          >
            <X className="size-[18px]" aria-hidden="true" />
          </button>
        </header>

        {sent ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700" aria-hidden="true">
              <Send className="size-5" />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-slate-950">Email accepted for delivery</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
              The mail service accepted the message for <span className="font-medium text-slate-800">{to.trim()}</span>.
            </p>
            <button type="button" onClick={onClose} className="btn-primary mt-6 min-w-32 justify-center">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={sendEmail} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
              {draft.recipientName && !draft.to?.trim() ? (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                  No email address is on this request. Enter the recipient manually to continue.
                </p>
              ) : null}

              <div>
                <label htmlFor="admin-email-from" className="mb-1.5 block text-xs font-semibold text-slate-600">From</label>
                <input
                  id="admin-email-from"
                  value={`Nova Diagnostics <${SENDER_EMAIL}>`}
                  readOnly
                  className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none"
                />
              </div>

              <div>
                <label htmlFor="admin-email-to" className="mb-1.5 block text-xs font-semibold text-slate-600">To</label>
                <input
                  ref={recipientRef}
                  id="admin-email-to"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  placeholder="patient@example.com"
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                />
              </div>

              <div>
                <label htmlFor="admin-email-subject" className="mb-1.5 block text-xs font-semibold text-slate-600">Subject</label>
                <input
                  ref={subjectRef}
                  id="admin-email-subject"
                  type="text"
                  required
                  maxLength={180}
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Subject"
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                />
              </div>

              <div>
                <label htmlFor="admin-email-message" className="mb-1.5 block text-xs font-semibold text-slate-600">Message</label>
                <textarea
                  id="admin-email-message"
                  required
                  maxLength={12000}
                  rows={10}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Write your message…"
                  className="w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                />
                <p className="mt-1 text-right text-[11px] tabular-nums text-slate-400">{message.length.toLocaleString("en-IN")} / 12,000</p>
              </div>

              <p className="rounded-md bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
                Send only information needed for this enquiry. Avoid including sensitive health details unless necessary.
              </p>
              {error ? <p role="alert" className="text-sm font-medium text-rose-700">{error}</p> : null}
            </div>

            <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button type="button" onClick={onClose} disabled={sending} className="btn-secondary justify-center">Cancel</button>
              <button type="submit" disabled={sending} className="btn-primary justify-center gap-2 disabled:cursor-wait disabled:opacity-60">
                <Send className="size-4" aria-hidden="true" />
                {sending ? "Sending…" : "Send email"}
              </button>
            </footer>
          </form>
        )}
      </section>
    </div>
  );
}
