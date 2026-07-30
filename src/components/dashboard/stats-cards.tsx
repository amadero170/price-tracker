import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  Package,
  TrendingDown,
  Clock,
} from "lucide-react";

interface StatsCardsProps {
  totalProducts: number;
  totalAlerts: number;
  averageDifference: number | null;
  lastUpdated: string;
}

export function StatsCards({
  totalProducts,
  totalAlerts,
  averageDifference,
  lastUpdated,
}: StatsCardsProps) {
  const formattedDate = new Date(lastUpdated).toLocaleString("es-MX", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const stats = [
    {
      label: "Productos monitoreados",
      value: totalProducts.toString(),
      icon: Package,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      label: "Alertas de precio",
      value: totalAlerts.toString(),
      icon: AlertTriangle,
      color: totalAlerts > 0 ? "text-red-400" : "text-green-400",
      bgColor: totalAlerts > 0 ? "bg-red-500/10" : "bg-green-500/10",
      borderColor:
        totalAlerts > 0 ? "border-red-500/20" : "border-green-500/20",
      subtitle:
        totalAlerts > 0
          ? `${totalAlerts} por debajo del precio de referencia`
          : "Sin alertas",
    },
    {
      label: "Δ Precio promedio",
      value:
        averageDifference !== null
          ? `${averageDifference > 0 ? "+" : ""}${averageDifference}%`
          : "—",
      icon: TrendingDown,
      color:
        averageDifference !== null && averageDifference < 0
          ? "text-red-400"
          : "text-green-400",
      bgColor:
        averageDifference !== null && averageDifference < 0
          ? "bg-red-500/10"
          : "bg-green-500/10",
      borderColor:
        averageDifference !== null && averageDifference < 0
          ? "border-red-500/20"
          : "border-green-500/20",
    },
    {
      label: "Última actualización",
      value: formattedDate,
      icon: Clock,
      color: "text-slate-400",
      bgColor: "bg-slate-500/10",
      borderColor: "border-slate-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className={`border ${stat.borderColor} bg-card/50 backdrop-blur-sm`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground">
                    {stat.subtitle}
                  </p>
                )}
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
