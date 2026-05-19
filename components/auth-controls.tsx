"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

type AuthControlsProps = {
  language: "en" | "zh";
};

export function AuthControls({ language }: AuthControlsProps) {
  const text = language === "zh"
    ? {
        label: "账户",
        signIn: "登录",
        hint: "登录后可保存方案"
      }
    : {
        label: "Account",
        signIn: "Sign in",
        hint: "Signed-in users can save plans"
      };

  return (
    <div className="auth-group" aria-label={text.label}>
      <SignedOut>
        <SignInButton mode="modal">
          <button type="button" className="auth-toggle auth-toggle-primary">
            {text.signIn}
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <span className="auth-hint">{text.hint}</span>
        <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-10 h-10" } }} />
      </SignedIn>
    </div>
  );
}