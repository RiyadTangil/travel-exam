# TravelHisab Application Modules and Features

This document summarizes the major modules in the TravelHisab application and the key features available in each module. It is written as a product-facing overview for business, onboarding, marketing, and internal documentation.

## 1. Dashboard

**Purpose:** Gives the agency owner or manager a quick view of business performance.

**Features:**
- Daily, monthly, and yearly performance overview.
- Sales amount, purchase amount, collection amount, payment amount, expense amount, and profit/loss cards.
- Total creditable/due and total advance indicators.
- Account balance summary by account type.
- Upcoming flight schedule list.
- Best client and best employee insights.
- Yearly sales, purchase, collection, and profit charts.
- Expense and client/vendor summary widgets.

## 2. Client Management

**Purpose:** Central place to manage all B2B and B2C clients.

**Features:**
- Add, edit, view, activate/deactivate, and manage clients.
- Store client name, phone, email, address, category, assigned user, opening balance, and credit limit.
- Auto-generate unique client IDs.
- Track client present balance as due or advance through transactions.
- Block deletion when a client has financial history.
- Client details page with tabs for details, invoices, payments, passports, and ledger.
- Filter clients by search, category, user, and status.
- Link client records with invoices, money receipts, passports, and ledger reports.

## 3. Client Categories

**Purpose:** Organizes clients into business categories.

**Features:**
- Create, edit, view, and delete client categories.
- Maintain category name and prefix.
- Use categories for filtering and classifying clients.
- Supports structured client management for corporate, individual, or custom agency segments.

## 4. Invoice Module

**Purpose:** Records sales and creates financial impact for clients and vendors.

**Features:**
- Manage multiple invoice types.
- Create, list, view, edit, and delete invoices.
- Auto-generate invoice numbers by invoice type.
- Track sales date, client, salesperson, agent, billing details, discount, service charge, net total, and payment status.
- Update client due automatically when invoices are created.
- Update vendor due automatically when invoice items include vendor costs.
- Support invoice-level money receipt and payment allocation.
- Soft-delete invoice data while reversing financial effects.

## 5. Invoice - Others

**Purpose:** Handles general travel agency service invoices outside air ticket, visa, or non-commission ticket flows.

**Features:**
- Add multiple product or service items.
- Track quantity, sales price, cost, vendor, and profit.
- Calculate billing totals, discount, service charge, and net total.
- Connect vendor cost with vendor ledger.
- Connect client payable amount with client ledger.

## 6. Invoice - Non Commission

**Purpose:** Handles non-commission ticket sales where vendor ticket cost and client sales price need detailed tracking.

**Features:**
- Record ticket-specific sales information.
- Store passenger, ticket, PNR, route, and journey-related data.
- Track vendor-wise ticket cost.
- Manage paid amount and due amount per ticket/vendor line.
- Support specific ticket-based vendor payments.
- Support client collections against ticket-related invoices.

## 7. Invoice - Air Ticket

**Purpose:** Specialized air ticket invoice module with travel-agency-specific margin calculations.

**Features:**
- Record gross fare, base fare, tax, commission, AIT, discount, extra fee, bonus, VAT, and other expenses.
- Auto-calculate tax from gross fare and base fare.
- Auto-calculate AIT as a percentage of gross fare.
- Auto-calculate commission and net commission.
- Calculate client price, purchase price, and agency profit.
- Track airline, airport, route, flight segment, passenger, ticket, and PNR data.
- Update client due and vendor due from ticket economics.
- Support air-ticket-specific reporting and refund workflows.

## 8. Invoice - Visa

**Purpose:** Handles visa-related sales and billing.

**Features:**
- Create and manage visa invoices.
- Store visa service details and billing information.
- Track client amount, vendor cost, and profit.
- Link visa invoice data with client ledger, vendor ledger, and reports.
- Edit and delete visa invoices with financial reversal rules.

## 9. Refund Module

**Purpose:** Manages refunds for air tickets and other products/services.

**Features:**
- Air ticket refund workflow.
- Other product/service refund workflow.
- Select invoice and related ticket/product lines for refund.
- Track refund charge from client and refund charge taken by vendor.
- Calculate refund return amount and refund profit.
- Store refund voucher, refund date, note, and refund type.
- Update client/vendor financial impact according to refund rules.

