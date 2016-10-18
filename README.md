[![Build Status](https://travis-ci.org/thebruce/version-attribute.svg?branch=master)](https://travis-ci.org/thebruce/version-require)
[![Coverage Status](https://coveralls.io/repos/thebruce/version-attribute/badge.svg?branch=master&service=github)](https://coveralls.io/github/thebruce/version-attribute?branch=master)

# Version Attribute

This module allows you to access an object literal attribute for a particular version number and if that attribute
does not exist it falls back to the attribute with the next highest attribute value. This could be used for typical versioning
schemes such as `3.11.1` in {majorVersion}.{minorVersion}.{patchVersion} format, but it will work for any dot notation numeric incrementing versioning system.

## Usage

```javascript
// For an object with version attributes like this:
var versionObject = {
  4: {

  }
}
```
