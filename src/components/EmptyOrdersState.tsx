import { Button } from "@/components/ui/button";

interface EmptyOrdersStateProps {
  onBrowseProducts: () => void;
}

export function EmptyOrdersState({ onBrowseProducts }: EmptyOrdersStateProps) {
  return (
    <div className="bg-muted/20 rounded-lg border p-8 text-center">
      <p className="text-muted-foreground">
        You haven&apos;t placed any orders yet.
      </p>
      <Button className="mt-4 cursor-pointer" onClick={onBrowseProducts}>
        Browse Products
      </Button>
    </div>
  );
}
