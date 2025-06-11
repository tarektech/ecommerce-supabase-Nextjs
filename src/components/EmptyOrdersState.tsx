import { Button } from '@/components/ui/button';

interface EmptyOrdersStateProps {
  onBrowseProducts: () => void;
}

export function EmptyOrdersState({ onBrowseProducts }: EmptyOrdersStateProps) {
  return (
    <div className="text-center p-8 border rounded-lg bg-muted/20">
      <p className="text-muted-foreground">
        You haven&apos;t placed any orders yet.
      </p>
      <Button className="mt-4" onClick={onBrowseProducts}>
        Browse Products
      </Button>
    </div>
  );
}
