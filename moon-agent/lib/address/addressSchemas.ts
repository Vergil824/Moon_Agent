import { z } from "zod";

/**
 * Address Form Validation Schemas
 * Story 5.9: Form validation using Zod
 */

// Phone number validation: 11 digits starting with 1
export const phoneSchema = z
  .string()
  .regex(/^1\d{10}$/, "请输入有效的11位手机号码");

// Name validation: required, 2-20 characters
export const nameSchema = z
  .string()
  .min(2, "姓名至少2个字符")
  .max(20, "姓名最多20个字符");

// Detail address validation
export const detailAddressSchema = z
  .string()
  .min(5, "详细地址至少5个字符")
  .max(200, "详细地址最多200个字符");

// Area ID validation (must be positive number)
export const areaIdSchema = z.number().positive("请选择省市区");

// Full address form schema
export const addressFormSchema = z.object({
  name: nameSchema,
  mobile: phoneSchema,
  areaId: areaIdSchema,
  areaName: z.string().optional(), // Display only
  detailAddress: detailAddressSchema,
  defaultStatus: z.boolean(),
});

// Input type for form
export type AddressFormInput = z.input<typeof addressFormSchema>;
// Output type after validation
export type AddressFormData = z.output<typeof addressFormSchema>;

