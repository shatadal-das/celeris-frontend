"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  LayoutGrid,
  Loader2,
  LogOut,
  Trash2,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type GithubRepo = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
};

type Project = {
  id: number;
  user_id: number;
  repo_url: string;
  project_name: string;
  status: string;
  s3_bucket_path?: string;
  created_at: string;
};

export function Dashboard() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [fetchingRepos, setFetchingRepos] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [fetchingProjects, setFetchingProjects] = useState(true);

  // Fetch Repositories
  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/repos`,
          {
            credentials: "include",
          },
        );
        if (!response.ok) throw new Error("Failed to fetch repositories");
        const data = await response.json();
        setRepos(data);
      } catch {
        setFetchError("Could not load repositories.");
      } finally {
        setFetchingRepos(false);
      }
    };
    fetchRepos();
  }, []);

  // Fetch all projects initially
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/projects`,
          { credentials: "include" },
        );
        if (response.ok) {
          setProjects(await response.json());
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setFetchingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // Poll active projects
  useEffect(() => {
    const activeProjects = projects.filter(
      (p) => p.status === "QUEUED" || p.status === "BUILDING",
    );
    if (activeProjects.length === 0) return;

    const interval = setInterval(() => {
      activeProjects.forEach(async (p) => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/projects/${p.id}/status`,
            { credentials: "include" },
          );
          if (res.ok) {
            const data = await res.json();
            if (data.status !== p.status) {
              setProjects((prev) =>
                prev.map((proj) =>
                  proj.id === p.id ? { ...proj, status: data.status } : proj,
                ),
              );
            }
          }
        } catch (e) {
          console.error(`Failed to poll status for project ${p.id}`, e);
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/build`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ repo_url: repoUrl }),
        },
      );

      if (response.ok || response.status === 202) {
        toast.success("Build triggered successfully!");
        setRepoUrl("");
        const projRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/projects`,
          { credentials: "include" },
        );
        if (projRes.ok) {
          setProjects(await projRes.json());
        }
      } else {
        toast.error("Failed to trigger build.");
      }
    } catch {
      toast.error("An error occurred while triggering the build.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/projects/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (!response.ok) throw new Error("Failed to delete project");

      toast.success("Project deleted successfully");
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("An error occurred while deleting the project.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/";
    } catch {
      toast.error("Failed to logout");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "LIVE":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case "TERMINATED":
        return <XCircle className="h-4 w-4 text-red-400" />;
      case "BUILDING":
        return <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />;
      case "QUEUED":
      default:
        return <Clock className="h-4 w-4 text-amber-400 animate-pulse" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "LIVE":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "TERMINATED":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "BUILDING":
        return "text-indigo-400 bg-indigo-400/10 border-indigo-400/20";
      case "QUEUED":
      default:
        return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: Trigger Build */}
        <div className="lg:col-span-1 space-y-8">
          <Card
            className={cn(
              "relative w-full",
              "border border-white/10 bg-white/[0.04] backdrop-blur-xl",
              "shadow-[0_0_50px_-12px_rgba(120,119,198,0.12)]",
              "rounded-2xl",
            )}
          >
            <CardHeader className="space-y-2 pb-2 pt-8 px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20">
                  <Image
                    src={"/logo.png"}
                    alt="Celeris Logo"
                    height={36}
                    width={36}
                  />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold tracking-tight text-neutral-50">
                    Deploy Project
                  </CardTitle>
                  <CardDescription className="text-sm text-neutral-400">
                    Select a React.js repo which doesn't contain any package
                    manager lock file
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-8 pb-8 pt-4">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Repository
                  </label>
                  {fetchingRepos ? (
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-neutral-400">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                      Loading repositories…
                    </div>
                  ) : fetchError ? (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                      {fetchError}
                    </div>
                  ) : (
                    <Select
                      value={repoUrl}
                      onValueChange={(val) => setRepoUrl(val || "")}
                      required
                      disabled={loading}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 h-auto",
                          "text-sm text-neutral-200",
                          "transition-colors duration-150",
                          "hover:border-white/20 hover:bg-white/[0.06]",
                          "focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20",
                          "data-placeholder:text-neutral-500",
                        )}
                      >
                        <SelectValue placeholder="Select a repository…" />
                      </SelectTrigger>
                      <SelectContent
                        className={cn(
                          "rounded-xl border border-white/10 bg-neutral-900/95 backdrop-blur-xl",
                          "shadow-xl shadow-black/40",
                        )}
                      >
                        {repos.map((repo) => (
                          <SelectItem
                            key={repo.id}
                            value={repo.html_url}
                            className={cn(
                              "rounded-lg px-3 py-2.5 text-sm text-neutral-300 cursor-pointer",
                              "transition-colors duration-100",
                              "focus:bg-indigo-500/15 focus:text-neutral-50",
                            )}
                          >
                            {repo.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={
                    loading || fetchingRepos || !!fetchError || !repoUrl
                  }
                  className={cn(
                    "relative w-full rounded-xl px-4 py-3 h-auto text-sm font-medium",
                    "bg-gradient-to-r from-indigo-600 to-violet-600",
                    "text-white shadow-lg shadow-indigo-500/20",
                    "transition-all duration-200 ease-out",
                    "hover:from-indigo-500 hover:to-violet-500 hover:shadow-xl hover:shadow-indigo-500/25",
                    "active:scale-[0.98]",
                    "disabled:opacity-40 disabled:pointer-events-none",
                  )}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Trigger Build
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Main Content: Projects List */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 border border-white/10">
              <LayoutGrid className="h-4 w-4 text-neutral-400" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-50">
              Recent Projects
            </h2>
          </div>

          {fetchingProjects && projects.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
              <h3 className="text-lg font-medium text-neutral-200 mb-2">
                No projects yet
              </h3>
              <p className="text-sm text-neutral-500">
                Deploy your first project using the form.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className={cn(
                    "relative w-full overflow-hidden",
                    "border border-white/10 bg-white/[0.02] hover:bg-white/[0.04]",
                    "transition-colors duration-300 rounded-2xl",
                  )}
                >
                  <CardContent className="p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="text-base font-semibold text-neutral-100 truncate flex items-center gap-2">
                          {project.project_name || "Untitled"}
                        </h3>
                        <p className="text-xs text-neutral-500 truncate mt-1">
                          {project.repo_url.replace("https://github.com/", "")}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-wider shrink-0",
                          getStatusColor(project.status),
                        )}
                      >
                        {getStatusIcon(project.status)}
                        {project.status}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="text-xs text-neutral-500">
                        {new Date(project.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-4">
                        {project.status === "LIVE" && (
                          <a
                            href={`${process.env.NODE_ENV === "development" ? "http" : "https"}://${project.project_name}.${process.env.NEXT_PUBLIC_DOMAIN}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            Visit <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="text-neutral-500 hover:text-red-400 transition-colors focus:outline-none"
                          title="Delete Project"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
