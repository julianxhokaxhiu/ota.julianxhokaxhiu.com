# Serverless LineageOS OTA
Fully Automated Serverless OTA Service for LineageOS

## Patch Review required!

In order to work, this new Serverless methodology requires that the Updater app follows redirects.
A patch has already been submitted, if approved make sure your ROM build has it inside: [https://review.lineageos.org/#/c/200540/](https://review.lineageos.org/#/c/200540/)

## API Calls example

> Those API calls are just to show the potential of this Serverless stack.

Huawei Y635: [https://ota.julianxhokaxhiu.com/api/v1/hwY635/unofficial/2d0af02b32](https://ota.julianxhokaxhiu.com/api/v1/hwY635/unofficial/2d0af02b32)

## Architecture

This OTA Service is done using:

- Cloudflare: as CDN + Redirect handler for API URLs
- Github: as JSON storage for the API answers and code repository for the generation
- Travis: as CI to run the script for the generation
- Basketbuild: as ROM ZIP hosting with direct link availability

### Cloudflare

#### Page Rule

- **If the URL matches:** `ota.julianxhokaxhiu.com/api/v1/*/*/*`
- **Then the settings are:** `Forwarding URL - 301 Permanent Redirect - https://ota.julianxhokaxhiu.com/v1/$1/$2/index.json`

### Github

Code repository where the generation script lives. Two branches exists:

- **master** source code for the script and the `.travis.yml` automated instructions
- **gh-pages** the API responses you see ( including this page, if visited from https://ota.julianxhokaxhiu.com )

### Travis

The CI service is configured with the following environment variables:

- **GITHUB_TOKEN** the Github token required to push the content to the `gh-pages` branch
- **FTP_HOST** the hostname of the current chosen FTP provider
- **FTP_USER** the username to connect to the chosen FTP provider
- **FTP_PASS** the password to connect to the chosen FTP provider
- **OTA_BASEURL** the base URL for the download URLs inside the API answers ( in my case `https://basketbuild.com/uploads/devs/JulianXhokaxhiu` )

See [.travis.yml](.travis.yml) for more informations.

### Basketbuild

> **WARNING:** delete any other directory in the root folder. Only device folders are allowed!

All my ZIP files are uploaded inside to the device type directory ( eg. `/hwY635/lineage-14.1-20171226_235653-UNOFFICIAL-hwY635.zip` ).
