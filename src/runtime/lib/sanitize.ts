// Sanitize filename
// Based on https://github.com/parshap/node-sanitize-filename/blob/master/index.js

const controlRe = /[\x00-\x1F\x80-\x9F]/g
const illegalRe = /[/?<>\\:*|"]/g
const reservedRe = /^\.+$/
const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i
const windowsTrailingRe = /[. ]+$/

export function sanitizeFilename (v: string): string {
  const replacement = ''
  if (typeof v !== 'string') {
    throw new TypeError('Input must be string')
  }
  return v.replace(illegalRe, replacement)
    .replace(controlRe, replacement)
    .replace(reservedRe, replacement)
    .replace(windowsReservedRe, replacement)
    .replace(windowsTrailingRe, replacement)
}

// Sanitize URL
// Based on https://github.com/braintree/sanitize-url

const ctrlCharactersRegex = /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/gim
const invalidProtocolRegex = /^([^\w]*)(javascript|data|vbscript)/im
const htmlEntitiesRegex = /&#(\w+)(^\w|;)?/g
const htmlCtrlEntityRegex = /&(newline|tab);/gi
const urlSchemeRegex = /^.+(:|&colon;)/gim
const relativeFirstCharacters = ['.', '/']
const BLANK_URL = 'about:blank'
const whitespaceEscapeCharsRegex = /(\\|%5[cC])((%(6[eE]|72|74))|[nrt])/g

function isRelativeUrlWithoutProtocol (url: string): boolean {
  return relativeFirstCharacters.includes(url[0])
}

// adapted from https://stackoverflow.com/a/29824550/2601552
function decodeHtmlCharacters (str: string) {
  const removedNullByte = str.replace(ctrlCharactersRegex, '')
  return removedNullByte.replace(htmlEntitiesRegex, (_, dec) => {
    return String.fromCharCode(dec)
  })
}

function decodeURI (uri: string): string {
  try {
    return decodeURIComponent(uri)
  } catch (e: unknown) {
    // Ignoring error
    // It is possible that the URI contains a `%` not associated
    // with URI/URL-encoding.
    return uri
  }
}
export function sanitizeUrl (url: string): string {
  // https://github.com/braintree/sanitize-url/blob/main/src/index.ts
  if (!url) {
    return BLANK_URL
  }
  let charsToDecode
  let decodedUrl = decodeURI(url)

  do {
    decodedUrl = decodeHtmlCharacters(decodedUrl)
      .replace(htmlCtrlEntityRegex, '')
      .replace(ctrlCharactersRegex, '')
      .replace(whitespaceEscapeCharsRegex, '')
      .trim()

    decodedUrl = decodeURI(decodedUrl)

    charsToDecode
      = decodedUrl.match(ctrlCharactersRegex)
        || decodedUrl.match(htmlEntitiesRegex)
        || decodedUrl.match(htmlCtrlEntityRegex)
        || decodedUrl.match(whitespaceEscapeCharsRegex)
  } while (charsToDecode && charsToDecode.length > 0)
  const sanitizedUrl = decodedUrl
  if (!sanitizedUrl) {
    return BLANK_URL
  }

  if (isRelativeUrlWithoutProtocol(sanitizedUrl)) {
    return sanitizedUrl
  }

  const urlSchemeParseResults = sanitizedUrl.match(urlSchemeRegex)

  if (!urlSchemeParseResults) {
    return sanitizedUrl
  }

  const urlScheme = urlSchemeParseResults[0]

  if (invalidProtocolRegex.test(urlScheme)) {
    return BLANK_URL
  }

  return sanitizedUrl
}
