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