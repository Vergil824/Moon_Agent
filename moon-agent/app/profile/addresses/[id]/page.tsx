"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import { AddressForm } from "@/components/address/AddressForm";
import { useAddressDetail, useDeleteAddress } from "@/lib/address/useAddress";
import { AddressSkeleton } from "@/components/address";
import { Button } from "@/components/ui/button";

/**
 * Edit Address Page
 * Story 5.9: Edit existing address
 */

export default function EditAddressPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const addressId = params.id ? Number(params.id) : null;

  // Parse URL params for callback handling
  const mode = searchParams.get("mode") === "select" ? "select" : "manage";
  const callbackUrl = searchParams.get("callbackUrl") || "";

  const { data: address, isLoading } = useAddressDetail(addressId);
  const deleteAddress = useDeleteAddress();

  // Handle back navigation
  const handleBack = () => {
    const urlParams = new URLSearchParams();
    if (mode === "select") {
      urlParams.set("mode", "select");
    }
    if (callbackUrl) {
      urlParams.set("callbackUrl", callbackUrl);
    }
    const queryString = urlParams.toString();
    router.push(`/profile/addresses${queryString ? `?${queryString}` : ""}`);
  };

  // Handle form success
  const handleSuccess = () => {
    handleBack();
  };

  // Handle delete
  const handleDelete = async () => {
    if (!addressId) return;
    
    const confirmed = window.confirm("确定要删除这个地址吗？");
    if (!confirmed) return;

    try {
      await deleteAddress.mutateAsync(addressId);
      handleBack();
    } catch {
      // Error handled by mutation hook
    }
  };

  return (
    <div
      data-testid="edit-address-page"
      className="flex flex-col min-h-screen bg-page-gradient"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
        <button
          data-testid="edit-address-back-btn"
          onClick={handleBack}
          className="size-10 flex items-center justify-center -ml-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="size-6" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 flex-1">
          编辑地址
        </h1>
        <Button
          data-testid="delete-address-btn"
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleteAddress.isPending}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="size-4 mr-1" />
          删除
        </Button>
      </header>

      {/* Form Content */}
      <main className="flex-1 p-4">
        {isLoading ? (
          <AddressSkeleton />
        ) : address ? (
          <AddressForm
            address={address}
            onSuccess={handleSuccess}
            onCancel={handleBack}
          />
        ) : (
          <div className="text-center py-16 text-gray-500">
            地址不存在
          </div>
        )}
      </main>
    </div>
  );
}

