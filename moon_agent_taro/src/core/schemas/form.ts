/**
 * Form validation schemas using Zod
 * 
 * Shared across H5, WeChat Mini Program, and Taro RN
 */

import { z } from 'zod'

// Login form schema
export const loginFormSchema = z.object({
  mobile: z
    .string()
    .min(1, '请输入手机号')
    .regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'),
  password: z
    .string()
    .min(1, '请输入密码')
    .min(6, '密码至少6位'),
})

export type LoginFormData = z.infer<typeof loginFormSchema>

// SMS login form schema
export const smsLoginFormSchema = z.object({
  mobile: z
    .string()
    .min(1, '请输入手机号')
    .regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'),
  code: z
    .string()
    .min(1, '请输入验证码')
    .length(4, '验证码为4位数字'),
})

export type SmsLoginFormData = z.infer<typeof smsLoginFormSchema>

// Sample feedback form for testing
export const feedbackFormSchema = z.object({
  name: z
    .string()
    .min(1, '请输入姓名')
    .max(50, '姓名最多50个字符'),
  email: z
    .string()
    .min(1, '请输入邮箱')
    .email('请输入有效的邮箱地址'),
  message: z
    .string()
    .min(1, '请输入留言内容')
    .min(10, '留言内容至少10个字符')
    .max(500, '留言内容最多500个字符'),
})

export type FeedbackFormData = z.infer<typeof feedbackFormSchema>

