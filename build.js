const fs = require('fs-extra'),
      path = require('path'),
      uuid = require('uuid/v1'),
      JSFtp = require('jsftp'),
      ftpHost = process.env.FTP_HOST || 'speedtest.tele2.net',
      ftpUser = process.env.FTP_USER || 'anonymous',
      ftpPass = process.env.FTP_PASS || 'anonymous@',
      baseUrl = process.env.OTA_BASEURL || '',
      zipRegEx = /(cm|lineage)-([0-9\.]+)-([\d_]+)?-([\w+]+)-([A-Za-z0-9]+)?-?([\w+]+)?/,
      ftp = new JSFtp({
        host: ftpHost,
        user: ftpUser,
        pass: ftpPass
      }),
      res = {}

// Helpers
const getMD5Sum = ( filename ) => {
  return new Promise(
    ( resolve, reject ) => {
      ftp.raw(
        `XMD5 filename`,
        (err, res) => {
          if ( err )
            resolve('')
          else
            resolve( res )
        }
      )
    }
  )
}

const parseZipFilename = (filename, timestamp, md5) => {
  /**
   * [
      1 => [TYPE] (ex. cm, lineage, etc.)
      2 => [VERSION] (ex. 10.1.x, 10.2, 11, etc.)
      3 => [DATE OF BUILD] (ex. 20140130)
      4 => [CHANNEL OF THE BUILD] (ex. RC, RC2, NIGHTLY, etc.)
      5 =>
        CM => [SNAPSHOT CODE] (ex. ZNH0EAO2O0, etc.)
        LINEAGE => [MODEL] (ex. i9100, i9300, etc.)
      6 =>
        CM => [MODEL] (ex. i9100, i9300, etc.)
        LINEAGE => [SIGNED] (ex. signed)
      ]
   */
  const matches = filename.match(zipRegEx),
    deviceName = matches ? matches[5].toLowerCase() : 'foo',
    buildType = matches ? matches[4].toLowerCase() : 'bar',
    version = matches ? matches[2] : ''

  switch (buildType) {
    case 'unofficial':
      buildType = 'nightly'
      break
    case 'experimental':
      buildType = 'snapshot'
      break
    default:
  }

  if (!(deviceName in res)) res[deviceName] = {}
  if (!(buildType in res[deviceName])) res[deviceName][buildType] = []

  res[deviceName][buildType].push({
    // CyanogenMod
    'incremental': '',
    'api_level': '',
    'url': `${baseUrl}/${deviceName}/${filename}`,
    'timestamp': timestamp,
    'md5sum': md5,
    'changes': `${baseUrl}/${deviceName}/${path.basename(filename)}.txt`,
    'channel': buildType,
    'filename': filename,
    // LineageOS
    'romtype': buildType,
    'datetime': timestamp,
    'version': version,
    'id': uuid().replace('-', ''),
  })
}

const getEntries = ( dir ) => {
  return new Promise(
    ( resolve, reject ) => {
      ftp.ls(
        dir,
        (err, res) => {
          if ( err )
            reject( err )
          else
            resolve( res )
        }
      )
    }
  )
}

const parseEntries = async ( entries ) => {
  try {
    // Build res JSON
    for (let k in entries) {
      const entry = entries[k]

      if ( entry.type === 1 /* FTP_DIRECTORY */ ) {
        const newEntries = await getEntries( entry.name )
        await parseEntries( newEntries )
      } else {
        parseZipFilename( entry.name, entry.time, await getMD5Sum( entry.name ) )
      }
    }
  } catch ( ex ) {
    throw ex
  }
}

const dumpEntries = async () => {
  for ( var deviceType in res ) {
    for ( var buildType in res[deviceType] ) {
      const apiPath = `_dist/api/v1/${deviceType}/${buildType}`,
            entry = {
              id: null,
              error: null,
              response: res[deviceType][buildType]
            }

      await fs.ensureDir( apiPath )
      await fs.writeJson( `${apiPath}/index.json`, entry )
      await fs.copy( 'README.md', '_dist/README.md' )
    }
  }
}

const main = async () => {
  try {
    // Get main FTP directory files
    const entries = await getEntries( '/' )

    await parseEntries( entries )

    dumpEntries()

    ftp.destroy()
  } catch ( ex ) {
    throw ex
  }
}

main()
