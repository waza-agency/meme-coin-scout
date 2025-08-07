# Change Log

## [2025-01-07] Fix input field behavior and TypeScript build errors
**Description:** Fixed input field clearing issues and resolved TypeScript syntax errors for successful build
**Files affected:**
- src/components/FilterControls.tsx
- src/types/index.ts
- tsconfig.json
- src/utils/test-apis.ts
**Status:** ✅ Exitoso

**Details:**
- Fixed input field behavior to allow easy clearing while keeping number formatting with commas
- Removed orphaned code in types/index.ts causing syntax error at line 129
- Added vite/client types to tsconfig.json for import.meta.env support
- Removed references to deleted social-mentions service
- Excluded test files from build to avoid type errors
- Successfully migrated repository to https://github.com/waza-agency/meme-coin-scout.git

# Change Log

## [2025-08-06] Remove all social metrics and mentions analysis
**Description:** Removed all social mentions functionality including components, services, API endpoints, and types
**Files affected:** 
- src/App.tsx
- server.js
- src/components/CoinCard.tsx
- src/components/ContractAnalyzer.tsx
- src/types/index.ts
- src/utils/indicators.ts
- Removed: SocialMentionsIndicator.tsx, SocialMentionsError.tsx, SocialMentionsSetupHelper.tsx, ApiStatus.tsx
**Status:** ✅ Exitoso

**Details:**
- Removed Reddit API proxy endpoint from server.js
- Removed all social mentions services and API calls
- Removed social mentions components and their imports
- Removed social mentions types from types/index.ts
- Removed calculateSocialMentionsIndicator function from utils/indicators.ts
- Cleaned up all references to social mentions in CoinCard and ContractAnalyzer components