## Plan: Full UI + Server Stabilization Pass

Perform a balanced hardening pass across frontend and backend by fixing high-severity functional risks first, then addressing UX/polish and resilience, while preserving backward compatibility for existing clients and flows.

**Steps**
1. Phase 1 - Baseline and safety guardrails
1. Capture current behavior baseline for auth, cart, checkout, orders, admin, and profile flows so regressions are measurable before edits.
1. Confirm active backend architecture to modify is route-driven under server/routes via server/index.js, not legacy controller/model paths unless directly referenced. Depends on repository runtime fact validation.
1. Define compatibility policy: accept previous request shapes where possible, but normalize internally and log deprecation warnings for stricter future enforcement. Blocks all backend validation edits.
1. Phase 2 - Backend critical correctness and security (parallelizable by endpoint)
1. Standardize JWT payload handling in server/routes/auth.js and server/middleware/auth.js by supporting both id and userId during transition, then issuing a single canonical payload for newly-minted tokens. Depends on Step 3.
1. Harden order input validation in server/routes/orders.js: normalize quantity to integer, reject invalid/oversized payloads, and enforce bounded item counts/amount limits with backward-compatible error responses.
1. Close payment-order integrity gap between server/routes/stripe.js and server/routes/orders.js by validating payment linkage/status when provided, while preserving current non-Stripe flows behind a compatibility branch.
1. Ensure post-order cart consistency in server/routes/orders.js and server/routes/cart.js by clearing or reconciling cart state after successful order creation in a safe transactional sequence.
1. Align password policy checks across server/routes/users.js, server/controllers/authController.js, and middleware validators so login/register/change-password logic is consistent without breaking existing users immediately.
1. Phase 3 - Frontend functional + UX polish (parallelizable by domain)
1. Fix checkout/cart correctness issues in client/src/pages/CheckoutPage.js and client/src/components/cart/CartItem.js (remove timing race, normalize cart item identity handling, and protect against stale state updates).
1. Refactor auth/loading experience in client/src/context/AuthContext.js and client/src/components/auth/ProtectedRoute.js to avoid flicker and stale effect dependencies while keeping current token behavior compatible.
1. Improve form quality in client/src/components/cart/CheckoutForm.js and auth forms by centralizing validation rules/messages and linking field-level errors to accessible semantics.
1. Add frontend resilience in client/src/services/api.js: environment validation, retry policy for retryable failures, and sanitized production-safe logging.
1. Phase 4 - UI polish and performance pass
1. Add practical accessibility upgrades across key screens in client/src/pages and shared components: labels for icon controls, aria-invalid and describedby links, and live-region announcements for loading/errors.
1. Improve rendering performance in client/src/pages/ProductsPage.js and product card components by debounced search, stable list keys, and lazy/responsive image loading strategy.
1. Add app-level crash containment with an error boundary in client/src/App.js and ensure actionable fallback UX.
1. Phase 5 - Verification, regression checks, and signoff
1. Backend verification: run route-level API checks for auth/order/cart/admin/stripe including negative tests for malformed payloads, unauthorized access, and race-sensitive flows.
1. Frontend verification: validate guest-to-user cart merge, checkout success/failure paths, auth redirects, accessibility smoke checks, and mobile responsiveness.
1. Run project test/lint/build commands for root, client, and server; compare against baseline and ensure no new critical diagnostics.
1. Produce final issue-to-fix mapping with any deferred non-critical items and rationale.

**Relevant files**
- d:/REACT/ecom/server/index.js - verify mounted route architecture and middleware order.
- d:/REACT/ecom/server/middleware/auth.js - JWT decode compatibility and canonicalization path.
- d:/REACT/ecom/server/routes/auth.js - token issuance and auth response shape.
- d:/REACT/ecom/server/routes/orders.js - quantity validation, payment linkage, cart reconciliation, payload bounds.
- d:/REACT/ecom/server/routes/cart.js - post-order cart consistency and stock messaging.
- d:/REACT/ecom/server/routes/stripe.js - payment intent validation boundaries.
- d:/REACT/ecom/server/routes/users.js - password change validation alignment.
- d:/REACT/ecom/server/middleware/validation.js - centralized password/input policy source.
- d:/REACT/ecom/client/src/context/AuthContext.js - auth check effect behavior and loading lifecycle.
- d:/REACT/ecom/client/src/components/auth/ProtectedRoute.js - redirect/loading UX behavior.
- d:/REACT/ecom/client/src/pages/CheckoutPage.js - cart clear timing and success flow.
- d:/REACT/ecom/client/src/components/cart/CartItem.js - cart item identity semantics.
- d:/REACT/ecom/client/src/components/cart/CheckoutForm.js - field validation and accessibility hooks.
- d:/REACT/ecom/client/src/services/api.js - env validation, retry policy, and production-safe logging.
- d:/REACT/ecom/client/src/pages/ProductsPage.js - debounce/filter performance and stable keys.
- d:/REACT/ecom/client/src/components/product/ProductCard.js - image loading strategy and fallbacks.
- d:/REACT/ecom/client/src/App.js - app-level error boundary integration.

**Verification**
1. Run backend tests and/or endpoint checks for: token issuance/verification, protected-route access, order creation with valid/invalid quantities, payment-linked order creation, admin route access control, and cart state after order.
1. Run frontend test/build checks, then manually test: browse products, add/remove/update cart, guest login merge, checkout happy path, checkout failure path, and order success.
1. Run accessibility smoke audit on key pages (home, product list, cart, checkout, login, profile/admin where applicable) and fix high-impact violations.
1. Run performance sanity checks for product listing/search and image-heavy views on desktop and mobile breakpoints.
1. Confirm production-like env configuration by validating API base URL behavior and error messaging when env is missing/misconfigured.

**Decisions**
- Priority: balanced frontend and backend execution.
- Scope includes full UI polish, not only bug fixes.
- Compatibility preference: preserve current clients when possible; use transitional parsing and non-breaking enforcement where feasible.
- Included: auth/cart/checkout/orders/admin/accessibility/performance/resilience.
- Excluded for this pass: schema redesign, major feature additions, and deep visual rebranding beyond practical polish.

**Further Considerations**
1. Payment strictness rollout recommendation: Phase A accept existing checkout payloads plus optional payment_intent_id, Phase B require verified payment_intent_id after client updates land.
1. Password policy migration recommendation: enforce strict policy for new/changed passwords now, keep legacy users valid until next password change.
1. Logging policy recommendation: replace broad console output with environment-gated logger and sanitized error surfaces.