## 10. Money Receipt

**Purpose:** Records client collections and applies received money against invoices or advance balances.

**Features:**
- Create, list, view, edit, and delete money receipts.
- Support multiple payment targets: overall, advance, invoice, tickets, and adjust with due.
- Record payment date, client, account, payment method, paid amount, discount, manual receipt number, documents, and note.
- Increase account balance by received amount after discount.
- Reduce client due or increase client advance based on payment type.
- Auto-distribute overall receipts across due invoices.
- Hold advance receipts for future invoice adjustment.
- Allocate advance receipts later to invoices.
- Show invoice allocations from receipt details.
- Reverse account, client, invoice, and ledger effects on update/delete.

## 11. Client Advance Return

**Purpose:** Records money returned to a client from their advance balance.

**Features:**
- Create, list, view, edit, and delete client advance returns.
- Validate available client advance before return.
- Record return date, voucher number, client, account, amount, transaction charge, and note.
- Reduce client advance balance.
- Reduce company account balance by amount plus charge.
- Add matching client transaction ledger entry.

## 12. Vendor Management

**Purpose:** Central place to manage suppliers, airlines, vendors, and service providers.

**Features:**
- Add, edit, view, delete, activate, and deactivate vendors.
- Store name, mobile, email, address, status, opening balance, and present balance.
- Track vendor balance as due, advance, or settled.
- Block deletion when vendor balance is not settled.
- Link vendors with invoice cost lines, vendor payments, advance returns, and vendor ledger.
- Quick action to add payment when a vendor has an outstanding balance.

## 13. Vendor Payment

**Purpose:** Records payments made to vendors and updates vendor/account balances.

**Features:**
- Create, list, view, edit, and delete vendor payments.
- Support payment types: overall, advance, specific invoice/debit, and specific ticket.
- Record payment date, vendor, account, payment method, amount, transaction charge, AIT, documents, and note.
- Reduce vendor due or increase vendor advance based on payment type.
- Reduce account balance by amount plus charge and AIT.
- Allocate overall/advance payments against invoices.
- Select specific invoice/vendor cost lines for targeted payment.
- Select specific non-commission ticket lines for ticket-based payment.
- Show payment details, allocations, and related invoice/vendor lines.
- Reverse vendor, account, invoice-item, and ledger effects on update/delete.

## 14. Vendor Advance Return

**Purpose:** Records money returned by a vendor from an earlier vendor advance.

**Features:**
- Create, list, view, edit, and delete vendor advance returns.
- Record return date, voucher number, vendor, account, amount, and note.
- Reduce vendor advance balance.
- Increase company account balance.
- Add vendor-related transaction ledger entry.
- Reverse effects on update/delete.

## 15. Accounts

**Purpose:** Manages cash, bank, card, and other company financial accounts.

**Features:**
- Create, list, edit, and delete accounts.
- Store account name, account type, account number, bank name, branch, routing number, card number, and opening balance.
- Opening balance creates an opening bill adjustment entry.
- Prevent deletion when an account already has transactions.
- Track last/current balance automatically from financial modules.
- View account statement and account-specific transaction history.

## 16. Account Types

**Purpose:** Configures account categories used by the accounts module.

**Features:**
- Create, edit, list, and delete account types.
- Use account types to group cash, bank, mobile banking, card, or other account classes.
- Supports balance status reporting by account group.

## 17. Balance Transfer

**Purpose:** Records fund movement between company accounts.

**Features:**
- Create, list, edit, and delete balance transfers.
- Transfer money from one account to another.
- Record transfer date, sender account, receiver account, amount, transfer charge, and note.
- Reduce sender balance by amount plus charge.
- Increase receiver balance by amount.
- Create debit and credit ledger entries for the transfer.
- Reverse account and ledger effects on update/delete.

## 18. Balance Status

**Purpose:** Provides a current balance snapshot of company accounts.

**Features:**
- Show all active accounts and balances.
- Group balances by account type.
- Display subtotal per group and grand total.
- Useful for cash/bank position monitoring.

## 19. Transaction History and Account Statement

**Purpose:** Shows account-level debit/credit movements.

