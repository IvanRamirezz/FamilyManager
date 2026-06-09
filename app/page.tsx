"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/sidebar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { CreateGroupModal } from "@/components/dashboard/create-group-modal";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ExpiringGroups } from "@/components/dashboard/expiring-groups";
import { GroupsTable } from "@/components/dashboard/groups-table";
import { SolicitudesTable } from "@/components/solicitudes/solicitudes-table";
import { FormulariosView } from "@/components/formularios/formularios-view";

type View = "Dashboard" | "Grupos" | "Solicitudes" | "Formularios";

export default function DashboardPage() {
  const router = useRouter();
  const [activeView, setActiveView] =
    useState<View>("Dashboard");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
      } else {
        setChecking(false);
      }
    });

    const { data: listener } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (!session) router.replace("/login");
        }
      );

    return () => listener.subscription.unsubscribe();
  }, [router]);

  if (checking) {
    return (
      <main className="min-h-screen bg-[#071E26] flex items-center justify-center">
        <span className="text-white/40 text-sm">
          Cargando…
        </span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#071E26] text-white flex">
      <Sidebar
        activeView={activeView}
        onNavigate={(view: string) =>
          setActiveView(view as View)
        }
      />

      <section className="flex-1 p-8">
        {activeView === "Dashboard" && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold">
                Dashboard
              </h1>

              <p className="mt-2 text-white/60">
                Administra tus grupos Nintendo.
              </p>
            </div>

            <StatsCards />

            <div className="mt-6 grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <CreateGroupModal />
              </div>

              <RecentActivity />
            </div>

            <div className="mt-6">
              <ExpiringGroups
                onNavigate={(v) =>
                  setActiveView(v as View)
                }
              />
            </div>
          </>
        )}

        {activeView === "Grupos" && (
          <GroupsTable />
        )}

        {activeView === "Formularios" && (
          <FormulariosView
            onNavigate={(view) =>
              setActiveView(view as View)
            }
          />
        )}

        {activeView === "Solicitudes" && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold">
                Solicitudes
              </h1>

              <p className="mt-2 text-white/60">
                Personas que quieren unirse a un grupo.
              </p>
            </div>

            <SolicitudesTable />
          </>
        )}
      </section>
    </main>
  );
}
