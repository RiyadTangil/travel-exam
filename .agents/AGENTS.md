# Agent Best Practices & Architectural Standards — TravelHisab ERP

## 1. Database & Model Standards (Mongoose / MongoDB)
- **MVC Architecture**: Models live in `@/models/`, Controllers in `@/controllers/`, Services in `@/services/`, API Routes in `@/app/api/`.
- **Numeric Enum Storage**: Store select/option fields as **numbers** in the database for storage and index optimization (e.g. `service: 1`, `stage: 1`, `priority: 1`, `source: 1`). Define bidirectional numeric ↔ string mappings in `@/lib/constants/` and format responses to string for frontend APIs.
- **No Extraneous Default Fields**: Do NOT populate omitted optional payload fields with dummy default values in DB documents. Keep optional fields truly optional (`undefined`/`null`).
- **Audit Columns**: Every primary business entity schema MUST include `createdBy` (`ref: "User"`) and `updatedBy` (`ref: "User"`).
- **Concise Field Names**: Use short, clear, normalized column names (`dest`, `val`, `paxAdult`, `paxChild`, `service`, `stage`).
- **Model Registration**: Register every new Mongoose model statically in `@/models/register-models.ts`.

## 2. API Response Formatting
- **Standardized Utility**: ALWAYS use `@/utils/api-response.ts` helper functions for API responses:
  - `ok(data, status, message, meta)`
  - `fail(error, status)`
  - `badRequest(message)`
  - `notFound(message)`
- **Response Structure**:
  ```json
  {
    "success": true,
    "message": "Success message",
    "statusCode": 200,
    "data": { ... },
    "meta": { "total": 100, "page": 1, "limit": 50 },
    "error": {}
  }
  ```

## 3. Frontend & State Management (TanStack Query)
- **Centralized Endpoints**: Define all API routes and Query Keys in `@/lib/api/api-endpoints.ts` under `ENDPOINTS`.
- **API Fetching**: Use `@/hooks/api/useList.ts` for list queries, `@/hooks/api/useMutationApi.ts` for mutations (POST/PUT/DELETE), and `@/lib/api/fetcher.ts` as the standard HTTP fetch client.
- **Cache Invalidation**: Always specify `invalidateKeys` in `useMutationApi` options to keep UI queries in sync automatically after mutations.

## 4. UI/UX Principles
- Use Tailwind CSS + Ant Design / Shadcn components.
- Keep forms minimal and context-focused (required fields at top, optional fields secondary).
- Build responsive, fast-loading, visually appealing interfaces with color-coded stage badges and intuitive quick actions.

## 5. Visa Processing & Tracker Architecture
- **Single Source of Truth**: All step definitions and fields for visa processing live in `@/components/visa-processing/visa-category-templates.ts` (`ALL_AVAILABLE_STEPS`, `VisaStep`, `StepField`).
- **No Duplicate Input Fields**: Never create parallel or duplicate input form fields outside of the step system. Always merge grid data with `ApplicantTracking.stepData[stepKey][fieldKey]` and `documents`.
- **Unified Sync**: Visa tracking grid tables and modal sheet components must remain synchronized around `ApplicantTracking` data structure (`stepData`, `stepPayments`, `documents`).

