first review-invocie(d),money receipt(next)
1.category list should be come form admin panle. 
2. all document upload funcitons
3. all view with pdf functiosn
3.VAT/Tax, agetn commisoin calculation in air ticket
5. if you provide discount during money receipt then all will  be same as non discount only during discount acount balance amount and client transeciton will be after discount amount.
6.money recipt list page is not comming even if we have given user that page access

............2nd review...................
1. client management
    a, user role based, user details tabs,user name column
    b, vendor will not same fro all 3 type of invoice. it will be category of prouect basect that choiced during creation
    c. we are able to create air ticket from other invoice. we have to make sure this other ticket and invoice ticker are showing same calculation

    ..................3rd review(5/5/26)............
    a.passport page changes status email/message sending
    b.will do the bill adjustemtn combine parter later  key: "Combined", label: "Combined" 
    printr btnfucniton of account/statement
    Non-Invoice Income receipt
    e.void invoice of invice dettaisl page skipped now.
    f. have to work in invoice get by id api optimization(clitnt comming in arry , same other s)
    g,assign fy funciton skitpped in visa invoice. type table 
    h. Show Prev Due in this invoice? radio button comment for now, 
    i. money receipt page comment in non invoice for now


......................4th(5/14/26)....................
transport type table fix
script for employee,and tranpsort , agent, 
if we create any invoice with zero balance then it's not creeating any clietn transeciotn entry 

