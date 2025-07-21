"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  AlertTriangle,
  Eye,
} from "lucide-react";
import {
  adminProductService,
  ProductWithDetails,
  CreateProductData,
  UpdateProductData,
} from "@/services/admin/adminProductService";
import { formatCurrency } from "@/utils/formatCurrency";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { ProductFormModal } from "@/components/admin/ProductFormModal";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<ProductWithDetails | null>(null);
  const [deletingProduct, setDeletingProduct] =
    useState<ProductWithDetails | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await adminProductService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (productData: CreateProductData) => {
    try {
      await adminProductService.createProduct(productData);
      toast.success("Product created successfully");
      setShowCreateModal(false);
      fetchProducts();
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    }
  };

  const handleUpdateProduct = async (
    productId: string,
    productData: UpdateProductData,
  ) => {
    try {
      await adminProductService.updateProduct(productId, productData);
      toast.success("Product updated successfully");
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await adminProductService.deleteProduct(productId);
      toast.success("Product deleted successfully");
      setDeletingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Product Management
          </h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <Card key={product.product_id} className="overflow-hidden">
            <div className="relative h-48 bg-gray-100">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="text-muted-foreground flex h-full items-center justify-center">
                  <Package className="h-12 w-12" />
                </div>
              )}

              {/* Stock badge */}
              <div className="absolute top-2 right-2">
                {product.stock <= 5 ? (
                  <Badge
                    variant="destructive"
                    className="bg-red-100 text-red-800"
                  >
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Low Stock
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    In Stock
                  </Badge>
                )}
              </div>
            </div>

            <CardHeader>
              <CardTitle className="line-clamp-2 text-lg">
                {product.title}
              </CardTitle>
              <div className="flex items-center justify-between">
                <span className="text-primary text-2xl font-bold">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-muted-foreground text-sm">
                  Stock: {product.stock}
                </span>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                {product.description}
              </p>

              <div className="mb-4 space-y-2">
                {product.sku && (
                  <div className="text-muted-foreground text-xs">
                    SKU: {product.sku}
                  </div>
                )}
                {product.category && (
                  <div className="text-muted-foreground text-xs">
                    Category: {product.category.name}
                  </div>
                )}
                {product.total_reviews !== undefined && (
                  <div className="text-muted-foreground text-xs">
                    Reviews: {product.total_reviews}
                    {product.average_rating
                      ? ` (${product.average_rating}★)`
                      : ""}
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Link href={`/products/${product.product_id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-accent/80 flex-1 cursor-pointer transition-all hover:scale-105"
                  >
                    <Eye className="mr-2 h-3 w-3" />
                    View
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingProduct(product)}
                  className="hover:bg-accent/80 flex-1 cursor-pointer transition-all hover:scale-105"
                >
                  <Edit className="mr-2 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingProduct(product)}
                  className="cursor-pointer text-red-600 transition-all hover:scale-105 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="text-muted-foreground mb-2 text-lg font-medium">
              No products found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Try adjusting your search terms."
                : "Get started by adding your first product."}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="cursor-pointer transition-transform hover:scale-105"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <ProductFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProduct}
        title="Create New Product"
      />

      <ProductFormModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSubmit={(data) =>
          handleUpdateProduct(editingProduct!.product_id, data)
        }
        product={editingProduct}
        title="Edit Product"
      />

      <DeleteConfirmModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={() => handleDeleteProduct(deletingProduct!.product_id)}
        title="Delete Product"
        description={`Are you sure you want to delete "${deletingProduct?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
