import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Dashboard } from "@/components/Dashboard";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");

  if (!token) {
    redirect("/login");
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-start overflow-auto bg-neutral-950 p-4 pt-20">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="z-10 w-full max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Deployments</h1>
          <p className="text-neutral-400">Manage and monitor your projects.</p>
        </div>
        <Dashboard />
      </div>
    </main>
  );
}
