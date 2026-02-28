/**
 * @core/user - User profile module
 *
 * Provides user API and hooks for profile management.
 */

// Export API functions and types
export {
  getUserInfo,
  updateUserInfo,
  updateUserPassword,
  maskUserPhone,
  type AppMemberUserInfoRespVO,
  type UpdateUserInfoRequest,
  type UpdatePasswordRequest,
  type ApiResponse,
} from './userApi';

// Export hooks
export {
  useUserInfo,
  useUpdateUserInfo,
  useUpdatePassword,
  useLogout,
} from './useUser';

// Export schemas
export {
  profileSchema,
  passwordSchema,
  type ProfileFormData,
  type PasswordFormData,
} from './profileSchemas';
