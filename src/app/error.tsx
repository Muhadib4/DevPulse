"use client";
import { ErrorState } from "@/components/ui";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      error={
        new Error(
          "Something interrupted this view. Your saved notes and preferences remain in your browser.",
        )
      }
      retry={reset}
    />
  );
}
