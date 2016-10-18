[![Build Status](https://travis-ci.org/thebruce/version-attribute.svg?branch=master)](https://travis-ci.org/thebruce/version-attribute)
[![Coverage Status](https://coveralls.io/repos/github/thebruce/version-attribute/badge.svg?branch=master)](https://coveralls.io/github/thebruce/version-attribute?branch=master)

# Version Attribute

This module assists with identifying object attributes that correspond to versioning naming schemes {major}.{minor}.{patch} ex: 1.0.1. It will
accept any number of additional sub-patches, minor-version, or major-versions as long as new branch depths are consistent and demarcated with a ".". Ex: You can traverse an object with properties like 3.1.1.1 for instance.

Given an object with version number properties and an array corresponding to a path [{major},{minor},{patch}] you can:
* Determine if the path exists in the object.
* Get the next decrement of the version at its deepest path if the passed path does not exist.
* Test for the existence of properties at or below a version number.
* Get the property at its first occurence at or below the passed version number.

You could use this to traverse and retrieve short hand configuration objects based on a particular version (possibly useful different and inconsistent configuration for an API, let's say) or to retrieve the latest occurence of a property based on a particular starting path.

## Usage

```javascript
// For an object with version attributes like this:
var versionObject = {
  1: {
    1: {
       members: ['silver'],
       1: {
         members: ['bronze']
       }
    },
    2: {
      otherProperty: ['gold']
    }
  }
  2: {
    members: ['silver', 'bronze']
  }
}

const versionAttribute = require('../lib/versionAttribute')();
var testPath;

// Get an existing version path at or below the given object. returns [1,1,1]
testPath = versionAttribute.getVersion([1, 1, 1], versionObject);

// Will work even with non-existant higher paths. returns [1,1,1]
testPath = testPath = versionAttribute.getVersion([1, 1, 2], versionObject);

// Get a version path below the given path in the object, returns [1,1,1]
testPath = versionAttribute.getPreviousClosestVersion([2], versionedObject);

// Get the highest position of an attribute at the path or below in version, returns [1,1,1]
testPath = versionAttribute.getVersionHasTarget([2], versionObject, 'members');

// Get the attribute returns [bronze]
testPath = versionAttribute([2], versionObject, 'members');

```
