# BridgedAI Deployment Guard (`bridgedai-devsecops/deployment-guard-action`)

## What this action does

In **`integration: production`** (default), calls the public BridgedAI API:

**`POST /v1/enforcement/release-gate/evaluate`** on **`https://api.bridgedai.io`**

with your deployment **`environment`** and optional build/repo context. Use an **`access-token`** from `auth-action`.

Optionally compares **`deployed-artifact`** to **`approved-artifact-digest`** before the API call (digest pre-check).

## Integration modes

| `integration` | Behavior |
| --- | --- |
| `production` | Release gate API + optional digest pre-check |
| `mock` | Deterministic allow (tests/demos only) |
| `digest-only` | Local digest compare only — **no** BridgedAI API (legacy/portable demos) |

## Quick start (production)

```yaml
permissions:
  contents: read
  id-token: write

steps:
  - uses: bridgedai-devsecops/auth-action@v1.0.0
    id: auth
    with:
      tenant: ${{ vars.BRIDGEDAI_TENANT }}
      audience: ${{ vars.BRIDGEDAI_OIDC_AUDIENCE }}

  - uses: bridgedai-devsecops/deployment-guard-action@v1.0.0
    with:
      access-token: ${{ steps.auth.outputs.access-token }}
      tenant: ${{ vars.BRIDGEDAI_TENANT }}
      environment: production
      artifact-digest: sha256:…
      policy-id: my-deployment-policy
```

See `examples/basic.yml` for digest-only demos without OIDC.

## Inputs / outputs

See `action.yml`.
