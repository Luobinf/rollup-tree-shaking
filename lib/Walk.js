const { isObj, isArray } = require("./utils");

// 深度优先遍历AST Node
function walk(node, { enter, leave }) {
  visit(node, null, enter, leave);
}

function visit(node, parent, enter, leave) {
  if (enter && typeof enter === "function") {
    enter.call(null, node, parent);
  }

  const keys = Object.keys(node).filter((key) => isObj(node[key]));
  
  keys.forEach((key) => {
    let val = node[key];
    if (isArray(val)) {
      val.forEach((item) => {
        visit(item, node, enter, leave);
      });
    } else if (val && val.type) {
      visit(val, node, enter, leave);
    }
  });

  if (leave && typeof leave === "function") {
    leave.call(null, node, parent);
  }
}

function replaceIdentifiers(statement, source, replacements) {
  walk(statement, {
    enter(node) {
      if (node.type === "Identifier") {
        if (node.name && replacements[node.name]) {
          source.overwrite(node.start, node.end, replacements[node.name]);
        }
      }
    },
  });
}

module.exports = {
  replaceIdentifiers,
  walk
};
