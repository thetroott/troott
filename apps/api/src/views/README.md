# API views (Pug templates)

HTML email and health-check templates for `@troott/api`. Rendered with **Pug** via Express (`app.set('view engine', 'pug')`) and `pug.renderFile` in `email.service.ts`.

## Directory layout

```text
views/
├── base-email.pug          # Shared email shell (inline Troott logo, footer, blocks)
├── health-check.pug        # GET /api/v1/ JSON/HTML health page
├── preview/
│   └── preview.router.ts   # Dev preview routes (non-production only)
└── emails/
    ├── authentication/     # Auth, OTP, password flows
    ├── marketing/          # Newsletters, promos
    ├── subscriptions/      # Trial / billing
    ├── support/            # Support replies
    ├── transactional/      # Receipts, transactions
    ├── user/               # User lifecycle
    └── legal/              # Legal notices
```

## Preview templates in the browser (local)

1. Start the API:

   ```bash
   pnpm --filter @troott/api dev
   ```

2. Default base URL: `http://localhost:5025` (see `PORT` in `.env`).

3. Preview routes are mounted at **`/api/v1/preview`** when `APP_ENV` is **not** `production`.

### List all `.pug` files

```http
GET http://localhost:5025/api/v1/preview/templates
```

Returns JSON with relative paths (e.g. `emails/authentication/welcome`).

### Render an email template

Pattern:

```text
GET /api/v1/preview/{category}/{template}
```

Maps to `views/emails/{category}/{template}.pug`.

| Example URL | Template file |
| ----------- | ------------- |
| `/api/v1/preview/authentication/welcome` | `emails/authentication/welcome.pug` |
| `/api/v1/preview/authentication/verify-otp` | `emails/authentication/verify-otp.pug` |
| `/api/v1/preview/authentication/forgot-password` | `emails/authentication/forgot-password.pug` |
| `/api/v1/preview/marketing/discount` | `emails/marketing/discount.pug` |
| `/api/v1/preview/transactional/transactions` | `emails/transactional/transactions.pug` |

Open any URL in a browser to see rendered HTML.

### Override sample data

The preview router ships default sample locals (name, links, codes). Pass query params to override:

```text
http://localhost:5025/api/v1/preview/authentication/verify-otp?name=Ada&code=482910
```

### Health check template

```http
GET http://localhost:5025/api/v1/
```

Renders `health-check.pug` (API status JSON wrapper).

## How production emails use these files

`email.service.ts` compiles templates at send time:

```text
src/views/emails/{folder}/{template}.pug
```

Locals are passed from `email.service.ts` / preview routes. Template folder is chosen from the `EmailTemplate` enum / job payload.

After `pnpm build`, templates are copied to `dist/views/` (see `apps/api/package.json` `build` script).

## Editing guidelines

- Extend **`base-email.pug`** for new emails: `extends ../../base-email` then `block content`.
- Use **inline CSS** (tables + `style=` attributes) — email clients ignore external stylesheets.
- Logo: defined inline in **`base-email.pug`** as a base64 SVG data URI (`troottEmailLogo` constant).
- Test in browser via preview URL after every change.
- Optional: send a real test through SMTP/MailerSend in dev using the email queue.

## Security

Preview routes are **not registered in production** (`APP_ENV=production`). Do not enable them on public production hosts.