**Features:**
- Filter account transactions by account and date range.
- Show voucher number, account name, particulars, transaction type, debit, credit, running balance, and note.
- Print account transaction history.
- View individual account statements.
- Supports audit trail for money receipt, vendor payment, expense, transfer, income, and investment flows.

## 20. Bill Adjustment

**Purpose:** Handles manual and opening balance adjustments for accounts, clients, and vendors.

**Features:**
- Create and list bill adjustments.
- Adjust account, client, or vendor balances.
- Support debit and credit adjustment types.
- Create adjustment voucher numbers.
- Record adjustment date, target entity, amount, and note.
- Used automatically for opening balances.
- Reverse balance and ledger impact when deleted.

## 21. Non-Invoice Income

**Purpose:** Records income that is not tied to a sales invoice.

**Features:**
- Create, list, edit, and delete non-invoice income.
- Record voucher number, date, non-invoice company, account, amount, payment method, and note.
- Increase selected account balance.
- Add income transaction to ledger.
- Filter by search and date range.

## 22. Investments

**Purpose:** Records owner/company capital injection or investment.

**Features:**
- Create, list, edit, and delete investments.
- Record voucher number, date, company, account, amount, payment method, and note.
- Increase selected account balance.
- Add investment transaction to ledger.
- Filter by search and date range.

## 23. Expense Management

**Purpose:** Records office and operational expenses.

**Features:**
- Create, list, view, edit, and delete expenses.
- Record expense date, account, payment method, note, and one or more expense items.
- Support multiple expense heads/categories per voucher.
- Reduce selected account balance.
- Add expense transaction to account ledger.
- Filter expenses by search and date range.
- Reverse account and ledger impact on update/delete.

## 24. Expense Heads

**Purpose:** Configures expense categories.

**Features:**
- Create, list, edit, and delete expense heads.
- Use heads such as office cost, transport, fuel, salary support, utility, or custom categories.
- Load expense heads into expense entry forms.
- Helps expense reporting and cost classification.

## 25. Products and Product Categories

**Purpose:** Manages services/products sold through invoices.

**Features:**
- Create, list, edit, delete, and activate/deactivate products.
- Manage product categories.
- Assign products to categories.
- Use products in invoice line items.
- Track product/service-level sales in reports.

## 26. Passport Management

**Purpose:** Stores passenger passport and document information.

**Features:**
- Add, edit, view, and delete passports.
- Store passport number, passenger name, mobile, email, date of birth, issue date, expiry date, status, and note.
- Upload passport scan copy, image, and other documents.
- Show remaining validity/expiry information.
- Link passports with clients.
- Use passport information inside client details and invoice flows.

## 27. Agents

**Purpose:** Manages agency agents and commission information.

**Features:**
- Add, edit, view, and delete agents.
- Store agent name, mobile, email, photo, and commission rate.
- Use agents in invoice workflows.
- Track agent-related commission/payment impact through reports and invoice billing.

## 28. Employee Management

**Purpose:** Stores company employee information.

**Features:**
- Add, edit, list, and delete employees.
- Store employee name, department, designation, joining date, and status.
- Use employees as sales users or operational staff where applicable.
- Supports payroll and user assignment workflows.

## 29. Payroll

**Purpose:** Records employee salary payments.

**Features:**
- Create, list, edit, and delete payroll vouchers.
- Record salary date, employee, designation, payment method, account, base salary, attendance, gross salary, total salary, and documents.
- Track payroll as a business cost.
- Connect payroll payments with company accounts.

## 30. Reports

**Purpose:** Gives management visibility over sales, collections, purchase, payment, due, advance, and profit.

**Features:**
- Client ledger report.
- Vendor ledger report.
- Total client due/advance report.
- Total vendor due/advance report.
- Daily sales report.
- Monthly sales and earning report.
- Salesman and product report.
- Sales and collection report.
- Vendor-wise purchase and payment report.
- Salesman-wise collection report.
- Overall profit/loss report.
- Date range filters and searchable report views.
- Links from report rows back to invoices, clients, and ledgers.

## 31. Client Ledger Report

**Purpose:** Shows full debit/credit statement for a selected client.

**Features:**
- Filter by client and date range.
- Show date, particulars, voucher number, pax name, PNR, ticket number, route, pay type, debit, credit, balance, and note.
- Calculate total debit, total credit, and closing balance.
- Show client details card above the ledger.
- Support direct URL link with selected client.

