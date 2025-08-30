# Assumptions & Edge Cases handled

## Assumptions
1. Each employee receives 20 total paid leaves per year (configurable).
2. Leaves are counted in full days (no half-day support in this MVP).
3. Leave types supported: `ANNUAL`, `SICK`, `UNPAID`.
4. Date format: `YYYY-MM-DD`.
5. No user authentication implemented in MVP (assume internal HR access).
6. SQLite is used for simplicity and offline use.

## Edge cases handled
1. **Overlapping leave requests**: Employee can have overlapping requests; approval logic does not allow approving if balance insufficient. Overlap checks can be added as improvement.
2. **Applying for past dates**: Backend rejects apply if `end_date` < `start_date` or if dates are in the past (simple check).
3. **Insufficient balance**: Approval will fail and mark request as `REJECTED` if balance insufficient.
4. **Multiple approvals**: Once status is not `PENDING`, approval/rejection is idempotent and returns appropriate message.
5. **Partial days / timezones**: Not handled in MVP.
6. **Concurrent approvals**: SQLite handles simple concurrency for small scale; in production use transactions or optimistic locking.

## Potential improvements (short)
- Role-based auth (HR/admin vs employee).
- Email notifications on apply/approve/reject.
- Half-day support and hourly leaves.
- Frontend React app and better UI (dashboard, charts).
- Deploy to Render/Heroku and use managed Postgres.
