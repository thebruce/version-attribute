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

const versionedAttribute = new VersionAttribute(versionedSuperObject);

module.exports = {

  descendPath: function descendPathTest(test) {
    test.expect(5);
    test.deepEqual(
      versionedAttribute.descendPath([3, 1]),
      [3, 1, 1, 1],
      'Paths with deep children sure go the entire way.'
    );
    test.deepEqual(
      versionedAttribute.descendPath([2]),
      [2, 0, 1],
      'Paths at base should go the entire way.'
    );
    test.deepEqual(
      versionedAttribute.descendPath([2, 0, 1]),
      [],
      'Paths at the deepest level should return an empty array.'
    );
    test.deepEqual(
      versionedAttribute.descendPath([3]),
      [3, 1, 1, 1],
      'Base paths should move to the deepest level.'
    );
    test.deepEqual(
      versionedAttribute.descendPath([3, 0]),
      [3, 0, 1, 1],
      'Base paths should move to the deepest level.'
    );
    test.done();
  },
  ascendPath: function ascendPathTest(test) {
    test.expect(8);
    test.deepEqual(
      versionedAttribute.ascendPath([3, 0, 1]),
      [3, 0, 0],
      'Paths at or below target at the targets length should return true.'
    );
    test.deepEqual(
      versionedAttribute.ascendPath([3, 1]),
      [3, 0],
      'Sub paths of the target should return true.'
    );
    test.deepEqual(
      versionedAttribute.ascendPath([3, 0, 0]),
      [3, 0],
      'Base paths should go down a level'
    );
    test.deepEqual(
      versionedAttribute.ascendPath([0, 0, 0]),
      [],
      'Non existant zero paths should return empty.'
    );
    test.deepEqual(
      versionedAttribute.ascendPath([1, 0, 0]),
      [1, 0],
      'A non existant path should resolve to an existing parent if available.'
    );
    test.deepEqual(
      versionedAttribute.ascendPath([3, 1, 1, 1]),
      [3, 1, 1],
      'Base paths should go down a level'
    );
    test.deepEqual(
      versionedAttribute.ascendPath([4]),
      [3],
      'Non existant path at the first level should resolve to next item at first level.'
    );
    test.deepEqual(
      versionedAttribute.ascendPath([1]),
      [],
      'A final base bath with no sibling above should return empty.'
    );

    test.done();
  },
  invalidParams: function invalidParamsTest(test) {
    test.expect(23);
    test.throws(() => {
      new VersionAttribute({}); // eslint-disable-line no-new
    }, 'Empty object did not raise exception.');
    test.throws(() => {
      versionedAttribute.descendPath('');
    }, 'Incorrect path did not raise exception');
    test.throws(() => {
      versionedAttribute.ascendPath('');
    }, 'Incorrect path did not raise exception');
    test.throws(() => {
      versionedAttribute.getPreviousClosestVersion('');
    }, 'Incorrect path did not raise exception');
    test.throws(() => {
      versionedAttribute.getVersionHasTarget('', 'members');
    }, 'Incorrect path did not raise exception');
    test.throws(() => {
      versionedAttribute.getVersion('');
    }, 'Incorrect path did not raise exception');
    test.throws(() => {
      versionedAttribute.getVersionAttribute('', 'members');
    }, 'Incorrect path did not raise exception');
    test.throws(() => {
      versionedAttribute.descendPath([]);
    }, 'Empty path did not raise exception');
    test.throws(() => {
      versionedAttribute.ascendPath([]);
    }, 'Empty path did not raise exception');
    test.throws(() => {
      versionedAttribute.getPreviousClosestVersion([]);
    }, 'Empty path did not raise exception');
    test.throws(() => {
      versionedAttribute.getVersionHasTarget([], 'members');
    }, 'Empty path did not raise exception');
    test.throws(() => {
      versionedAttribute.getVersion([]);
    }, 'Empty path did not raise exception');
    test.throws(() => {
      versionedAttribute.getVersionAttribute([], 'members');
    }, 'Empty path did not raise exception');
    test.throws(() => {
      versionedAttribute.descendPath(['a', 4]);
    }, 'Incorrect path did not raise exception');
    test.throws(() => {
      versionedAttribute.ascendPath(['a', 4]);
    }, 'Incorrect path did not raise exception');
    test.throws(() => {
      versionedAttribute.getPreviousClosestVersion(['a', 4]);
    }, 'Incorrect path did not raise exception');
    test.throws(() => {
      versionedAttribute.getVersionHasTarget(['a', 4], 'members');
    }, 'Incorrect path did not raise exception');
    test.throws(() => {
      versionedAttribute.getVersion(['a', 4]);
    }, 'Incorrect path did not raise exception');
    test.throws(() => {
      versionedAttribute.getVersionAttribute(['a', 4], 'members');
    }, 'Incorrect path did not raise exception');
    test.throws(() => {
      versionedAttribute.getVersionHasTarget([1, 0, 1], '');
    }, 'Empty target did not raise exception');
    test.throws(() => {
      versionedAttribute.getVersionAttribute([1, 0, 1], '');
    }, 'Empty target did not raise exception');
    test.throws(() => {
      versionedAttribute.getVersionHasTarget([], '');
    }, 'Empty target did not raise exception');
    test.throws(() => {
      versionedAttribute.getVersionAttribute([], '');
    }, 'Empty target did not raise exception');
    test.done();
  },
  getPreviousClosestVersion: function getPreviousClosestVersionTest(test) {
    test.expect(6);
    // Empty version returns error.
    test.deepEqual(
      versionedAttribute.getPreviousClosestVersion([1, 0, 1]),
      [1, 0],
      'Base paths should go down a level'
    );
    test.deepEqual(
      versionedAttribute.getPreviousClosestVersion([2, 0]),
      [1, 0, 1],
      'Base paths should go up and then down to get next closest.'
    );
    // Empty version returns error.
    test.deepEqual(
      versionedAttribute.getPreviousClosestVersion([3, 1, 1, 1]),
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
    test.expect(5);
    test.deepEqual(
      versionedAttribute.getVersionHasTarget([1, 0, 1], 'members'),
      [1, 0, 1],
      'Base paths should go down a level'
    );
    test.deepEqual(
      versionedAttribute.getVersionHasTarget([3, 1, 1, 1], 'members'),
      [3, 0, 0],
      'Deeply nested paths should traverse upward until they find a matching property.'
    );
    test.deepEqual(
      versionedAttribute.getVersionHasTarget([1, 0, 1], 'otherProperty'),
      [],
      'No property at any path on or above should return empty.'
    );
    test.deepEqual(
      versionedAttribute.getVersionHasTarget([3], 'members'),
      [2, 0, 1],
      'No property at any path on or above should return empty.'
    );
    test.deepEqual(
      versionedAttribute.getVersionHasTarget([2, 0, 17], 'members'),
      [2, 0, 1],
      'Non Existant sibling returns correct sibling.'
    );
    test.done();
  },
  getVersion: function getVersionTest(test) {
    test.expect(5);
    test.deepEqual(
      versionedAttribute.getVersion([1, 0, 1]),
      [1, 0, 1],
      'Existing paths should return the same path'
    );
    test.deepEqual(
      versionedAttribute.getVersion([3, 1, 1, 1]),
      [3, 1, 1, 1],
      'Deeply nested paths should return the same path.'
    );
    test.deepEqual(
      versionedAttribute.getVersion([0]),
      [],
      'No property at any path on or above should return empty.'
    );
    test.deepEqual(
      versionedAttribute.getVersion([2, 0, 17]),
      [2, 0, 1],
      'Non Existant sibling returns correct sibling.'
    );
    test.deepEqual(
     versionedAttribute.getVersion([4]),
      [3, 1, 1, 1],
      'Non Existant Parent returns correct level.'
    );
    test.done();
  },
  versionAttribute: function versionAttributeTest(test) {
    test.expect(1);
    test.deepEqual(
      versionedAttribute.getVersionAttribute([1, 0, 1], 'members'),
      ['iron buddy', 'thorskaar', 'hulksta', 'aunt man', 'queen wasp', 'mr america'],
      'Existing paths should return the same path'
    );
    test.done();
  }
};
