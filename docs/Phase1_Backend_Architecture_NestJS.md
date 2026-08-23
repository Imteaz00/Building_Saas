# Phase 1 backend architecture, NestJS

All-in-One Building Maintenance & Property Management SaaS.
Derived from *Functional Requirements by WBS v1.0*, 17 August 2026.

This describes module boundaries, layering and the cross-cutting mechanisms that the
requirements force. It is not a coding standard and it does not cover deployment.

---

## 1. What the requirements dictate

Five clauses in the document constrain the structure more than anything else. Everything
below follows from them.

**Company scope is enforced below the screen.** WBS 1.3.3 says no code path reads business
data without a company scope, and 1.3.4 says a cross-company read returns "not found", not
"forbidden". That rules out putting `where companyId` in controllers.

**No module sends a message.** WBS 2 opens by saying duplicated notification logic drifts,
and that every module raises an event rather than sending anything. So no feature module
imports the mailer, and no feature module imports `NotificationService` either.

**One payment path.** WBS 7.9.1 requires that allocation, receipt generation, invoice state
and ledger posting all sit outside the recording screen, because a future integration has to
call the same path. This is the strongest argument in the document for an application layer
that is separate from controllers.

**Statuses, permissions and reminder rules are data.** WBS 1.10.3 and 14.6 both say so, to
keep Phase 3 configurable workflows from becoming a rewrite. Hard-coded status enums in
service logic would break that promise.

**Background work is re-runnable.** WBS 14.4.2 requires every scheduled job to be safe to
re-run without duplicating output, and 6.3 requires the uniqueness that guarantees it to
live in the database rather than in the job.

---

## 2. Stack

I have picked these to make the document concrete. Change any of them and only section 6
needs rewriting.

| Concern | Choice | Why this one |
|---|---|---|
| Runtime | Node 22 LTS, TypeScript strict | |
| Framework | NestJS 11 | |
| Database | PostgreSQL 16 | Row-level security gives a second enforcement layer for WBS 1.3.3 |
| ORM | Prisma, or TypeORM if the team already knows it | Either works. Prisma's generated types make the derived-value rule easier to hold |
| Queue | BullMQ on Redis | Nest has a first-party BullMQ integration |
| Files | S3-compatible object storage, presigned URLs | WBS 3.2.3 wants time-limited links |
| PDF | A server-side renderer, decided at build time | WBS 6.10 needs the issued PDF frozen |
| Auth | JWT access token plus a database-backed session row | WBS 1.9.2 requires killing all sessions on password change, which a stateless JWT cannot do |

The session row is not optional. A password change has to end every session for that account,
so the token has to be checkable against something revocable.

---

## 3. Module map

One Nest module per WBS module. The document orders its modules so that each depends only on
the ones before it, and says a forward dependency means the decomposition is wrong. That
ordering is worth keeping in code, because it is checkable.

| Nest module | WBS | Owns | Imports |
|---|---|---|---|
| `PlatformModule` | 1.3, 14 | Company record, request context, scoped repository base, audit log | none |
| `IdentityModule` | 1 | Users, roles, permissions, sessions, activation and reset tokens, lockout | Platform |
| `NotificationModule` | 2 | Templates, event consumption, delivery records, in-app notifications, preferences | Platform, Identity |
| `DocumentModule` | 3 | Upload, storage keys, links, previews, time-limited access | Platform, Identity |
| `PropertyModule` | 4 | Buildings, units, unit defaults, announcements | Platform, Identity, Document |
| `TenancyModule` | 5 | Tenants, duplicate decisions, leases, charge lines, occupants, deposits | Platform, Identity, Document, Property |
| `BillingModule` | 6 | Billing schedule, invoices, lines, discounts, numbering, late fee rules | Platform, Property, Tenancy |
| `PaymentModule` | 7 | Payments, allocations, credits, receipts, receivables, reversal | Platform, Billing |
| `CollectionsModule` | 8 | Reminder rules, firing log, suppressions, follow-up tasks | Platform, Billing, Payment |
| `MaintenanceModule` | 9 | Requests, status workflow, assignment, visits, parts, costs, recharges | Platform, Property, Tenancy, Document |
| `LedgerModule` | 13 | Transactions, categories, expenses, period locks, dashboard, reports | Platform, all financial modules |
| `JobsModule` | 14.4.2 | Scheduler registration, run records, failure alerting | Platform |

`NotificationModule` sits at position 2 but nothing imports it. Feature modules raise events;
the notification module listens. Keeping it out of every import list is what stops a
developer from calling it directly six months from now.

