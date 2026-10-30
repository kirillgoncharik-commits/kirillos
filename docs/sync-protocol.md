# Connector refresh protocol

The private registry is the existing owner-only Kirill OS Data spreadsheet. Its OS Projects, OS People, OS Memberships, OS Goals, OS Resources, OS Alerts, OS TaskLinks, OS Onboarding and OS SyncRuns tabs record resources, permissions, mappings and delivery evidence. IDs and contacts belong in the private registry, not in this public document.

1. Read current registry headers and rows. The latest successful OS SyncRuns entry stores `privateSnapshotFileId` in its detail JSON. Read that owner-only Drive file into an ignored private path as the previous baseline; never print its contents. Keep retained decisions and source observations unless a verified source supersedes them. Never overwrite the old Tasks, TaskEvents, CRM, Knowledge, personal or fitness records as part of a dashboard refresh.
2. Read every configured project board, including all pagination and its existing production child boards. Exclude passport cards identified by `КириллOS key: passport:`. Resolve task mappings through stable `legacy:t…` keys, not titles. Do not recreate cards after a timeout until a read confirms absence.
3. Read task discussions since the last successful cursor. Ask Kirill whether an unstructured request should become a task and whether a person should be contacted. Existing explicit assignments can be summarized and reconciled. Email replies remain drafts without a separate send instruction.
4. Compare current project membership and observed Drive/Trello permissions with OS Memberships. A pending invitation is not verified access. Flag missing or unexpected permissions; never broaden access, pay for seats or accept billing terms as a hidden repair.
5. Build private connector input for `scripts/assemble-snapshot.mjs`. Every complete board must set `complete:true` and its actual `observedAt`. Failed or partially paged sources must use `complete:false`; supply the last successful private snapshot when available. Never replace a failed source with an empty successful list.
6. Run assembly and `node scripts/encrypt-snapshot.mjs private/snapshot.json`. The public RSA key is sufficient for encryption; no runtime decryption secret is needed. Validate locally, run tests and build.
7. Commit only `src/snapshot.enc.json` to the current main head, using a parent/ref lease. Re-read the head after a conflict. Never commit private connector input, a plaintext snapshot, tokens, private keys or personal records.
8. Verify Git delivery and the Cloudflare build. Save the successful plaintext snapshot as an owner-only Drive baseline under the private project root, then record its returned `privateSnapshotFileId`, generation, commit, timestamps, counts and errors in OS SyncRuns. Verify the root has no project-team or public access before uploading the baseline. Never claim the dashboard is current merely because a scan ran or a commit was created. Retain the previous generation on failure and notify Kirill of a material stale-source issue. Assembly refuses incomplete sources without a baseline.

## Planning and reminders

Weekly: reconcile commitments, owners, priorities and results with Kirill; include collaboration with Margarita and Natalia where their project membership is confirmed. Monthly: close the current period and propose next month's goals. Daily: reconcile explicit day assignments and confirmed high-priority obligations for tomorrow, school materials/Moodle/journal updates and content publication state. Avoid duplicate scans and repeated alerts for unchanged risks. A passed time slot is not completion.

Meeting context is request-only. Never generate a prep brief, prep task, prep block or prep reminder just because a meeting exists or approaches. Ask whether context is wanted before scheduling a meeting on Kirill's behalf. Manually created meetings never trigger preparation.

Financial quiet mode takes precedence over ordinary reminder rules. Routine bank, Garna, Bybit and card movements, invoices and their deadlines are recorded only by the existing evening review in Games Group Transactions. Do not turn them into Trello tasks or routine notifications. Preserve current ownership, classification and fee rules; only an explicitly requested financial report or a confirmed critical incident is a notification exception.

## Onboarding gate

Send exactly one personalized startup message only after authentication, project URLs, folder permissions and board membership have been verified. Use each person's explicit email and their own projects. Store Gmail message ID and `onboarding-v1:<personId>` before any rerun; a failed or pending operation is not a sent message. Unknown emails, unconfirmed Games Group membership, pending paid-seat decisions and incomplete dashboard login remain blocked.
