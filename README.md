[![Build Status](https://travis-ci.org/thebruce/version-attribute.svg?branch=master)](https://travis-ci.org/thebruce/version-attribute)
[![Coverage Status](https://coveralls.io/repos/github/thebruce/version-attribute/badge.svg?branch=master)](https://coveralls.io/github/thebruce/version-attribute?branch=master)

# Version Attribute

This module assists with identifying object attributes that correspond to versioning naming schemes {major}.{minor}.{patch} ex: 1.0.1. It will
accept any number of additional sub-patches, minor-version, or major-versions as long as new branch depths are consistent and demarcated with a ".". Ex: You can traverse an object with properties like 3.1.1.1 for instance.

Given an object with version number properties and an array corresponding to a path [{major},{minor},{patch}] you can:
* Determine if the path exists in the object.
* Get the adjacent version number of a key in the object. (ex: you provide 1.0.1 you get back 1.0.0 - provided both of those keys exist)
* Test for the existence of properties at or below a version number (ex: do i have a property of member at 1.0.1.member in an object?).
* Get the property at its first occurence at or below the passed version number. (ex: returns the value of the first occurence of the property member starting at version 1.0.1 traversing adjacent lower version numbers)

## Example

* Let's say you have an object that is organized into version naming schemes - such as 1.0.1, 3.1.1 (similar to API version naming conventions.) Each level of the version scheme is another level in the object.
Example:
```javascript
// The version 1.0.1 would be represented by:
{
  1:{
    0: {
      1: {
        // This property represents version 1.0.1
      }
    }
  }
}
```
* You might use such an object to store configuration properties.
Example:
```javascript
// A property of a version property:
{
  1:{
    0: {
      1: {
        members: {'gold'}
      }
    }
  }
}
```

* Because you might have a lot of versions that you need to keep track of and properties are constantly changing, you could use
inheritence to track changing properties in the versions. You may find this shorthand convenient for infrequenly changing properties.

```javascript
// For an object with version attributes like this:
var versionObject = {
  1: {
    1: {
       members: ['silver'], // Members is silver in 1.1
       1: {
         members: ['bronze']  // Members is bronze in 1.1.1
       }
    },
    2: {
      otherProperty: ['gold']  // Other Property is gold in 1.2
    }
  },
  2: {
    members: ['silver', 'bronze'] // Members is silver and bronze in 2
  }
}
```

## Usage
* You can use `version attribute` to better understand this object.
```javascript
// Review the example above for a more thorough explanation of the object.
// For an object with version attributes like this:
var versionObject = {
  1: {
    1: {
       members: ['silver'], // Members: silver in 1.1
       1: {
         members: ['bronze']  // Members: bronze in 1.1.1
       }
    },
    2: {
      otherProperty: ['gold']  // Other Property: gold, Members: bronze hierarchically.
    }
  },
  2: {
    members: ['silver', 'bronze'], // Members: silver,bronze, Other Property: gold in 1.2 hierarchically.
    1: {
      yetOtherProperty: ['tin'] // yetOtherProperty: tin, members: silver,bronze, and otherProperty: is gold hierarchically.
    }
  }
}

const versionAttribute = require('../lib/versionAttribute')();
var testPath;

// We can understand more about what version properties are in the object in the first place.

// Use getVersion to see if we have a version at or below the version (1.1.1)
// we provide in this object.
testPath = versionAttribute.getVersion([1, 1, 1], versionObject);
// testPath is [1,1,1] because that version exists in the object.

// getVersion will even work if you pass in a version number not in the object.
testPath = testPath = versionAttribute.getVersion([1, 1, 2], versionObject);
// testPath is [1,1,1] because 1,1,2 doesn't exist but [1,1,1] is a lower version hierarcally.

// When getVersion can not get an object at the passed path, it will go up a sibling
// or parent. Once it goes up that sibling or parent it descends down that branch as
// far as it can so that
// you get the next highest adjacent version.
testPath = testPath = versionAttribute.getVersion([3], versionObject);
// testPath is [2,1] because [3] doesn't exist so it goes up a parent to [2] and then
// down to the lowest child [2,1]

// You might just want the next lowest version from a version.
// For that we can use getPreviousClosestVersion.  This behaves in a similar way \
// to getVersion but only returns
// version properties below the passed version property.

// Get a version path below the given path in the object.
testPath = versionAttribute.getPreviousClosestVersion([1,2], versionedObject);
// testPath is [1,1,1] because it is the next adjacent version.

// Finally we can learn some information about the properties of the version properties
// like members and otherProperty in the example above.

// We can learn where the highest occurence of a give property exists given the object
// and a starting path. The versions we get back conform to the behavior of getVersion
// above and always return the first occurence of a property at or adjacently above the
// version we specify. Get the highest position of an attribute at the path or below in
// version, returns [1,1,1]
testPath = versionAttribute.getVersionHasTarget([2], versionObject, 'members');
// testPath is [1,1,1] because not finding the members property in version 2, we ascended
// a parent and then deeply descended and continued looking until we found members at
// version [1,1,1]

// We can also request that property directly.
// Get the attribute returns [bronze]
var testProperty = versionAttribute([2,1], versionObject, 'otherProperty');
// testProperty is ['gold]. We looked for `otherProperty` in 2,1, not finding it
// we ascended  to the parent [2], where we also didn't find it. So we ascended
// a parent [1] where we descended as far as possible to [1,2] where we finally
// found a property `otherProperty` and returned `[gold]`;

