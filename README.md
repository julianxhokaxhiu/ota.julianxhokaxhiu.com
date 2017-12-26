# Serverless LineageOS OTA
Fully Automated Serverless OTA Service for LineageOS

## Architecture

This OTA Service is done using:

- Cloudflare: as CDN + Redirect handler for API URLs
- Github: as JSON storage for the API answers and code repository for the generation
- Travis: as CI to run the script for the generation
- Basketbuild: as ROM ZIP hosting with direct link availability

### Cloudflare

#### Page Rule

- **If the URL matches:** ota.julianxhokaxhiu.com/api/v1/\*/\*/\*
- **Then the settings are:** Forwarding URL - 301 Permanent Redirect - https://ota.julianxhokaxhiu.com/api/v1/$1/$2/index.json

### Github

```shell
$ npm install
$ npm run build
```

### Travis

The CI service is configured with the following environment variables:

- **GITHUB_TOKEN** the Github token required to push the content to the `gh-pages` branch
- **FTP_HOST** the hostname of the current chosen FTP provider
- **FTP_USER** the username to connect to the chosen FTP provider
- **FTP_PASS** the password to connect to the chosen FTP provider
- **OTA_BASEURL** the base URL for the download URLs inside the API answers ( in my case `https://basketbuild.com/uploads/devs/JulianXhokaxhiu` )

See [.travis.yml](.travis.yml) for more informations.

### Basketbuild

All my ZIP files are uploaded inside to the device type directory ( eg. `/hammerhead/lineage-14.1-20171224_000325-UNOFFICIAL-hammerhead.zip` ).
