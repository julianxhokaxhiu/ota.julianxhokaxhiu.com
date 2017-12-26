# Serverless LineageOS OTA
Fully Automated Serverless OTA Service for LineageOS

## Architecture

### Cloudflare

#### Page Rule

- **If the URL matches:** ota.julianxhokaxhiu.com/api/v1/\*/\*/\*
- **Then the settings are:** Forwarding URL - 301 Permanent Redirect - https://ota.julianxhokaxhiu.com/api/v1/$1/$2/index.json

### Github

```shell
$ npm install
$ npm run build
```
