'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, ChevronLeft } from 'lucide-react';
import { useAddress } from '@/lib/address/useAddress';
import { useSelectedAddressStore } from '@/lib/address/addressStore';
import {
  AddressSkeleton,
  AddressEmptyState,
  AddressListItem,
} from '@/components/address';
import { Button } from '@/components/ui/button';
import type { Address } from '@/lib/address/addressApi';

/**
 * Address List Page
 * Story 5.9: Unified Address Management System
 *
 * Modes:
 * - Manage Mode (default): Click address -> edit; Click add -> create
 * - Select Mode (?mode=select): Click address -> select & return to callbackUrl
 */

export default function AddressListPage() {
  return (
    <Suspense fallback={<AddressListFallback />}>
      <AddressListPageContent />
    </Suspense>
  );
}

function AddressListFallback() {
  return (
    <div
      data-testid='address-list-page'
      className='flex flex-col min-h-screen bg-page-gradient'
    >
      <header className='sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100'>
        <div className='size-10 -ml-2' />
        <h1 className='text-lg font-semibold text-gray-900 flex-1'>收货地址</h1>
      </header>
      <main className='flex-1 p-4'>
        <AddressSkeleton />
      </main>
    </div>
  );
}

function AddressListPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse URL params for mode handling
  const mode = searchParams.get('mode') === 'select' ? 'select' : 'manage';
  const callbackUrl = searchParams.get('callbackUrl') || '';

  const { addresses, isLoading, isEmpty } = useAddress();
  const { selectedAddressId, setSelectedAddressId } = useSelectedAddressStore();

  // Page title based on mode
  const pageTitle = mode === 'select' ? '选择收货地址' : '收货地址管理';

  // Handle back navigation - always go to /profile if no callbackUrl
  const handleBack = () => {
    if (callbackUrl) {
      router.push(callbackUrl);
    } else {
      router.push('/profile');
    }
  };

  // Handle add new address
  const handleAddAddress = () => {
    const params = new URLSearchParams();
    if (mode === 'select') {
      params.set('mode', 'select');
    }
    if (callbackUrl) {
      params.set('callbackUrl', callbackUrl);
    }
    const queryString = params.toString();
    router.push(
      `/profile/addresses/new${queryString ? `?${queryString}` : ''}`
    );
  };

  // Handle main area click based on mode
  const handleMainClick = (address: Address) => {
    if (mode === 'select') {
      // Select mode: select this address and return
      // Store selected address ID in zustand store for persistence
      setSelectedAddressId(address.id);
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        router.back();
      }
    } else {
      // Manage mode: go to edit page
      router.push(`/profile/addresses/${address.id}`);
    }
  };

  // Handle edit click (always go to edit page)
  const handleEditClick = (address: Address) => {
    const params = new URLSearchParams();
    if (mode === 'select') {
      params.set('mode', 'select');
    }
    if (callbackUrl) {
      params.set('callbackUrl', callbackUrl);
    }
    const queryString = params.toString();
    router.push(
      `/profile/addresses/${address.id}${queryString ? `?${queryString}` : ''}`
    );
  };

  return (
    <div
      data-testid='address-list-page'
      className='flex flex-col min-h-screen bg-page-gradient'
    >
      {/* Header */}
      <header className='sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100'>
        <button
          data-testid='address-back-btn'
          onClick={handleBack}
          className='size-10 flex items-center justify-center -ml-2 text-gray-600 hover:text-gray-900'
        >
          <ChevronLeft className='size-6' />
        </button>
        <h1 className='text-lg font-semibold text-gray-900 flex-1'>
          {pageTitle}
        </h1>
        {!isEmpty && (
          <Button
            data-testid='add-address-btn-header'
            variant='ghost'
            size='sm'
            onClick={handleAddAddress}
            className='text-[#8b5cf6] hover:text-[#7c3aed] hover:bg-[#faf5ff]'
          >
            <Plus className='size-4 mr-1' />
            添加
          </Button>
        )}
      </header>

      {/* Content */}
      <main className='flex-1 p-4'>
        {isLoading ? (
          <AddressSkeleton />
        ) : isEmpty ? (
          <AddressEmptyState onAddClick={handleAddAddress} />
        ) : (
          <div className='space-y-3'>
            {addresses.map((address) => (
              <AddressListItem
                key={address.id}
                address={address}
                mode={mode}
                onMainClick={() => handleMainClick(address)}
                onEditClick={() => handleEditClick(address)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
