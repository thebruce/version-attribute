'use strict';

const VersionAttribute = require('../lib/versionAttribute');

const versionedSuperObject = {
  1: {
    members: ['iron buddy', 'thorskaar', 'hulksta', 'aunt man', 'queen wasp'],
    0: {
      members: ['iron buddy', 'thorskaar', 'hulksta', 'aunt man', 'queen wasp'],
      1: {
        members: ['iron buddy', 'thorskaar', 'hulksta', 'aunt man', 'queen wasp', 'mr america']
      }
    }
  },
  2: {
    0: {
      members: [
        'iron buddy',
        'thorskaar',
        'hulksta',
        'aunt man',
        'queen wasp',
        'mr america',
        'hork aye',
        'quik sliver',
        'red witch'
      ],
      1: {
        members: [
          'iron buddy',
          'thorskaar',
          'hulksta',
          'aunt man',
          'queen wasp',
          'mr america',
          'hork aye',
          'quik sliver',
          'red witch',
          'the sword'
        ],
      }
    }
  },
  3: {
    0: {
      otherProperty: 'Altrom hiding',
      0: {
        members: [
          'iron buddy',
          'thorskaar',
          'hulksta',
          'aunt man',
          'queen wasp',
          'mr america',
          'hork aye',
          'quik sliver',
          'red witch',
          'herc'
        ]
      },
      1: {
        otherProperty: 'Dr. Dom hiding',
        1: {}
      }
    },
    1: {
      1: {
        1: {
          otherProperty: 'The Leider hiding'
        }
      }
    }
  }
};

let versionedAttribute = new VersionAttribute([3, 1], versionedSuperObject);

