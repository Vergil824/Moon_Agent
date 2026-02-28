# Core Package (@core)

Shared cross-platform module for Moon Agent Taro application.

## Directory Structure

```
src/core/
├── api/        # API client and network utilities
├── schemas/    # Zod schemas and type definitions
├── stores/     # Zustand state stores
├── hooks/      # Custom React hooks
├── utils/      # Utility functions
└── index.ts    # Main entry point
```

## Usage

### Import via alias

```typescript
// Import from main entry
import { formatPrice, useChatStore, ApiResponse } from '@core';

// Import from specific module
import { formatPrice } from '@core/utils';
import { useChatStore } from '@core/stores';
import { ApiResponse } from '@core/api';
```

## Dependency Rules (CRITICAL)

To prevent circular dependencies and ensure clean architecture:

### ✅ Allowed Dependencies

```
utils/    → (no internal dependencies)
schemas/  → utils/
api/      → utils/, schemas/
hooks/    → utils/, schemas/, stores/
stores/   → utils/, schemas/
```

### ❌ Prohibited Dependencies

1. **No cross-module imports between sibling modules**
   - `stores/` CANNOT import from `api/` or `hooks/`
   - `api/` CANNOT import from `stores/` or `hooks/`
   - `hooks/` CANNOT import from `api/`

2. **No importing from parent module**
   - Sub-modules CANNOT import from `@core` (index.ts)

3. **No platform-specific code in core**
   - Do NOT use `@tarojs/*` directly in core
   - Do NOT use Next.js specific APIs
   - Wrap platform APIs in adapters if needed

### Import Order Convention

```typescript
// 1. External packages
import { create } from 'zustand';

// 2. Core internal (only allowed dependencies)
import { generateId } from '../utils';
import type { Product } from '../schemas';

// 3. Local types/constants
import type { LocalType } from './types';
```

## Module Responsibilities

### api/
- API response types
- Error classes
- Request function stubs (implementation in Story 1.3)

### schemas/
- Type definitions (Zod schemas in future)
- Shared data structures
- Validation utilities

### stores/
- Zustand state stores
- Global state management
- NO side effects (no API calls in stores)

### hooks/
- Custom React hooks
- Reusable logic
- Platform-agnostic patterns

### utils/
- Pure utility functions
- No side effects
- No external dependencies

## Platform Compatibility

All code in `@core` must work on:
- ✅ H5 (Browser)
- ✅ WeChat Mini Program
- ✅ Taro RN (React Native)

Platform-specific implementations should be placed in:
- `src/adapters/` for platform adapters
- Component files with `.h5.tsx`, `.weapp.tsx`, `.rn.tsx` suffixes

