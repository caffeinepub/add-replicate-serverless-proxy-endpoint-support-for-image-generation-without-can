# Specification

## Summary
**Goal:** Add a browser-only “Replicate / Proxy Endpoint” generation provider that supports public/proxy HTTP endpoints (including Replicate-style auth modes) without any canister-side HTTP calls or secret storage.

**Planned changes:**
- Add a new provider option in the Generation form for “Replicate / Proxy Endpoint” that uses the existing client-side (browser fetch) Custom API-style flow.
- Update the API configuration UI helper text to describe the proxy/public endpoint contract (POST JSON with `{"prompt":"..."}` and a JSON response containing an image URL) and clearly state secrets should not be stored in the canister.
- Extend the custom API request client UI/logic to allow selecting an Authorization header mode: no auth, `Authorization: Bearer <key>`, or `Authorization: Token <key>`, and apply it to browser requests.
- Persist new proxy/Replicate configuration fields client-side only (localStorage) and ensure no API keys/tokens are sent to or stored by the Motoko backend.
- Ensure the backend can store generation requests created with the new provider value using existing user checks (no new auth model changes).

**User-visible outcome:** Users can choose “Replicate / Proxy Endpoint,” configure a public/proxy endpoint (optionally with Bearer/Token auth), and generate images via direct browser-to-endpoint calls while keeping all secrets out of the canister.
