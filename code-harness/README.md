# Code Harness base image

Built from this branch and pushed to the homelab registry on the nuc:

```sh
docker build -t 127.0.0.1:5000/code-harness/dsh:0.2.2-rc.3 code-harness
docker push 127.0.0.1:5000/code-harness/dsh:0.2.2-rc.3
```

Code Harness pins the pushed digest in its Dockerfile. To upgrade, rebase this
branch onto the new DSH tag, bump `DSH_VERSION`, rebuild, push and rerun the
Code Harness acceptance suite.
