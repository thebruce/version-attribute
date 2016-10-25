'use strict';

const versionAttribute = require('../lib/versionAttribute');

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

module.exports = {
  descendPath: function descendPathTest(test) {
    const versionedAttribute = versionAttribute();
    test.expect(5);
    test.deepEqual(
      versionedAttribute.descendPath([3, 1], versionedSuperObject),
      [3, 1, 1, 1],
      'Paths with deep children sure go the entire way.'
    );

    test.deepEqual(
      versionedAttribute.descendPath([2], versionedSuperObject),
      [2, 0, 1],
      'Paths at base should go the entire way.'
    );

    test.deepEqual(
      versionedAttribute.descendPath([2, 0, 1], versionedSuperObject),
      [],
      'Paths at the deepest level should return an empty array.'
    );
    test.deepEqual(
      versionedAttribute.descendPath([3], versionedSuperObject),
      [3, 1, 1, 1],
      'Base paths should move to the deepest level.'
    );
    test.deepEqual(
      versionedAttribute.descendPath([3, 0], versionedSuperObject),
      [3, 0, 1, 1],
      'Base paths should move to the deepest level.'
    );
    test.done();
  },
  ascendPath: function ascendPathTest(test) {
    const versionedAttribute = versionAttribute();
    test.expect(8);
    test.deepEqual(
      versionedAttribute.ascendPath([3, 0, 1], versionedSuperObject),
      [3, 0, 0],
      'Paths at or below target at the targets length should return true.'
    );
    test.deepEqual(
      versionedAttribute.ascendPath([3, 1], versionedSuperObject),
      [3, 0],
      'Sub paths of the target should return true.'
    );

    test.deepEqual(
      versionedAttribute.ascendPath([3, 0, 0], versionedSuperObject),
      [3, 0],
      'Base paths should go down a level'
    );
    test.deepEqual(
      versionedAttribute.ascendPath([0, 0, 0], versionedSuperObject),
      [],
      'Non existant zero paths should return empty.'
    );
    test.deepEqual(
      versionedAttribute.ascendPath([1, 0, 0], versionedSuperObject),
      [1, 0],
      'A non existant path should resolve to an existing parent if available.'
    );
    test.deepEqual(
      versionedAttribute.ascendPath([3, 1, 1, 1], versionedSuperObject),
      [3, 1, 1],
      'Base paths should go down a level'
    );
    test.deepEqual(
      versionedAttribute.ascendPath([4], versionedSuperObject),
      [3],
      'Non existant path at the first level should resolve to next item at first level.'
    );
    test.deepEqual(
      versionedAttribute.ascendPath([1], versionedSuperObject),
      [],
      'A final base bath with no sibling above should return empty.'
    );

    test.done();
  },
  invalidParams: function invalidParamsTest(test) {
    const versionedAttribute = versionAttribute();
    test.expect(3);
    // Empty version returns error.
    test.throws(() => {
      versionedAttribute.resolve([], versionedSuperObject, 'members');
    }, 'Invalid path did not raise exception.');
    // Invalid version returns error.
    test.throws(() => {
      versionedAttribute.resolve(['a', 4], versionedSuperObject, 'members');
    }, 'Invalid path did not raise exception.');
    // Invalid object returns error.
    test.throws(() => {
      versionedAttribute.resolve([1, 0], {}, 'members');
    }, 'Empty object did not raise exception.');
    // Existing version path returns expected path
    test.done();
  },
  getPreviousClosestVersion: function getPreviousClosestVersionTest(test) {
    const versionedAttribute = versionAttribute();
    test.expect(6);
    // Empty version returns error.
    test.deepEqual(
      versionedAttribute.getPreviousClosestVersion([1, 0, 1], versionedSuperObject),
      [1, 0],
      'Base paths should go down a level'
    );
    test.deepEqual(
      versionedAttribute.getPreviousClosestVersion([2, 0], versionedSuperObject),
      [1, 0, 1],
      'Base paths should go up and then down to get next closest.'
    );
    // Empty version returns error.
    test.deepEqual(
      versionedAttribute.getPreviousClosestVersion([3, 1, 1, 1], versionedSuperObject),
      [3, 1, 1],
      'Deeply nested paths should traverse upward until they find a matching property.'
    );

    test.deepEqual(
      versionedAttribute.getPreviousClosestVersion([1], versionedSuperObject),
      [],
      'No property at any path on or above should return empty.'
    );

    test.deepEqual(
      versionedAttribute.getPreviousClosestVersion([2, 0, 17], versionedSuperObject),
      [2, 0, 1],
      'Non Existant sibling returns correct sibling.'
    );

    test.deepEqual(
     versionedAttribute.getPreviousClosestVersion([4], versionedSuperObject),
      [3, 1, 1, 1],
      'Non Existant Parent returns correct level.'
    );
    test.done();
  },
  getVersionHasTarget: function getVersionHasTargetTest(test) {
    const versionedAttribute = versionAttribute();
    test.expect(5);
    // Empty version returns error.
    test.deepEqual(
      versionedAttribute.getVersionHasTarget([1, 0, 1], versionedSuperObject, 'members'),
      [1, 0, 1],
      'Base paths should go down a level'
    );

    // Empty version returns error.
    test.deepEqual(
      versionedAttribute.getVersionHasTarget([3, 1, 1, 1], versionedSuperObject, 'members'),
      [3, 0, 0],
      'Deeply nested paths should traverse upward until they find a matching property.'
    );

    // Empty version returns error.
    test.deepEqual(
      versionedAttribute.getVersionHasTarget([1, 0, 1], versionedSuperObject, 'otherProperty'),
      [],
      'No property at any path on or above should return empty.'
    );

    test.deepEqual(
      versionedAttribute.getVersionHasTarget([3], versionedSuperObject, 'members'),
      [2, 0, 1],
      'No property at any path on or above should return empty.'
    );

    test.deepEqual(
      versionedAttribute.getVersionHasTarget([2, 0, 17], versionedSuperObject, 'members'),
      [2, 0, 1],
      'Non Existant sibling returns correct sibling.'
    );
    test.done();
  },
  getVersion: function getVersionTest(test) {
    const versionedAttribute = versionAttribute();
    test.expect(5);
    // Empty version returns error.
    test.deepEqual(
      versionedAttribute.getVersion([1, 0, 1], versionedSuperObject),
      [1, 0, 1],
      'Existing paths should return the same path'
    );
    // Empty version returns error.
    test.deepEqual(
      versionedAttribute.getVersion([3, 1, 1, 1], versionedSuperObject),
      [3, 1, 1, 1],
      'Deeply nested paths should return the same path.'
    );

    test.deepEqual(
      versionedAttribute.getVersion([0], versionedSuperObject),
      [],
      'No property at any path on or above should return empty.'
    );

    test.deepEqual(
      versionedAttribute.getVersion([2, 0, 17], versionedSuperObject),
      [2, 0, 1],
      'Non Existant sibling returns correct sibling.'
    );

    test.deepEqual(
     versionedAttribute.getVersion([4], versionedSuperObject),
      [3, 1, 1, 1],
      'Non Existant Parent returns correct level.'
    );
    test.done();
  },
  versionAttribute: function versionAttributeTest(test) {
    const versionedAttribute = versionAttribute();
    test.expect(1);
    // Empty version returns error.
    test.deepEqual(
      versionedAttribute([1, 0, 1], versionedSuperObject, 'members'),
      ['iron buddy', 'thorskaar', 'hulksta', 'aunt man', 'queen wasp', 'mr america'],
      'Existing paths should return the same path'
    );
    test.done();
  }
};
