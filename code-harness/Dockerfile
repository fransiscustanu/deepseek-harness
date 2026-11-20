# Code Harness base image: the DSH npm release on Node 24, rebranded as Code Harness.
#
# This branch carries the Code Harness patch stack on top of a DSH release tag.
# The stack is an overlay on the published npm release (same code as the tag):
# rebrand/ swaps the brand plugin's browser half, the web icons, title and
# manifest, and the product name in DSH's own text. The build fails if any of
# that text is left. Licence files keep their original notices (MIT).
FROM node:24-trixie-slim@sha256:af02d57b57719b9657a45199a79264a9437940cd55b3c7b3fc99615654f124a0
ARG DSH_VERSION=0.2.2-rc.3
# Tools the coding agent uses in the workspace. tini is the init process.
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates git python3 ripgrep tini \
 && rm -rf /var/lib/apt/lists/*
RUN npm install -g "@deepseek-ai/dsh@${DSH_VERSION}" \
 && npm cache clean --force \
 && dsh --version
COPY rebrand /opt/code-harness-rebrand
RUN node /opt/code-harness-rebrand/rebrand.mjs && rm -rf /opt/code-harness-rebrand
LABEL org.opencontainers.image.source=https://github.com/fransiscustanu/deepseek-harness \
      org.opencontainers.image.version=${DSH_VERSION}
USER node
WORKDIR /workspace
