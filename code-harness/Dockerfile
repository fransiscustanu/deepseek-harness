# Code Harness base image: DeepSeek Harness on Node 24, without the browser desktop.
#
# This branch carries the Code Harness patch stack on top of tag dsh-v0.2.2-rc.3.
# The stack is currently empty, so the published npm release is the same code
# as the tag and is installed directly. When the first patch lands, replace the
# npm install with a source build of this branch.
FROM node:24-trixie-slim@sha256:af02d57b57719b9657a45199a79264a9437940cd55b3c7b3fc99615654f124a0
ARG DSH_VERSION=0.2.2-rc.3
# Tools the coding agent uses in the workspace. tini is the init process.
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates git python3 ripgrep tini \
 && rm -rf /var/lib/apt/lists/*
RUN npm install -g "@deepseek-ai/dsh@${DSH_VERSION}" \
 && npm cache clean --force \
 && dsh --version
LABEL org.opencontainers.image.source=https://github.com/fransiscustanu/deepseek-harness \
      org.opencontainers.image.version=${DSH_VERSION}
USER node
WORKDIR /workspace
