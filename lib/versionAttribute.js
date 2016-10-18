'use strict';

const _ = require('lodash');

module.exports = function () {
  /**
   * Accepts a version and an object and returns the object property
   * of the highest version value compared to the passed version.
   */
  const descendPath = function (pathCrumbs, tree) {
    // from a pathsCrumbs attempt to get children
    const tempCrumbs = _.cloneDeep(pathCrumbs);
    let descentPath = _.get(tree, tempCrumbs);
    let newArray = [];
    let prep = true;
    let sentinel = false;

    while (descentPath) {
      prep = _.chain(descentPath)
        .keys()
        .invert()
        .keysIn()
        .map(_.parseInt)
        .slice(0, descentPath[descentPath.length])
        .value();

       // Do we have any items?
      if (prep.length > 0) {
        // This particular path has properties.
        // It may not have version key children though.
        newArray = _.filter(prep, (n) => {
          if (isNaN(n)) {
            return false;
          }
          return true;
        });

        if (newArray.length) {
          tempCrumbs.push(_.parseInt(newArray[newArray.length - 1]));
          descentPath = _.get(tree, tempCrumbs);
          sentinel = true;
        }
        else {
          break;
        }
      }
      else {
        break;
      }
    }
    if (sentinel) {
      return tempCrumbs;
    }
    return [];
  };

  const ascendPath = function (pathCrumbs, tree) {
    let parentCrumbs = [];
    let parent = {};
    let keys = [];
    let keyReturn = [];
    let tempKeyReturn = [];
    let i;
    let item;

    const crumbsNanTest = function NanTest(n) {
      // If n is not a number, it is another kind of property.
      if (isNaN(_.parseInt(n))) {
        return false;
      }
      // If the current item is larger or equal to pathCrumbs, we remove it.
      return n >= pathCrumbs[i];
    };

    for (i = pathCrumbs.length - 1; i >= 0; i--) {
      // From the end to the begining, get slices at i.
      parentCrumbs = _.slice(pathCrumbs, 0, i);
      parent = _.get(tree, parentCrumbs);

      if (i === 0) {
        if (pathCrumbs[i] === 0) {
          return [];
        }
        parent = tree;
        // Because of this special case we need to make sure pathCrumbs exists.
        keys = _.keysIn(parent);

        keyReturn = _.chain(keys)
        .filter((n) => n <= pathCrumbs[0])
        .value();

        if (keyReturn.length === 1) {
          tempKeyReturn = _.filter(keyReturn, (n) => n < pathCrumbs[0]);
          if (tempKeyReturn.length > 0) {
            return [keys[_.findLastKey(keys, (n) => (
               n <= pathCrumbs[0]
            ))]];
          }
          return [];
        }
      }

      item = _.chain(parent)
        .keysIn()
        .sort()
        .map(_.parseInt)
        .without(i)
        .value();

      if (i === (pathCrumbs.length - 1)) {
        _.remove(item, (n) => crumbsNanTest(n));
      }

      if (item.length) {
        _.remove(item, isNaN);
        if (item.length > 0) {
          parentCrumbs.push(item[item.length - 1]);
        }
        return parentCrumbs;
      }
    }
    return parentCrumbs;
  };

  // Gets the closest previous version to the one specified
  const getPreviousClosestVersion = function (pathCrumbs, tree) {
    let ascendPathCrumbs;
    let tempPathCrumbs;
    // Try to ascend - will give us the first real path above our target.
    ascendPathCrumbs = ascendPath(pathCrumbs, tree);
    if (_.isEqual(ascendPathCrumbs, [])) {
      // We could not ascend we are finished.
      return [];
    }

    // We will now try and descend.
    tempPathCrumbs = _.cloneDeep(ascendPathCrumbs);

    while (tempPathCrumbs.length !== 0) {
      // keep going until we get a
      tempPathCrumbs = descendPath(ascendPathCrumbs, tree);
      // Test for [].
      if (tempPathCrumbs.length === 0) {
        // We could not descend.
        break;
      }

      // Test if this is pathCrumbs.
      if (!(_.isMatch(tempPathCrumbs, pathCrumbs))) {
        // We could descend.  See if we can descend again.
        ascendPathCrumbs = _.clone(tempPathCrumbs, true);
      }
      else {
        // This was path crumbs.
        // We should pass ascend crumbs without modification
        // since modifying it will put us in an unending loop.
        break;
      }
    }
    return ascendPathCrumbs;
  };

  const getVersionHasTarget = function (pathCrumbs, tree, target) {
    const tempTargetCrumbs = _.cloneDeep(pathCrumbs, true);
    let answerArray = [];
    let ascendPathCrumbs = [];

    // Lets add the target and see if it exists at this path.
    tempTargetCrumbs.push(target);
    const tempTarget = _.get(tree, tempTargetCrumbs);
    if (tempTarget) {
      // It does, we are done.
      answerArray = _.slice(pathCrumbs, 0, pathCrumbs.length);
    }
    else {
      // It does not exist, we must ascend, as we always come
      // from a place of furthest descent.
      ascendPathCrumbs = getPreviousClosestVersion(pathCrumbs, tree);
      if (!(_.isEqual(ascendPathCrumbs, []))) {
        // If we have a path we have what we need to move forward.
        answerArray = getVersionHasTarget(ascendPathCrumbs, tree, target);
      }
    }
    // This means we are returning an empty answer.
    return answerArray;
  };

  const resolve = function (pathCrumbs = [], tree = {}, target = []) {
    if (!(typeof pathCrumbs === 'object') && (pathCrumbs.length === 0)) {
      throw new Error('An invalid or blank version was provided.');
    }

    if (Object.keys(tree).length === 0 && tree.constructor === Object) {
      throw new Error('The version object is empty.');
    }

    return getVersionHasTarget(pathCrumbs, tree, target);
  };

  // Gets the version specified if it exists or the next closest version.
  const getVersion = function (pathCrumbs, tree) {
    const tempTarget = _.get(tree, pathCrumbs);
    if (tempTarget) {
      return pathCrumbs;
    }
    return getPreviousClosestVersion(pathCrumbs, tree);
  };

  const versionAttribute = function (pathCrumbs = [], tree = {}, target = []) {
    const attributePath = resolve(pathCrumbs, tree, target);
    if ((typeof attributePath === 'object') && attributePath.length) {
      attributePath.push(target);
      return _.get(tree, attributePath);
    }
    return {};
  };

  // Expose functions.
  versionAttribute.resolve = resolve;
  versionAttribute.ascendPath = ascendPath;
  versionAttribute.descendPath = descendPath;
  versionAttribute.getVersionHasTarget = getVersionHasTarget;
  versionAttribute.getPreviousClosestVersion = getPreviousClosestVersion;
  versionAttribute.getVersion = getVersion;

  return versionAttribute;
};