Enforce the ordering with `dependency-cruiser` in CI rather than by asking people to remember
it. One rule, roughly: a module at rank N may import ranks below N and nothing above.

---

## 4. Directory layout

```
src/
  main.ts
  app.module.ts
  platform/
    context/            request context, AsyncLocalStorage store
    persistence/        prisma client, scoped repository base, transaction helper
    permissions/        permission guard, permission cache, matrix loader
    audit/              audit writer, permission-refusal interceptor
    events/             domain event bus, outbox writer, outbox drainer
    errors/             domain error types and the http filter that maps them
  modules/
    identity/
      identity.module.ts
      api/              controllers, DTOs, response mappers
      application/      use cases, one class per business action
      domain/           entities, state machines, domain events, invariants
      infrastructure/   repositories, external adapters
    tenancy/
      ...same four folders
    billing/
    payment/
    ...
  jobs/
    invoice-generation.job.ts
    reminder-evaluation.job.ts
    notification-dispatch.job.ts
    lease-state.job.ts
    invoice-overdue.job.ts
```

Four folders per module, and the dependency arrows point inward. `api` knows `application`.
`application` knows `domain` and repository interfaces. `infrastructure` implements those
interfaces. `domain` knows nothing else.

The point of `application` is not ceremony. It is that WBS 7.9.1 requires a payment to be
recordable by a controller today and by a webhook later, without either of them owning the
logic.

---

## 5. Layer rules

**Controllers** parse and validate input, resolve the acting user, call one use case, and map
the result. No business rules, no repository calls, no branching on record state.

**Use cases** hold the business rules, own the transaction boundary, and raise domain events.
One class per action, named after the action in the requirements: `ActivateLease`,
`RecordPayment`, `ReversePayment`, `VoidInvoice`, `VerifyWorkOrder`. When the requirements
say the Accountant applies a discount and a reason is mandatory (WBS 6.6.2), that rule lives
in `ApplyInvoiceDiscount` and nowhere else.

**Domain** holds entities, their invariants, and the state machines. The maintenance status
transitions in WBS 9.5.1 are a table, not a series of `if` statements scattered across
services:

```ts
// domain/maintenance/request-status.ts
export const TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  new:               ['assigned', 'cancelled'],
  assigned:          ['in_progress', 'waiting_for_parts', 'new', 'cancelled'],
  in_progress:       ['waiting_for_parts', 'completed', 'cancelled'],
  waiting_for_parts: ['in_progress', 'cancelled'],
  completed:         ['verified', 'in_progress'],
  verified:          ['closed'],
  closed:            [],
  cancelled:         [],
};
```

Lease states (WBS 5.5) and invoice states (WBS 6.8) get the same treatment. Storing them this
way is also what WBS 14.6 means by not precluding configurable workflows.

**Infrastructure** implements repositories. It is the only layer that touches Prisma.

---

## 6. Cross-cutting mechanisms

### 6.1 Company scoping

Two layers, because WBS 1.3.3 is absolute about it.

The first is a request context built from the JWT and held in `AsyncLocalStorage`, read by a
repository base class that adds `companyId` to every query. The second is Postgres row-level
security, with the connection setting `app.company_id` at the start of each request. If
someone writes a raw query and forgets the filter, RLS still refuses.

```ts
// platform/persistence/scoped.repository.ts
export abstract class ScopedRepository<T> {
  constructor(protected readonly db: PrismaService,
              protected readonly ctx: RequestContext) {}

  protected scope() {
    return { companyId: this.ctx.require().companyId };
  }
}
```

A record belonging to another company must surface as `NotFoundException`, never
`ForbiddenException` (WBS 1.3.4). Make that the default in the error filter so nobody has to
remember it at each call site.

### 6.2 Building scoping

Separate from company scoping and applied on top of it. Building Manager and Technician
accounts see only assigned buildings (WBS 1.2), and WBS 1.10.1 adds that a role holding
view-only rights on a financial module sees only its own buildings' figures.

The context carries `buildingIds: string[] | 'all'`. Repositories for building-attributed
records apply it. Reports and dashboard queries apply it too, which is easy to forget because
they usually bypass repositories.

### 6.3 Permissions

The matrices in WBS 1.10.1, 4.5, 6.12, 7.8 and 9.11 load from `role_permission` rows into an
in-memory cache at boot. A guard reads the decorator and checks the cache.

```ts
@RequiresPermission('invoicing', 'edit')
@Post(':id/discount')
applyDiscount(...) {}
```

Storing the matrix as rows rather than as a TypeScript constant is a Phase 1 requirement
(WBS 1.10.3), not an optimisation. Refusals write an audit entry with the acting user, the
attempted action and the target record (WBS 1.10.2), which is why the guard needs the audit
writer injected.

