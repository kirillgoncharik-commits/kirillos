# КириллOS

Private project context, people, goals and resource index. Trello owns task status; Google Drive owns documents; this dashboard is a permission-filtered view.

## Develop

Node 22 or later. Run `npm ci`, `npm test`, `npm run build`, and `npm run dev`.

The public repository contains application code, a public encryption key and an encrypted snapshot. It must never contain contact lists, plaintext snapshots, account credentials or private source documents. The `.gitignore` deliberately protects `private/`, local environment files and private keys.

## Cloudflare

Connect this repository to a Worker named `kirillos`. Build command: `npm test && npm run build`. Deploy command: `npx wrangler deploy`. Production branch: `main`. Configure the runtime secrets described in `docs/operations.md` and protect the temporary workers.dev address with Cloudflare Access.

Without valid Access identity, configured audience/issuer and the private snapshot key, the API returns no project information. The shell contains no private records.

## Data updates

The operational project registry stays in the existing private Kirill OS Data spreadsheet. Work reads that registry plus fresh Trello data, validates a complete source snapshot, encrypts it with the public key and pushes `src/snapshot.enc.json`. Workers Builds delivers the new version. A source error must be represented as an error with the previous successful data retained, not an empty collection.

Encryption accepts a private local JSON input (never commit it):

```sh
node scripts/encrypt-snapshot.mjs private/snapshot.json
npm test
npm run build
```

## Meeting rule

Meeting context is request-only. Before scheduling a meeting, ask whether context is wanted. A manually created calendar meeting never triggers a prep brief, prep task, prep calendar block or preparation reminder. Meeting Prep Watch stays disabled.
