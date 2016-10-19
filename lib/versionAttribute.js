'use strict';

const _ = require('lodash');

module.exports = function versionAttributeMain() {
  /**
   * Function to see if we can descend down this
   * tree object from the passed path.
   *
   * @param {array} pathCrumbs
   *   An array collection of version paths, one per member, in order.
   *   The path crumbs indicates from where we will try and descend.
   * @param {object} tree
   *   An object with version keys and possible other properties.
   *
   * @return {array}
   *   The furthest descension path possible from this starting point
   *   as an array collection of version paths, one per member, in order.
   */
  const descendPath = function descender(pathCrumbs, tree) {
    // We need to mutate and reference the original.
    const tempCrumbs = _.cloneDeep(pathCrumbs);
    // The branch we will descend.
    let descentPath = _.get(tree, tempCrumbs);
    let newArray = [];
    let prep = [];
    let sentinel = false;

    // Keep going until we no longer have a branch to descend.
    while (descentPath) {
      // Does this path have children?
      // Get any keys, including non-version keys.
      // Sort them, and convert the inverted keys to Ints or (NaNs).
      prep = _.chain(descentPath)
        .keys()
        .invert()
        .keysIn()
        .map(i => parseInt(i, 10))
        .value();

       // Do we have any items?
      if (prep.length > 0) {
        // This particular path has properties.
        // It may not have version key children though.
        newArray = prep.filter((n) => {
          if (isNaN(n)) {
            // We don't want any NaNs.
            return false;
          }
          // Only version keys.
          return true;
        });

        // If Anything is left we can descend further.
        if (newArray.length) {
          // Add the next lowest item to the parent path
          // to make a new descent path.
          tempCrumbs.push(parseInt(newArray[newArray.length - 1], 10));
          descentPath = _.get(tree, tempCrumbs);
          // Make sure we know that we descended atleast once.
          sentinel = true;
        }
        else {
          break;
        }
      }
      else {
        // We only had non-version keys, we were at the furthest we could go.
        break;
      }
    }
    // If we were ever able to descend, sentinel
    // is true and we can return how far we got.
    // If sentinel is false no descension possible.
    return sentinel ? tempCrumbs : [];
  };

  /**
   * Function to see if we can ascend up this
   * tree object from the passed path.
   *
   * @param {array} pathCrumbs
   *   An array collection of version paths, one per member, in order.
   *   The path crumbs indicates from where we will try and ascend.
   * @param {object} tree
   *   An object with version keys and possible other properties.
   *
   * @return {array}
   *   The next ascendsion path up as an array collection of
   *   version paths, one per member, in order.
   */
  const ascendPath = function ascender(pathCrumbs, tree) {
    let parentCrumbs = [];
    let parent = {};
    let keys = [];
    let keyReturn = [];
    let tempKeyReturn = [];
    let i;
    let item;

    const crumbsNanTest = function NanTest(n) {
      // If n is not a number, it is another kind of property.
      if (isNaN(parseInt(n, 10))) {
        return false;
      }
      // If the current item is larger or equal to pathCrumbs, we remove it.
      return n >= pathCrumbs[i];
    };

    for (i = pathCrumbs.length - 1; i >= 0; i -= 1) {
      // From the end to the begining, get slices at i.
      parentCrumbs = _.slice(pathCrumbs, 0, i);
      parent = _.get(tree, parentCrumbs);

      // Are we on the base value?
      if (i === 0) {
        // If we've gotten here, the only ascension possible is moving the base.
        if (pathCrumbs[i] === 0) {
          // We can't go higher than 0, no ascension possible.
          parentCrumbs = [];
          break;
        }
        // To move the base we need parent as the tree at root.
        parent = tree;
        // We also need to specially handle non-existant keys case.
        keys = _.keysIn(parent);
        // Do we actually have keys higher up the tree or equal to the path?
        keyReturn = _.chain(keys)
          .filter(n => n <= pathCrumbs[0])
          .value();
        // This a special case of special case.
        if (keyReturn.length === 1) {
          // Like Jim Morrison, we need to know if we can get much higher.
          tempKeyReturn = keyReturn.filter(n => n < pathCrumbs[0]);
          if (tempKeyReturn.length > 0) {
            // Yeah, we can.
            parentCrumbs = [keys[_.findLastKey(keys, n => (
               n <= pathCrumbs[0]
            ))]];
            break;
          }
          // Nope, this is the paramount location. No ascendancy possible.
          parentCrumbs = [];
          break;
        }
      }
      // Attempt to ascend by getting key children of the parent.
      // We want to see if removing the current key, gives us any siblings.
      item = _.chain(parent)
        .keysIn()
        .sort()
        .map(ii => parseInt(ii, 10))
        .without(i)
        .value();

      // Check to see if we are at the lowest possible level in this process.
      if (i === (pathCrumbs.length - 1)) {
        // In this case we need to remove any value that is not version key.
        // We also need to remove any version key that is deeper.
        _.remove(item, n => crumbsNanTest(n));
      }

      if (item.length) {
        _.remove(item, isNaN);
        if (item.length > 0) {
          parentCrumbs.push(item[item.length - 1]);
        }
        // Parent crumbs is as far as it can go, return.
        break;
      }
    }
    return parentCrumbs;
  };

  /**
   * Function to return the next closest version number
   * to the one we've passed.
   *
   * @param {array} pathCrumbs
   *   An array collection of version paths, one per member, in order.
   *   The path crumbs indicates from where we will start looking.
   * @param {object} tree
   *   An object with version keys and possible other properties.
   *
   * @return {array}
   *   The nearest path upwards, up as an array collection of
   *   version paths, one per member, in order.
   */
  const getPreviousClosestVersion = function previousVersionGetter(pathCrumbs, tree) {
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
      if (_.isMatch(tempPathCrumbs, pathCrumbs)) {
        // This was path crumbs.
        // We should pass ascend crumbs without modification
        // since modifying it will put us in an unending loop.
        break;
      }
      // We could descend.  See if we can descend again.
      ascendPathCrumbs = _.clone(tempPathCrumbs, true);
    }
    return ascendPathCrumbs;
  };


  /**
   * Function to return the highest path on the tree that has
   * this target property.
   *
   * @param {array} pathCrumbs
   *   An array collection of version paths, one per member, in order.
   *   The path crumbs indicates from where we will start looking.
   * @param {object} tree
   *   An object with version keys and possible other properties.
   *
   * @return {array}
   *   The path that has this target property  at or above the path given
   *   in the tree, expressed as an array collection of version paths,
   *   one per member, in order.
   */
  const getVersionHasTarget = function versionTargetGetter(pathCrumbs, tree, target) {
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

  /**
   * Function to return the highest path on the tree that has
   * this target property.
   *
   * @param {array} pathCrumbs
   *   An array collection of version paths, one per member, in order.
   *   The path crumbs indicates from where we will start looking.
   * @param {object} tree
   *   An object with version keys and possible other properties.
   *
   * @return {array}
   *   The path that has this target property  at or above the path given
   *   in the tree, expressed as an array collection of version paths,
   *   one per member, in order.
   */
  const resolve = function resolver(pathCrumbs = [], tree = {}, target = []) {
    if ((typeof pathCrumbs === 'object') && (pathCrumbs.length === 0)) {
      throw new Error('A blank version was provided.');
    }

    if (pathCrumbs.filter(n => (!isNaN(parseInt(n, 10)))).length < pathCrumbs.length) {
      throw new Error('An invalid path member was provided.');
    }

    if (_.keys(tree).length === 0) {
      throw new Error('The version object is empty.');
    }
    return getVersionHasTarget(pathCrumbs, tree, target);
  };

  /**
   * Function to check if this version exists in this object
   * and return it or the nearest version upwards in the tree.
   *
   * @param {array} pathCrumbs
   *   An array collection of version paths, one per member, in order.
   *   The path crumbs indicates from where we will start looking.
   * @param {object} tree
   *   An object with version keys and possible other properties.
   *
   * @return {array}
   *   The path or nearest path upwards, up as an array collection of
   *   version paths, one per member, in order.
   */
  const getVersion = function versionGetter(pathCrumbs, tree) {
    const tempTarget = _.get(tree, pathCrumbs);
    if (tempTarget) {
      return pathCrumbs;
    }
    return getPreviousClosestVersion(pathCrumbs, tree);
  };

  /**
   * TODO
   *
   * @param {array} pathCrumbs
   *   TODO
   * @param {Object} tree
   *   TODO
   * @param {array} target
   *   TODO
   *
   * @return {array}
   *   TODO
   */
  const versionAttribute = function getVersionAttribute(pathCrumbs = [], tree = {}, target = []) {
    let targetItem = {};
    const attributePath = resolve(pathCrumbs, tree, target);
    if ((typeof attributePath === 'object') && attributePath.length) {
      attributePath.push(target);
      targetItem = _.get(tree, attributePath);
    }
    return targetItem;
  };

  // Expose functions.
  // TODO - maybe consider assigning these to versionAttribute.prototype and
  // instantiating a new versionAttribute for use?
  versionAttribute.resolve = resolve;
  versionAttribute.ascendPath = ascendPath;
  versionAttribute.descendPath = descendPath;
  versionAttribute.getVersionHasTarget = getVersionHasTarget;
  versionAttribute.getPreviousClosestVersion = getPreviousClosestVersion;
  versionAttribute.getVersion = getVersion;

  return versionAttribute;
};