shifting all money transeciton t inc(update on time) insate of set(read-update-write)
while adding client it's asking for number even if auto field form gggole info
presentBalance of vendor table has to be same as client table presentBalance
..................................travil errors............
issue with VP-19281 --	Farhan Aviation Services--entry hoice TAFAZZAL HOSEN ar name
MR-0117 allocaiton issue
VP-70137 suppose to adjuste wiht anwar balance but it's done not happened. 
EXP-0003-600 tk but deducted form accoutnt 607 in account balance histoy (https://www.trabill.biz/accounts/account_statement/8201)
EXP-0026-1500 and enterd in history as a 1510tk

VP-79890,VP-55922,VP-14911,ADR-0032(5)	Tanvir Hasan bKash	Vendor Payment	5510 Habib Ullah Madical Due

auto reload not happenning here foolow this dashboard/accounts/statement/6a0f9f8c9ceed630b06b98d9
y primary and secondry color; from-[#005CC1] to-[#4099D9] wold you


.............................................5th(5/25/26)..................
api responsiving unnecessary data take only requried info. 
Transaction Charge comment in vendor advanc  return 
balance transfer avaialbe balnace not showing at the edit mode
change Status  of passport comment for now

[22/49] Migrating Passport: A06470888 (ID: 106048)...  
    - WARNING: Could not find local client for external ID "174076".

    [19/49] Migrating Passport: A18301728 (ID: 106724)...  
    - WARNING: Could not find local client for external ID "combined-4264".

    [47/49] Migrating Passport: A06091370 (ID: 100454)...  
    - WARNING: Could not find local client for external ID "167425".


    1/6/2026.....................
    Partial Cost of non invoice invoice commmented for now. 
    [bug] invoice should not be able to added with zero balance.
    have to add the created by and updated by firled in all moduels 

    donet keep unneseessary /empty data in db; /**

    1/no need to strore accoutn type id in db ,as we can get id from account id
    2.no need to stroe discount/transeciton empty/0 value in db,  
* Paste one or more documents here
*/

  "paymentMethod": {
    "$oid": "6a04073c73601487f0db2133"
  },
  "accountId": {
    "$oid": "6a1c7291c0e46e197b60bb51"
  },
  "amount": 20,
  "discount": 0,
  "allocatedAmount": 20,
  "remainingAmount": 0,
  "paymentDate": {
    "$date": "2026-06-01T00:00:00.000Z"
  },
  "note": "",
  "docOneName": "",
  "docTwoName": "",




  .........................4/6/26....................
  in our shared pringing function shuld have a compy log and other info
  sales report discoutn and service charge missing 
  report page inpute filed laval need 
other and visa type invoice money recive at the add time commented
delete the uploaded img when deletion form mongodb. 

Edit Advance Return payment method not getting seleced showing loadin,
venor payment specifinc ticket and spacific invoice comment for now,
advance return Transaction Charge shoudb be adjusted--
http://localhost:3000/dashboard/reports/sales-collection ticket no  formate issue. in report page


....................6/16/2026........................
Present Balance filed while addding invoice modal need see its funciton

created and preview page is not working in invoice add page.
aws img upload issue.it's not preving while doing money receipt

as we can edit after doing payment for non commions invoice, it has possible to mismatch between recorded an sales amount while editing

refund issue check, dropdwon optimizaton, 

if the invice amoint is dicimal 20.22 then inthe money receipt we are faicng issue like this 3.8999999999999986


Edit Advance Return account and payment method not getting selected
loading in advance return page

.........when we try to add empoyee form invoice page directly it's first modal comming over of top moval



.......Rainbow tours feedback..................

invoice need to changge as per given 

---

## ✈️ TODO: Flight Segment Architecture Migration (from `InvoiceTransport` to Embedded `ticketMetadata.flightSegments`)

### 1. Problem Statement:
- Currently, flight segments entered in the **Flight Segments tab** are saved into the `InvoiceTransport` (`invoice_transports`) collection.
- `InvoiceTransport` is meant for Umrah/Group road vehicle transfers (buses, cars, hotel-airport shuttles).
- Reusing `InvoiceTransport` with hacky fields (`transportType = "Flight: <flightNo>"`, `referenceNo = airlineId`) creates technical debt, requires cross-collection joins, and mixes road transport with IATA flight segments.

### 2. Industry-Standard Solution:
- In MongoDB, embed a `flightSegments` array directly inside `InvoiceItem.ticketMetadata` (and `InvoiceTicket`).
- An Air Ticket can have **1 or multiple segments** (e.g., Transit: `DAC -> DOH -> LHR`, Round-trip: `DAC -> JED -> DAC`, Multi-city).
- Embedding `flightSegments: [{ flightNo, from, to, airlineId, flyDate, departureTime, arrivalTime, class }]` inside `ticketMetadata`:
  1. Handles both single and multi-segment flights natively under 1 ticket/PNR.
  2. Requires 0 extra database joins (loaded atomically with the invoice item).
  3. Keeps `InvoiceTransport` exclusively for vehicle transfers.

### 3. Step-by-Step Migration Plan:
1. **Schema Update**:
   - Add `flightSegments` array sub-schema to `InvoiceItem.ticketMetadata` in `@/models/invoice-item.ts` and `InvoiceTicket` in `@/models/invoice-ticket.ts`.
2. **Modal Form Update**:
   - Update `NonCommissionFlightInformation`, `AddAirTicketModal`, `PremiumNonCommissionModal`, and `AddNonCommissionModal` to bind flight segments directly into `item.ticketDetails.flightSegments` / `item.flightSegments`.
3. **Backend Service Update**:
   - Update `invoiceService.ts` (`createInvoice`, `updateInvoice`, `createNonCommissionInvoice`, `updateNonCommissionInvoice`) to save segments into `ticketMetadata.flightSegments` instead of creating `InvoiceTransport` records.
4. **Data Migration Script**:
   - Run a migration script to copy existing `InvoiceTransport` records with `transportType: /^Flight:/i` into their respective `InvoiceItem.ticketMetadata.flightSegments` by matching `ticketId` / `invoiceId`.
5. **Clean Up**:
   - Delete the migrated flight records from `invoice_transports` so only genuine vehicle transfers remain.




Tier 5: System Notifications	Toast Viewports, Global Alerts	z-[9999]	Verified (always on top)
Tier 4: Floating Interactive Popups	Popovers, Comboboxes (UserSelection, ClientSelection, etc.), Select dropdowns, DatePickers, Dropdown menus, Tooltips, Context menus, Hover cards, Menubars	z-[1100]	Unified across all @/components/ui/*
Tier 3: Containers & Overlays	Ant Design Modals & Drawers (1000), Radix Dialogs, Sheets, Drawers (z-50)	z-50 – 1000	Verified
Tier 2: Navigation & Sticky Headers	Sidebars, Sticky Table Headers, Drag Handles	z-10 – z-20	Cleaned & Verified
Tier 1: Document Flow	Table rows, Runway Nodes, Cards, Content	z-auto / z-0	Cleaned (no inline leaks)