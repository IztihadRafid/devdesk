import { auth, signOut } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Welcome, {session?.user?.name}</h1>
      <p className="text-muted-foreground mt-2">{session?.user?.email}</p>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
        className="mt-6"
      >
        <button
          type="submit"
          className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
        >
          Log out
        </button>
      </form>
    </main>
  );
}
