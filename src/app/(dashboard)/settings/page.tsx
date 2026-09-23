"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleDeleteAccount() {
    const res = await fetch("/api/account/delete", { method: "DELETE" });
    const data = await res.json();

    if (!data.success) {
      setError(data.message);
      toast.error(data.message);
      return;
    }

    toast.success("Account deleted");
    await signOut({ callbackUrl: "/" });
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card className="mt-6 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-500">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 text-sm">
            Permanently delete your account. You must not own any projects —
            delete or transfer them first.
          </p>

          {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

          <AlertDialog>
            <AlertDialogTrigger className="border-input inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm text-red-500 hover:bg-red-500/10">
              Delete my account
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove you from all projects and permanently delete
                  your login. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </main>
  );
}
