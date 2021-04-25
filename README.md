# GitHub Releases proxy

This is a simple Cloudflare Workers script that proxies requests to preconfigured assets hosted on GitHub Releases. This worker makes it possible to download GitHub Releases assets directly from web frontends using CORS, without any other intermediaries.

## Why?

Many open-source projects use GitHub Releases to host assets and build artifacts. It is a fast (backed by Amazon S3), free, and convenient solution, particularly for projects with larger assets. Sometimes, it may be desirable to download assets directly from the user’s browser — for example, when using a [web installer frontend](https://github.com/kdrag0n/android-install/) to install the product.

This is not possible as-is because of [GitHub's S3 settings](https://github.com/octokit/rest.js/issues/12), which do not return the CORS headers necessary for browsers to allow such requests. Responses from GitHub staff on the issue suggest that support for this use case is planned, but it is not currently available.

As a workaround, we can use Cloudflare Workers to implement a simple proxy with the correct CORS headers. Performance is a non-issue because most users are close to a Cloudflare edge node, which can download assets quickly from S3 and stream them to the client. This removes the need to serve identical copies of GitHub releases assets from another server, thus reducing bandwidth costs, release complexity, and maintenance overhead.

## Usage

Edit the configuration section at the top of `index.js` with your GitHub user/organization and CORS rules, then deploy the project with [Cloudflare Wrangler](https://github.com/cloudflare/wrangler).
