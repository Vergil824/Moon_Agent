"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AddressForm } from "@/components/address/AddressForm";

/**
 * New Address Page
 * Story 5.9: Create new address
 */

export default function NewAddressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse URL params for callback handling
  const mode = searchParams.get("mode") === "select" ? "select" : "manage";
  const callbackUrl = searchParams.get("callbackUrl") || "";

  // Handle back navigation
  const handleBack = () => {
    const params = new URLSearchParams();
    if (mode === "select") {
      params.set("mode", "select");
    }
    if (callbackUrl) {
      params.set("callbackUrl", callbackUrl);
    }
    const queryString = params.toString();
    router.push(`/profile/addresses${queryString ? `?${queryString}` : ""}`);
  };

  // Handle form success
  const handleSuccess = () => {
    handleBack();
  };

  return (
    <div
      data-testid="new-address-page"
      className="flex flex-col min-h-screen bg-page-gradient"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
        <button
          data-testid="new-address-back-btn"
          onClick={handleBack}
          className="size-10 flex items-center justify-center -ml-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="size-6" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 flex-1">
          添加新地址
        </h1>
      </header>

      {/* Form Content */}
      <main className="flex-1 p-4">
        <AddressForm onSuccess={handleSuccess} onCancel={handleBack} />
      </main>
    </div>
  );
}

