import { ClipboardList } from "lucide-react";
import { SHOP_SCRIPT } from "../lib/staticData";
import { Card, SectionHeading } from "./ui";

export function ShopScript() {
  return (
    <Card className="p-4 sm:p-6">
      <SectionHeading
        icon={<ClipboardList className="h-5 w-5 text-accent" aria-hidden="true" />}
        title="Shop accountability script"
        description="Say these before you approve the work — it prevents 'replace parts and hope' repairs."
      />
      <ol className="space-y-3">
        {SHOP_SCRIPT.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{item.ask}</p>
              <p className="text-sm text-muted">{item.why}</p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
