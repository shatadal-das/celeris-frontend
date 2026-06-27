import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-950 p-4">
      {/* Radial gradient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,rgba(120,119,198,0.2),transparent)]" />

      {/* Faint grid pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <Card
        className={cn(
          "relative z-10 w-full max-w-sm",
          "border border-white/10 bg-white/[0.04] backdrop-blur-xl",
          "shadow-[0_0_40px_-10px_rgba(120,119,198,0.15)]",
          "rounded-2xl"
        )}
      >
        <CardHeader className="space-y-3 pb-2 pt-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-white"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-neutral-50">
            Celeris
          </CardTitle>
          <CardDescription className="text-sm text-neutral-400">
            Sign in to start building at lightning speed.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-8 pt-4">
          <a
            href={`${process.env.API_ENDPOINT}/api/auth/github`}
            className={cn(
              "group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl px-4 py-2.5",
              "bg-neutral-50 text-neutral-950 font-medium text-sm",
              "transition-all duration-200 ease-out",
              "hover:bg-white hover:shadow-lg hover:shadow-white/10",
              "active:scale-[0.98]"
            )}
          >
            <GithubIcon className="h-4.5 w-4.5" />
            Continue with GitHub
          </a>

          <p className="mt-5 text-center text-xs text-neutral-500">
            By continuing, you agree to our terms of service.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
