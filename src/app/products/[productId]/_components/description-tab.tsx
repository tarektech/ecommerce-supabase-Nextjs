

import { Card, CardContent } from "@/components/ui/card";
import { useProduct } from '@/hooks/queries'

type DescriptionTabProps = {
    productId: string;
};
export function DescriptionTab({ productId }: DescriptionTabProps) {

    const { data: product } = useProduct(productId);

    if (!product) {
        return <div>Loading...</div>;
    }

    
    return (
        <Card>
        <CardContent className="p-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {product.description}
            </p>
            {product.sku && (
              <div className="border-border mt-4 border-t pt-4">
                <p className="text-muted-foreground text-sm">
                  <strong>SKU:</strong> {product.sku}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
}