import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface PriceBadgeProps {
  difference: number | null;
  belowReference: boolean;
}

export function PriceBadge({ difference, belowReference }: PriceBadgeProps) {
  if (difference === null) {
    return (
      <Badge variant="outline" className="text-muted-foreground border-border/50">
        <Minus className="h-3 w-3 mr-1" />
        N/A
      </Badge>
    );
  }

  if (belowReference) {
    return (
      <Badge className="bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/20">
        <ArrowDown className="h-3 w-3 mr-1" />
        {Math.abs(difference)}%
      </Badge>
    );
  }

  return (
    <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20">
      <ArrowUp className="h-3 w-3 mr-1" />
      +{difference}%
    </Badge>
  );
}