### 6.4 Domain events and the outbox

Feature modules raise events. They never call the notification module.

WBS 2.5.1 says a failure to send never blocks the business action, and WBS 2.3 says a
suppressed event still gets recorded so it stays distinguishable from an event that never
happened. Both point at a transactional outbox: the use case writes the event row inside the
same transaction as the business change, and a worker drains it.

```ts
// inside RecordPayment, in the same transaction
await this.outbox.write({
  eventKey: 'payment.received',
  targetType: 'payment',
  targetId: payment.id,
  payload: { tenantId, invoiceIds, amount },
});
```

Channel selection, template resolution, deduplication by event plus recipient plus channel
plus target, and the retry ladder all live in `NotificationModule`. Nothing about who
receives what belongs in `PaymentModule`.

An in-process `EventEmitter` is the wrong tool here. It loses events when the process dies,
and WBS 2.5.4 requires every attempt to be recorded and retained for the audit period.

### 6.5 Audit log

Explicit writes from use cases, not a blanket interceptor. WBS 14.2 wants before and after
values of changed fields, and an interceptor sitting at the HTTP boundary does not know which
fields the domain considers changed.

The exception is the two things that have no domain action behind them: sign-in outcomes and
permission refusals. Those come from the guard and the auth service.

The table takes inserts only. Revoke `UPDATE` and `DELETE` on it at the database role, so
that "append-only" is a property of the schema rather than a convention.

### 6.6 Number sequences

Invoice numbers (WBS 6.7), receipt numbers (WBS 7.4) and ticket numbers (WBS 9.3) all have to
run in an unbroken sequence with no reuse, including after a void.

A Postgres `SEQUENCE` will not do this. Sequences leave gaps when a transaction rolls back,
and WBS 6.7.3 says a gap in an invoice sequence is an audit question. Use a counter row and
take a row lock:

```sql
SELECT next_value FROM number_sequence
 WHERE company_id = $1 AND sequence_type = 'invoice' AND current_year = $2
   FOR UPDATE;
```

Allocate inside the transaction that issues the invoice, so a rollback returns the number. It
serialises invoice issue per company. At the volumes this system will see that costs nothing,
and the alternative fails an audit.

### 6.7 Documents

`DocumentModule` stores the file and returns an id. Parent modules create a `document_link`
row. A file inherits the permissions of its parent record (WBS 3.2.1), so the access check
runs against the parent, never against the file.

Two rules that are easy to miss. Invoice PDFs, receipts and vendor invoices cannot be deleted
at all (WBS 3.3.3), so the delete path needs the `is_financial_evidence` check rather than a
permission check. And the link model must allow several files per link, because WBS 3.5 says
Phase 3 versioning must not become a data migration.

---

## 7. Background jobs

| Job | Cadence | WBS | Idempotency guard |
|---|---|---|---|
| Invoice generation | daily | 6.3 | unique `(lease_id, period_start)` on `invoice` |
| Reminder evaluation | daily | 8.2 | unique `(reminder_rule_id, invoice_id)` on `reminder_firing` |
| Notification dispatch | continuous | 2.5 | unique `(event, recipient, channel, target)` on `notification_delivery` |
| Lease state refresh | daily | 5.5 | idempotent by construction, recomputes from dates |
| Invoice overdue refresh | daily | 6.8.4 | idempotent by construction |
| Deposit settlement task | on termination date | 5.10 | one task per lease |

Every guard is a database constraint. WBS 6.3 is explicit that uniqueness of lease plus period
lives in the data and not only in the job, so that a re-run after a failure cannot double-bill.
Application-level checks lose that race.

Each run writes a `background_job_run` row with a business date. A failed run alerts
Admin/Owner (WBS 14.4.2) and resumes from the leases not yet processed (WBS 6.3).

One detail worth building in from the start: WBS 14.4.3 says date boundaries are evaluated in
the company's configured time zone, not in UTC. An invoice due on the 5th must not go overdue
on the evening of the 4th because the server clock rolled over. Give the jobs a clock service
that returns the company's local business date, and never call `new Date()` inside job logic.

---

## 8. The payment recording path

WBS 7.9.1 is the one section that specifies internal structure rather than behaviour, so it
gets its own note.

```
POST /payments  ──┐
                  ├──▶  RecordPayment (use case)  ──▶  AllocatePayment
webhook (later) ──┘                                     ├─▶ invoice state recalculation
                                                        ├─▶ receipt generation
                                                        └─▶ ledger posting
```

Rules that follow, each of them checkable in review:

