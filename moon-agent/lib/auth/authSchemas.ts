import { z } from "zod";

// Phone number validation: 11 digits starting with 1
export const phoneSchema = z
  .string()
  .regex(/^1\d{10}$/, "请输入有效的11位手机号码");

// Password validation: 6-20 characters
export const passwordSchema = z
  .string()
  .min(6, "密码至少6位")
  .max(20, "密码最多20位");

// SMS code validation: 4-6 digits
export const smsCodeSchema = z
  .string()
  .regex(/^\d{4,6}$/, "请输入4-6位验证码");

// Login form schema
export const loginFormSchema = z.object({
  mobile: phoneSchema,
  password: passwordSchema
});

// Register form schema (SMS login)
export const registerFormSchema = z.object({
  mobile: phoneSchema,
  code: smsCodeSchema
});

// Type exports
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type RegisterFormData = z.infer<typeof registerFormSchema>;