module.exports = {

  descendPath: function descendPathTest(test) {
    test.expect(5);
    versionedAttribute = new VersionAttribute([3, 1], versionedSuperObject);
    test.deepEqual(
      versionedAttribute.descendPath([3, 1]),
      [3, 1, 1, 1],
      'Paths with deep children sure go the entire way.'
    );
    versionedAttribute = new VersionAttribute([2], versionedSuperObject);
    test.deepEqual(
      versionedAttribute.descendPath([2]),
      [2, 0, 1],
      'Paths at base should go the entire way.'
    );
    versionedAttribute = new VersionAttribute([2, 0, 1], versionedSuperObject);
    test.deepEqual(
      versionedAttribute.descendPath([2, 0, 1]),
      [],
      'Paths at the deepest level should return an empty array.'
    );
    versionedAttribute = new VersionAttribute([3], versionedSuperObject);
    test.deepEqual(
      versionedAttribute.descendPath([3]),
      [3, 1, 1, 1],
      'Base paths should move to the deepest level.'
    );
    versionedAttribute = new VersionAttribute([3, 0], versionedSuperObject);
    test.deepEqual(
      versionedAttribute.descendPath([3, 0]),
      [3, 0, 1, 1],
      'Base paths should move to the deepest level.'
    );
    test.done();
  },
  ascendPath: function ascendPathTest(test) {
    test.expect(8);
    versionedAttribute = new VersionAttribute([3, 0, 1], versionedSuperObject);
    test.deepEqual(
      versionedAttribute.ascendPath([3, 0, 1]),
      [3, 0, 0],
      'Paths at or below target at the targets length should return true.'
    );
    versionedAttribute = new VersionAttribute([3, 1], versionedSuperObject);
    test.deepEqual(
      versionedAttribute.ascendPath([3, 1]),
      [3, 0],
      'Sub paths of the target should return true.'
    );
    versionedAttribute = new VersionAttribute([3, 0, 0], versionedSuperObject);
    test.deepEqual(
      versionedAttribute.ascendPath([3, 0, 0]),
      [3, 0],
      'Base paths should go down a level'
    );
    versionedAttribute = new VersionAttribute([0, 0, 0], versionedSuperObject);
    test.deepEqual(
      versionedAttribute.ascendPath([0, 0, 0]),
      [],
      'Non existant zero paths should return empty.'
    );
    versionedAttribute = new VersionAttribute([1, 0, 0], versionedSuperObject);
    test.deepEqual(
      versionedAttribute.ascendPath([1, 0, 0]),
      [1, 0],
      'A non existant path should resolve to an existing parent if available.'
    );
    versionedAttribute = new VersionAttribute([3, 1, 1, 1], versionedSuperObject);
    test.deepEqual(
      versionedAttribute.ascendPath([3, 1, 1, 1]),
      [3, 1, 1],
      'Base paths should go down a level'
    );
    versionedAttribute = new VersionAttribute([4], versionedSuperObject);
    test.deepEqual(
      versionedAttribute.ascendPath([4]),
      [3],
      'Non existant path at the first level should resolve to next item at first level.'
    );
    versionedAttribute = new VersionAttribute([1], versionedSuperObject);
    test.deepEqual(
      versionedAttribute.ascendPath([1]),
      [],
      'A final base bath with no sibling above should return empty.'
    );

    test.done();
  },
  invalidParams: function invalidParamsTest(test) {
    test.expect(3);
    // Empty version returns error.
    test.throws(() => {
      new VersionAttribute('', versionedSuperObject, 'members'); // eslint-disable-line no-new
    }, 'Empty path did not raise exception.');
    // Invalid version returns error.
    test.throws(() => {
      new VersionAttribute(['a', 4], versionedSuperObject, 'members'); // eslint-disable-line no-new
    }, 'Invalid path did not raise exception.');
    // Invalid object returns error.
    test.throws(() => {
      new VersionAttribute([1, 0], {}, 'members'); // eslint-disable-line no-new
    }, 'Empty object did not raise exception.');
    // Existing version path returns expected path
    test.done();
  },
  getPreviousClosestVersion: function getPreviousClosestVersionTest(test) {
    test.expect(6);
    // Empty version returns error.
    versionedAttribute = new VersionAttribute([1, 0, 1], versionedSuperObject);
    test.deepEqual(
      versionedAttribute.getPreviousClosestVersion([1, 0, 1]),
      [1, 0],
      'Base paths should go down a level'
    );
    versionedAttribute = new VersionAttribute([2, 0], versionedSuperObject);
    test.deepEqual(
      versionedAttribute.getPreviousClosestVersion([2, 0]),
      [1, 0, 1],
      'Base paths should go up and then down to get next closest.'
    );
    versionedAttribute = new VersionAttribute([3, 1, 1, 1], versionedSuperObject);
    // Empty version returns error.
    test.deepEqual(
      versionedAttribute.getPreviousClosestVersion([3, 1, 1, 1]),
      [3, 1, 1],
      'Deeply nested paths should traverse upward until they find a matching property.'
    );
    versionedAttribute = new VersionAttribute([1], versionedSuperObject);
    test.deepEqual(
      versionedAttribute.getPreviousClosestVersion([1], versionedSuperObject),
      [],
      'No property at any path on or above should return empty.'
    );
    versionedAttribute = new VersionAttribute([2, 0, 17], versionedSuperObject);
    test.deepEqual(
      versionedAttribute.getPreviousClosestVersion([2, 0, 17], versionedSuperObject),
      [2, 0, 1],
      'Non Existant sibling returns correct sibling.'
    );
    versionedAttribute = new VersionAttribute([4], versionedSuperObject);
    test.deepEqual(
     versionedAttribute.getPreviousClosestVersion([4], versionedSuperObject),
      [3, 1, 1, 1],
      'Non Existant Parent returns correct level.'
    );
    test.done();
  },
  getVersionHasTarget: function getVersionHasTargetTest(test) {
    test.expect(5);

    versionedAttribute = new VersionAttribute([1, 0, 1], versionedSuperObject, 'members');
    test.deepEqual(
      versionedAttribute.getVersionHasTarget([1, 0, 1]),
      [1, 0, 1],
      'Base paths should go down a level'
    );

    versionedAttribute = new VersionAttribute([3, 1, 1, 1], versionedSuperObject, 'members');
    test.deepEqual(
      versionedAttribute.getVersionHasTarget([3, 1, 1, 1]),
      [3, 0, 0],
      'Deeply nested paths should traverse upward until they find a matching property.'
    );

    versionedAttribute = new VersionAttribute([1, 0, 1], versionedSuperObject, 'otherProperty');
    test.deepEqual(
      versionedAttribute.getVersionHasTarget([1, 0, 1], versionedSuperObject, 'otherProperty'),
      [],
      'No property at any path on or above should return empty.'
    );
    versionedAttribute = new VersionAttribute([3], versionedSuperObject, 'members');
    test.deepEqual(
      versionedAttribute.getVersionHasTarget([3], versionedSuperObject, 'members'),
      [2, 0, 1],
      'No property at any path on or above should return empty.'
    );
    versionedAttribute = new VersionAttribute([2, 0, 17], versionedSuperObject, 'members');
    test.deepEqual(
      versionedAttribute.getVersionHasTarget([2, 0, 17], versionedSuperObject, 'members'),
      [2, 0, 1],
      'Non Existant sibling returns correct sibling.'
    );
    test.done();
  },
  getVersion: function getVersionTest(test) {
    test.expect(5);
    versionedAttribute = new VersionAttribute([1, 0, 1], versionedSuperObject);
    test.deepEqual(
      versionedAttribute.getVersion([1, 0, 1]),
      [1, 0, 1],
      'Existing paths should return the same path'
    );
    versionedAttribute = new VersionAttribute([3, 1, 1, 1], versionedSuperObject);
    test.deepEqual(
      versionedAttribute.getVersion([3, 1, 1, 1], versionedSuperObject),
      [3, 1, 1, 1],
      'Deeply nested paths should return the same path.'
    );
    versionedAttribute = new VersionAttribute([0], versionedSuperObject);
    test.deepEqual(
      versionedAttribute.getVersion([0], versionedSuperObject),
      [],
      'No property at any path on or above should return empty.'
    );
    versionedAttribute = new VersionAttribute([2, 0, 17], versionedSuperObject);
    test.deepEqual(
      versionedAttribute.getVersion([2, 0, 17], versionedSuperObject),
      [2, 0, 1],
      'Non Existant sibling returns correct sibling.'
    );
    versionedAttribute = new VersionAttribute([4], versionedSuperObject);
    test.deepEqual(
     versionedAttribute.getVersion([4], versionedSuperObject),
      [3, 1, 1, 1],
      'Non Existant Parent returns correct level.'
    );
    test.done();
  },
  versionAttribute: function versionAttributeTest(test) {
    test.expect(1);
    versionedAttribute = new VersionAttribute([1, 0, 1], versionedSuperObject, 'members');
    test.deepEqual(
      versionedAttribute.getVersionAttribute([1, 0, 1], versionedSuperObject, 'members'),
      ['iron buddy', 'thorskaar', 'hulksta', 'aunt man', 'queen wasp', 'mr america'],
      'Existing paths should return the same path'
    );
    test.done();
  }
};