1. `RecordPayment` is the only writer of `payment` rows.
2. Allocation reads invoice balances and never reads payment method. A payment allocates the
   same way regardless of how the money arrived.
3. Invoice state transitions are driven by allocated amounts. No state logic branches on
   `method` or `source_channel`.
4. `(method, external_reference)` is unique, so a provider reporting the same transaction
   twice cannot create two payments.
5. `ReversePayment` is the only reversal path. A future chargeback uses it. Do not add a
   second one later.

Balance is derived, never stored (WBS 7.6). Compute it as issued minus voided minus allocated
plus reversed. The temptation to cache it on `tenant` will appear the first time a list view
is slow. A materialised view is the right answer to that, not a mutable column.

---

## 9. Ledger writes

Financial modules raise events. `LedgerModule` consumes them and writes transactions. It
never runs inside the request that caused it, and no feature module writes a transaction row
itself.

Transactions are insert-only (WBS 13.1.2). A correction is a reversing transaction naming the
one it corrects. Every transaction carries `source_type` and `source_id`, and every source
record can list what it produced, because the document requires the trace to run both ways.

Period locks (WBS 13.7) are enforced in the ledger write path. No transaction can be created,
reversed or backdated into a locked period, and an adjustment affecting a locked period lands
in the current open period referencing the original.

---

## 10. What Phase 2 plugs into

Nothing below needs a change to the modules above, which is the point of building them this
way.

- `VendorModule` (WBS 11) reuses the account lifecycle from `IdentityModule` and mirrors
  `AllocatePayment` for payables.
- `AssetModule` (WBS 4.4) adds a nullable `assetId` on maintenance requests and a service
  history view.
- `PreventiveMaintenanceModule` (WBS 10) reuses the WBS 9 status machine and cost model.
- `UtilityModule` (WBS 12) writes charge lines onto the next invoice through `BillingModule`.
- SMS and WhatsApp are new channel adapters inside `NotificationModule`. No feature module
  learns about them.
- Online payment is a second caller of `RecordPayment`.

---

## 11. Decisions I made that the document does not settle

These are mine, not the document's. Each changes the structure if you disagree.

1. **Rent is a charge line, not a column on `lease`.** WBS 5.2 lists rent as a field and then
   says recurring charges are held as lines rather than fixed fields. I took the second
   statement as governing. If rent stays a column, effective-dated rent changes (WBS 5.6) need
   their own history table.

2. **`role` is a column on `app_user`.** WBS 1.2 says one role per account, and flags the
   question of whether one person might need two. If the answer turns out to be yes, this
   becomes a join table and every permission check changes shape. Worth settling before build.

3. **Sessions are database-backed.** Follows from WBS 1.9.2. A pure JWT setup cannot end all
   sessions on password change.

4. **Transactional outbox rather than an in-process event emitter.** Follows from WBS 2.5.4
   and the retention requirement.

5. **Counter rows rather than Postgres sequences for numbering.** Follows from WBS 6.7.3.

6. **`unit_id` is nullable on `maintenance_request`.** WBS 4.2.1 makes common area a unit
   type, which suggests it should be mandatory, but WBS 9.9.3 talks about building history
   separately from unit history. Confirm which you want, because it decides whether every
   building gets a synthetic common-area unit at creation.

## 12. Open items in the document that change this architecture

Ordered by how much rework they cause if answered late.

1. **Accounting depth (WBS 13.2).** Category list, or a full chart of accounts with account
   codes. The document calls this the largest structural unknown in that module and it is
   right. It changes the transaction model, the reports and possibly the whole ledger module.
   Settle it first.

2. **Joint-and-several liability for co-tenants (WBS 5.1.2).** The document says this is a
   data-model decision, not a screen decision. If two tenants are each fully liable for the
   whole rent, invoices gain a many-to-many payer relationship and receivables change with it.

3. **Whether one person may hold two roles (WBS 1.2).** See item 2 in the previous section.

4. **Security parameters as a set (WBS 1.11.3).** Password rules, lockout threshold and
   duration, session timeout, and the validity periods for activation links, reset links and
   file download links. None of these change the structure, but all of them are needed before
   `IdentityModule` can be finished, and they arrive as one decision rather than six.

5. **Proration at lease start and end (WBS 6.5).** Changes the first invoice of every lease
   and the last invoice of every early termination.

6. **Ageing buckets (WBS 7.7).** Needed by receivables, collections and two reports.

7. **Audit retention against erasure on request (WBS 14.2).** The document notes these two
   pull against each other. They decide whether the audit log can be partitioned and dropped
   by date, or has to support selective redaction, which is a very different table.
