"use client";

import { useEffect, useState } from "react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { SearchFilter } from "@/components/dashboard/search-filter";
import { SiteAccordion } from "@/components/dashboard/site-accordion";
import type { PricesApiResponse } from "@/types";
import { Activity, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState<PricesApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchPrices = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await fetch("/api/prices");
      if (!res.ok) throw new Error("Error al obtener precios");
      const json = (await res.json()) as PricesApiResponse;
      setData(json);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar datos"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  // Overall average from the first active site
  const activeSite = data?.sites.find((s) => s.site.active);
  const avgDiff = activeSite?.averageDifference ?? null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">
                  Fester Price Tracker
                </h1>
                <p className="text-xs text-muted-foreground -mt-0.5">
                  Monitoreo de precios en tiempo real
                </p>
              </div>
            </div>
            <button
              onClick={() => fetchPrices(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-card/50 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchPrices()} />
        ) : data ? (
          <>
            {/* Stats */}
            <StatsCards
              totalProducts={data.totalProducts}
              totalAlerts={data.totalAlerts}
              averageDifference={avgDiff}
              lastUpdated={data.lastUpdated}
            />

            {/* Search */}
            <SearchFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Sites */}
            <SiteAccordion
              siteGroups={data.sites}
              searchQuery={searchQuery}
            />
          </>
        ) : null}
      </main>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-card/30 border border-border/30"
          />
        ))}
      </div>
      {/* Search skeleton */}
      <div className="h-11 rounded-lg bg-card/30 border border-border/30" />
      {/* Accordion skeleton */}
      <div className="space-y-3">
        <div className="h-16 rounded-lg bg-card/30 border border-border/30" />
        <div className="h-64 rounded-lg bg-card/30 border border-border/30" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-lg bg-muted/5 border border-border/20 opacity-50"
          />
        ))}
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
        <Activity className="h-8 w-8 text-red-400" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Error al cargar datos
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
}
