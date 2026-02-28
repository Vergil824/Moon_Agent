import { z } from "zod";

/**
 * Profile validation schemas
 * Story 5.5: AC 2 - Form validation rules
 */

/**
 * Profile update schema
 * - nickname: required, 1-20 characters
 */
export const profileSchema = z.object({
  nickname: z
    .string()
    .min(1, "昵称不能为空")
    .max(20, "昵称不能超过20个字符"),
  avatar: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

/**
 * Password change schema
 * - oldPassword: required, minimum 6 characters
 * - newPassword: required, minimum 6 characters (consistent with Story 1.5 registration rules)
 * - confirmPassword: must match newPassword
 */
export const passwordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(6, "密码至少需要6位"),
    newPassword: z
      .string()
      .min(6, "新密码至少需要6位"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "新密码不能与旧密码相同",
    path: ["newPassword"],
  });

export type PasswordFormData = z.infer<typeof passwordSchema>;

