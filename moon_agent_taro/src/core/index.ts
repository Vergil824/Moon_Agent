/**
 * @core - Shared core package entry point
 *
 * This is the main entry point for the shared core package.
 * Re-exports all modules for convenient access.
 *
 * Usage:
 *   import { ApiResponse, useChatStore, formatPrice } from '@core';
 *   import { ApiResponse } from '@core/api';
 *   import { useChatStore } from '@core/stores';
 */

// API module
export * from "./api";

// Auth module
export * from "./auth";

// Cart module
export * from "./cart";

// Address module
export * from "./address";

// Order module
export * from "./order";

// Payment module
export * from "./payment";

// Schema definitions
export * from "./schemas";

// Zustand stores
export * from "./stores";

// Custom hooks
export * from "./hooks";

// Utility functions
export * from "./utils";

// UI Components
export * from "./components";
