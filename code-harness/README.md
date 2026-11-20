# Code Harness base image

The DSH npm release on Node 24, rebranded as Code Harness. Built from this
branch and pushed to the homelab registry (run `docker login registry.nobs.my.id` first):

```sh
docker build -t registry.nobs.my.id/code-harness/dsh:<version>-brand code-harness
docker push registry.nobs.my.id/code-harness/dsh:<version>-brand
```

Code Harness pins the pushed digest in its Dockerfile and its test browser Dockerfile.

## Patch stack

`rebrand/rebrand.mjs` runs at image build, after `npm install`:

1. Replaces the browser half of `@deepseek-ai/dsh-client-ui-brand-official` with
   `rebrand/brand-client.js`: the `</>` mark and "Code Harness" in the sidebar
   and the home hero, no whale animation. The package id and slots stay.
2. Copies `rebrand/assets` over the web app's icons and sets the page title and
   manifest name.
3. Display patches: compiled UI code that shows npm package ids strips the
   `@deepseek-ai/` scope. Each anchor must match an exact count or the build fails.
4. Renames "DeepSeek Harness" to "Code Harness" in DSH's own JS, JSON and YAML
   (not source maps, sources or licence files) and fails if any is left.

Licence and notice files keep the original MIT notices. The DeepSeek account,
API and web-search plugins are disabled by Code Harness's cordis patches.

Regenerate the icons after changing the logo (on the Mac, uses `sips`):

```sh
python3 code-harness/rebrand/make-icons.py code-harness/rebrand/logo.png code-harness/rebrand/assets
```

## Upgrade

Create `code-harness/dsh-v<version>` from the new DSH tag, cherry-pick this
branch's commits, bump `DSH_VERSION`, build, push, pin, and run the Code Harness
acceptance suite. A failing display-patch anchor or leftover brand text stops
the build; see the Code Harness README for the rest.
