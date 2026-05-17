"use client";

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

type Copy = {
  authLabel: string;
  signIn: string;
  signUp: string;
  signOutHint: string;
};

type AuthControlsProps = {
  copy: Copy;
};

export function AuthControls({ copy }: AuthControlsProps) {
  return (
    <div className="auth-group" aria-label={copy.authLabel}>
      <SignedOut>
        <SignInButton mode="modal">
          <button type="button" className="auth-toggle">
            {copy.signIn}
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button type="button" className="auth-toggle auth-toggle-secondary">
            {copy.signUp}
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <span className="auth-hint">{copy.signOutHint}</span>
        <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-10 h-10" } }} />
      </SignedIn>
    </div>
  );
}