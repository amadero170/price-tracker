"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PriceBadge } from "./price-badge";
import type { SitePriceGroup, PriceResult } from "@/types";
import {
  Globe,
  Lock,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Package,
} from "lucide-react";

interface SiteAccordionProps {
  siteGroups: SitePriceGroup[];
  searchQuery: string;
}

function filterResults(
  results: PriceResult[],
  query: string
): PriceResult[] {
  if (!query.trim()) return results;
  const lower = query.toLowerCase();
  return results.filter(
    (r) =>
      r.productName.toLowerCase().includes(lower) ||
      r.idh.toLowerCase().includes(lower) ||
      r.category.toLowerCase().includes(lower)
  );
}

function ActiveSiteHeader({ group }: { group: SitePriceGroup }) {
  return (
    <div className="flex items-center justify-between w-full pr-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/25">
          <Globe className="h-4 w-4 text-blue-400" />
        </div>
        <div className="text-left">
          <span className="font-semibold text-foreground">
            {group.site.name}
          </span>
          <p className="text-xs text-muted-foreground">
            {group.site.url.replace("https://", "")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="text-xs border-border/50 text-muted-foreground"
        >
          <Package className="h-3 w-3 mr-1" />
          {group.matchedCount}/{group.totalProducts}
        </Badge>
        {group.alertCount > 0 ? (
          <Badge className="bg-red-500/15 text-red-400 border border-red-500/30 text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {group.alertCount} alerta{group.alertCount > 1 ? "s" : ""}
          </Badge>
        ) : (
          <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Sin alertas
          </Badge>
        )}
        {group.averageDifference !== null && (
          <Badge
            variant="outline"
            className={`text-xs border-border/50 ${
              group.averageDifference < 0
                ? "text-red-400"
                : "text-emerald-400"
            }`}
          >
            Δ{" "}
            {group.averageDifference > 0 ? "+" : ""}
            {group.averageDifference}%
          </Badge>
        )}
      </div>
    </div>
  );
}

function InactiveSiteHeader({ group }: { group: SitePriceGroup }) {
  return (
    <div className="flex items-center justify-between w-full pr-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 border border-border/40">
          <Globe className="h-4 w-4 text-muted-foreground/80" />
        </div>
        <div className="text-left">
          <span className="font-medium text-muted-foreground/90">
            {group.site.name}
          </span>
          <p className="text-xs text-muted-foreground/70">
            {group.site.url.replace("https://", "")}
          </p>
        </div>
      </div>
      <Badge
        variant="outline"
        className="text-xs border-border/40 text-muted-foreground/70"
      >
        <Lock className="h-3 w-3 mr-1" />
        Próximamente
      </Badge>
    </div>
  );
}

function PriceTable({ results }: { results: PriceResult[] }) {
  if (results.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        No se encontraron productos con ese filtro.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50">
      <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[60px]">
              IDH
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Producto
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
              Precio Ref.
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
              Precio Sitio
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
              Δ
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
              Stock
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center w-[50px]">
              Link
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow
              key={result.idh}
              className={`border-border/30 transition-colors ${
                result.belowReference
                  ? "bg-red-500/5 hover:bg-red-500/10"
                  : "hover:bg-muted/30"
              }`}
            >
              <TableCell className="font-mono text-xs text-muted-foreground">
                {result.idh}
              </TableCell>
              <TableCell>
                <div>
                  <p
                    className={`font-medium text-sm ${
                      result.belowReference
                        ? "text-red-300"
                        : "text-foreground"
                    }`}
                  >
                    {result.productName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {result.category}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono text-sm text-muted-foreground">
                {result.referencePriceFormatted}
              </TableCell>
              <TableCell
                className={`text-right font-mono text-sm font-semibold ${
                  result.belowReference
                    ? "text-red-400"
                    : result.sitePrice !== null
                    ? "text-emerald-400"
                    : "text-muted-foreground"
                }`}
              >
                {result.sitePriceFormatted}
              </TableCell>
              <TableCell className="text-center">
                <PriceBadge
                  difference={result.priceDifference}
                  belowReference={result.belowReference}
                />
              </TableCell>
              <TableCell className="text-center">
                {result.sitePrice !== null ? (
                  result.inStock ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                  ) : (
                    <XCircle className="h-4 w-4 text-amber-400 mx-auto" />
                  )
                ) : (
                  <span className="text-muted-foreground/40">—</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {result.productUrl ? (
                  <a
                    href={result.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-blue-400"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span className="text-muted-foreground/40">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function SiteAccordion({
  siteGroups,
  searchQuery,
}: SiteAccordionProps) {
  const activeSites = siteGroups.filter((g) => g.site.active);
  const inactiveSites = siteGroups.filter((g) => !g.site.active);

  return (
    <div className="space-y-3">
      {/* Active sites */}
      <Accordion multiple>
        {activeSites.map((group) => {
          const filtered = filterResults(group.results, searchQuery);
          return (
            <AccordionItem
              key={group.site.id}
              value={group.site.id}
              className="border border-border/50 rounded-lg px-4 mb-3 bg-card/30 backdrop-blur-sm data-[state=open]:bg-card/50"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <ActiveSiteHeader group={group} />
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <PriceTable results={filtered} />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Inactive sites */}
      {inactiveSites.map((group) => (
        <div
          key={group.site.id}
          className="border border-border/40 rounded-lg px-4 py-4 bg-card/20 opacity-80 cursor-not-allowed"
        >
          <InactiveSiteHeader group={group} />
        </div>
      ))}
    </div>
  );
}
