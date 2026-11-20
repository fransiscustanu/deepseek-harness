# Code Harness base image

Built from this branch and pushed to the homelab registry (run `docker login registry.nobs.my.id` first):

```sh
docker build -t registry.nobs.my.id/code-harness/dsh:0.2.2-rc.3 code-harness
docker push registry.nobs.my.id/code-harness/dsh:0.2.2-rc.3
```

Code Harness pins the pushed digest in its Dockerfile. To upgrade, rebase this
branch onto the new DSH tag, bump `DSH_VERSION`, rebuild, push and rerun the
Code Harness acceptance suite.
