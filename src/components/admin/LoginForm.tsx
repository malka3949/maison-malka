"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { adminUi } from "@/lib/admin-ui";

type LoginState = { error?: string };

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: LoginState, formData: FormData) => {
      const result = await loginAction(formData);
      return result ?? {};
    },
    {} as LoginState,
  );

  return (
    <div className={adminUi.loginShell}>
      <div className={adminUi.loginCard}>
        <p className="text-center font-heading text-sm font-medium tracking-widest text-mm-accent uppercase">
          Maison Malka
        </p>
        <h1 className={`${adminUi.h1} mt-2 text-center text-2xl`}>התחברות מנהל</h1>
        <p className={`${adminUi.muted} mt-2 text-center text-sm`}>ניהול קטלוג בוטיק</p>
        <form action={formAction} className="mt-8 space-y-4">
          <input type="hidden" name="next" value={nextPath} />
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-mm-primary">
              אימייל
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={adminUi.input}
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-mm-primary">
              סיסמה
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={adminUi.input}
            />
          </div>
          {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
          <button type="submit" disabled={pending} className={adminUi.btnPrimaryLg}>
            {pending ? "מתחבר..." : "התחברות"}
          </button>
        </form>
      </div>
    </div>
  );
}
