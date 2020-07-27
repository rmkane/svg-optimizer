class TreeUtils {
  static traverse(root, walkFn) {
    if (root == null) return;
    walkFn(root);
    if (root.elements) {
      root.elements.forEach((child) => TreeUtils.traverse(child, walkFn));
    }
  }

  static findBy(root, criteria) {
    const results = [];
    TreeUtils.traverse(root, (node) => {
      if (TreeUtils.matchesCriteria(node, criteria)) {
        results.push(node);
      }
    });
    return results;
  }

  static prune(root, criteria) {
    if (root == null) return;
    if (root.elements) {
      for (let i = root.elements.length - 1; i >= 0; i--) {
        const child = root.elements[i];
        if (TreeUtils.matchesCriteria(child, criteria)) {
          root.elements.splice(i, 1);
        } else {
          TreeUtils.prune(child, criteria);
        }
      }
    }
  }

  static matchesCriteria(node, criteria) {
    if (criteria.type && node.type !== criteria.type) {
      return false;
    }
    if (criteria.name && node.name !== criteria.name) {
      return false;
    }
    if (criteria.id && node.attributes && node.attributes.id !== criteria.id) {
      return false;
    }
    return true;
  }
}

module.exports = TreeUtils;