## 32. Vendor Ledger Report

**Purpose:** Shows vendor cost, payment, and return statement.

**Features:**
- Filter by vendor and date range.
- Combine invoice cost lines with vendor payment/return transactions.
- Show date, particulars, voucher number, pax name, PNR, ticket number, route, pay type, debit, credit, balance, and note.
- Calculate total debit, total credit, and closing balance.
- Show vendor details card above the ledger.
- Support direct URL link with selected vendor.

## 33. Profit and Loss Report

**Purpose:** Shows the agency's financial performance over a date range.

**Features:**
- Calculate sales income.
- Calculate purchase/cost amount.
- Calculate service charge, refund profit, and non-invoice income.
- Calculate discounts, expenses, transaction charges, AIT, and agent payments.
- Show sales profit/loss and net profit/loss.
- Scope calculations by company and selected date range.

## 34. Reconciliation

**Purpose:** Supports account/business reconciliation checks.

**Features:**
- Generate reconciliation report.
- Compare recorded financial activity.
- Mark reconciliation as complete.
- Helps identify mismatch or pending accounting review.

## 35. Company Profile and Configuration

**Purpose:** Manages agency/company information and setup data.

**Features:**
- View and edit company profile.
- Store company name, contact information, address, business details, and branding information.
- Manage non-invoice companies used for non-invoice income and investment entries.
- Manage transport types.
- Manage product setup and client category setup.
- Manage company-specific settings used across the system.

## 36. Users and Roles

**Purpose:** Controls staff access and permissions.

**Features:**
- Create, list, edit, and delete users.
- Assign roles to users.
- Create, list, edit, and delete roles.
- Configure permissions for each route/module.
- Support compact permission storage to reduce session size.
- Automatically apply permissions to buttons and actions in the UI.
- Disable unavailable actions instead of hiding them, keeping layout stable.
- Prevent users from editing/deleting their own account through management screens.
- Auto sign-out inactive/deleted users on session refresh.

## 37. Authentication and Security

**Purpose:** Manages secure access to the application.

**Features:**
- Email/password sign-up and sign-in.
- Email verification.
- Forgot password and reset password.
- Google authentication support through Firebase/NextAuth setup.
- Company-aware session and permission handling.
- Protected dashboard routes.
- Status check route for application availability.

## 38. Subscription and Company Access

**Purpose:** Manages agency subscription status and access control.

**Features:**
- Show company subscription status.
- Support trial/subscription-related checks.
- Update subscription state from admin/company APIs.
- Restrict or manage access based on company status where configured.

## 39. Platform Admin

**Purpose:** Provides admin-level management outside normal agency operations.

**Features:**
- Admin dashboard.
- Company management.
- Registered agency review.
- Platform user management.
- Subscription management.
- Analytics area.
- Notifications area.
- Platform settings area.
- Separate admin sidebar and routes.

## 40. Reference Data

**Purpose:** Supplies reusable lookup data for travel agency operations.

**Features:**
- Airport lookup data.
- Airline lookup data.
- Transport type configuration.
- Product and category lookup.
- Account type lookup.
- Client category lookup.
- Vendor and user selection APIs.

## 41. File Uploads and Documents

**Purpose:** Handles document attachments across modules.

**Features:**
- Upload documents through API.
- Attach files to passports, receipts, payroll, and other financial records.
- Store scan copies, supporting documents, and images.
- Show file/document columns in list views.

## 42. Counters and Voucher Numbering

**Purpose:** Keeps document numbers consistent.

**Features:**
- Auto-generate voucher numbers for invoices, receipts, payments, expenses, transfers, income, investments, adjustments, and returns.
- Maintain counter collection for sequence tracking.
- Separate prefixes for different financial documents.
- Counter sync API support.

## 43. Audit and Financial Integrity Rules

**Purpose:** Protects accounting accuracy across the system.

**Features:**
- Updates financial modules through matching ledger entries.
- Uses debit/credit direction standards.
- Reverses old financial effects before applying updates.
- Blocks deletion for clients, vendors, or accounts when deletion would break financial history.
- Keeps running balances for account/client/vendor views.
- Uses company scoping so each agency sees its own data.

