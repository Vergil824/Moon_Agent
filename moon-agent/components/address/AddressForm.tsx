"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateAddress, useUpdateAddress } from "@/lib/address/useAddress";
import { addressFormSchema, type AddressFormInput } from "@/lib/address/addressSchemas";
import { AreaPicker } from "./AreaPicker";
import type { Address } from "@/lib/address/addressApi";

/**
 * AddressForm - Form for creating/editing addresses
 * Story 5.9: AC 3 - Address Form Logic
 *
 * Uses react-hook-form + zod for validation
 * Note: Tencent Maps integration deferred per user request
 */

type AddressFormProps = {
  address?: Address; // If provided, edit mode
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
  const isEditMode = !!address;

  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<AddressFormInput>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      name: address?.name || "",
      mobile: address?.mobile || "",
      areaId: address?.areaId || 0,
      areaName: address?.areaName || "",
      detailAddress: address?.detailAddress || "",
      defaultStatus: address?.defaultStatus || false,
    },
  });

  const defaultStatus = watch("defaultStatus");

  const onSubmit: SubmitHandler<AddressFormInput> = async (data) => {
    try {
      if (isEditMode && address) {
        await updateAddress.mutateAsync({
          id: address.id,
          name: data.name,
          mobile: data.mobile,
          areaId: data.areaId,
          detailAddress: data.detailAddress,
          defaultStatus: data.defaultStatus,
        });
      } else {
        await createAddress.mutateAsync({
          name: data.name,
          mobile: data.mobile,
          areaId: data.areaId,
          detailAddress: data.detailAddress,
          defaultStatus: data.defaultStatus,
        });
      }
      onSuccess?.();
    } catch {
      // Error handled by mutation hooks
    }
  };

  const isPending = createAddress.isPending || updateAddress.isPending || isSubmitting;

  return (
    <form
      data-testid="address-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white rounded-xl p-4 border border-gray-100"
    >
      {/* Name Field */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          收货人 <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          data-testid="address-name-input"
          placeholder="请输入收货人姓名"
          {...register("name")}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Mobile Field */}
      <div className="space-y-2">
        <label htmlFor="mobile" className="text-sm font-medium text-gray-700">
          手机号码 <span className="text-red-500">*</span>
        </label>
        <Input
          id="mobile"
          data-testid="address-mobile-input"
          placeholder="请输入11位手机号码"
          maxLength={11}
          {...register("mobile")}
          className={errors.mobile ? "border-red-500" : ""}
        />
        {errors.mobile && (
          <p className="text-sm text-red-500">{errors.mobile.message}</p>
        )}
      </div>

      {/* Area Selection - Cascading Picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          所在地区 <span className="text-red-500">*</span>
        </label>
        <AreaPicker
          value={watch("areaId")}
          onChange={(areaId, areaName) => {
            setValue("areaId", areaId);
            setValue("areaName", areaName);
          }}
          error={!!errors.areaId}
          placeholder="请选择省市区"
        />
        {/* Hidden fields for form submission */}
        <input type="hidden" {...register("areaId", { valueAsNumber: true })} />
        <input type="hidden" {...register("areaName")} />
        {errors.areaId && (
          <p className="text-sm text-red-500">{errors.areaId.message}</p>
        )}
      </div>

      {/* Detail Address Field */}
      <div className="space-y-2">
        <label htmlFor="detailAddress" className="text-sm font-medium text-gray-700">
          详细地址 <span className="text-red-500">*</span>
        </label>
        <Input
          id="detailAddress"
          data-testid="address-detail-input"
          placeholder="请输入详细地址（街道、门牌号等）"
          {...register("detailAddress")}
          className={errors.detailAddress ? "border-red-500" : ""}
        />
        {errors.detailAddress && (
          <p className="text-sm text-red-500">{errors.detailAddress.message}</p>
        )}
      </div>

      {/* Default Address Toggle */}
      <div className="flex items-center justify-between py-2">
        <label htmlFor="defaultStatus" className="text-sm font-medium text-gray-700">
          设为默认地址
        </label>
        <button
          type="button"
          role="switch"
          aria-checked={defaultStatus}
          data-testid="address-default-switch"
          onClick={() => setValue("defaultStatus", !defaultStatus)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            defaultStatus ? "bg-[#8b5cf6]" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
              defaultStatus ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1"
          >
            取消
          </Button>
        )}
        <Button
          type="submit"
          data-testid="address-submit-btn"
          disabled={isPending}
          className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
        >
          {isPending ? "保存中..." : isEditMode ? "保存修改" : "添加地址"}
        </Button>
      </div>
    </form>
  );
}

export default AddressForm;

