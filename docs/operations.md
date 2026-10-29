# Operations

## Runtime configuration

Keep these values as Cloudflare runtime secrets, never build-time public variables:

- `SNAPSHOT_PRIVATE_KEY`: PKCS8 RSA private key matching `config/snapshot-public.pem`.
- `OWNER_EMAIL`: the system owner's exact email.
- `ACCESS_TEAM_DOMAIN`: exact `https://<team>.cloudflareaccess.com` issuer.
- `ACCESS_AUD`: audience tag of this Worker's Access application.

Cloudflare Access verifies email identity. The Worker independently verifies the signed JWT issuer, audience, expiry, key ID and signature; membership filtering happens after decryption on the server. Unsigned email headers are not trusted. Wildcard email domains are not a substitute for exact project membership.

## Sources and freshness

Each source records `observedAt`, `lastSuccessAt`, `status` and a project ID. A scheduled scan is not proof of successful delivery. Do not advance cursors on partial failures. Preserve earlier data while showing a source error. The site displays its data generation timestamp and flags old or failed sources.

## Migrate tasks

Use `legacyTaskId`/stable IDs for deduplication. Populate task mappings and verify cards before changing the project's canonical source. Do not move an obsolete task into the current week's commitments merely because it is overdue. Never infer completion from an elapsed calendar event.

## Workflow

Existing inbox, morning and evening automations must read the configured project boards. Update existing automation IDs instead of creating duplicate scans. Weekly planning is Monday 09:00 Europe/Podgorica. Month planning is on the last weekday. School reminders refer to explicitly assigned tasks, not automatic meeting preparation.

## Onboarding

Use the private project roster. Give each participant access only to their own project page, Drive folder and Trello board. Record observed permissions, pending invitations and verification separately. The system owner has explicitly authorized one personalized onboarding email after the working structure, links and permissions have been verified. Record Gmail message IDs and an onboarding key so reruns do not resend. Do not send before those conditions hold.

## Rollback

Revert to a known Git commit and redeploy; retain the runtime secrets. Keep the previous encrypted snapshot when a source fails. Restoring a dashboard does not revert Trello or Google Drive records. Preserve source event logs and task IDs.
