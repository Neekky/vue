/* @flow */

import { makeMap, isBuiltInTag, cached, no } from "shared/util";

let isStaticKey;
let isPlatformReservedTag;

const genStaticKeysCached = cached(genStaticKeys);

/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 */
export function optimize(root: ?ASTElement, options: CompilerOptions) {
  // 是否传入root
  if (!root) return;
  isStaticKey = genStaticKeysCached(options.staticKeys || "");
  isPlatformReservedTag = options.isReservedTag || no;
  // first pass: mark all non-static nodes.
  // 标记root中所有静态节点
  markStatic(root);
  // second pass: mark static roots.
  // 标记root中所有静态根节点
  markStaticRoots(root, false);
}

function genStaticKeys(keys: string): Function {
  return makeMap(
    "type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap" +
      (keys ? "," + keys : "")
  );
}

function markStatic(node: ASTNode) {
  node.static = isStatic(node);

  // type为1，则是元素节点，则会去遍历它的子元素节点
  if (node.type === 1) {
    // do not make component slot content static. this avoids
    // 1. components not able to mutate slot nodes
    // 2. static slot content fails for hot-reloading
    // 这里判断了是否为保留标签，目的是判断是否为组件。如果是组件，则不把组件中的slot标记为静态节点
    // 如果组件中的slot被标记为静态节点，那么将来就没法改变
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== "slot" &&
      node.attrsMap["inline-template"] == null
    ) {
      return;
    }
    // 遍历children
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i];
      // 标记静态
      markStatic(child);
      if (!child.static) {
        // 如果有一个 child 不是 static，那么当前 node 就不是 static
        node.static = false;
      }
    }
    // 处理条件渲染中的AST对象
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        const block = node.ifConditions[i].block;
        markStatic(block);
        if (!block.static) {
          node.static = false;
        }
      }
    }
  }
}

function markStaticRoots(node: ASTNode, isInFor: boolean) {
  // 判断是否为元素类型
  if (node.type === 1) {
    // 判断是否为静态的，或者只渲染一次
    if (node.static || node.once) {
      // 来标记该节点在for循环中，是否是静态的
      node.staticInFor = isInFor;
    }
    // For a node to qualify as a static root, it should have children that
    // are not just static text. Otherwise the cost of hoisting out will
    // outweigh the benefits and it's better off to just always render it fresh.
    // 如果一个元素内只有文本节点，此时这个元素不是静态的Root
    // Vue 认为这种优化会带来负面的影响
    if (
      node.static &&
      node.children.length &&
      !(node.children.length === 1 && node.children[0].type === 3)
    ) {
      node.staticRoot = true;
      return;
    } else {
      node.staticRoot = false;
    }
    // 检测当前节点的子节点中是否有静态的Root
    if (node.children) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for);
      }
    }
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        markStaticRoots(node.ifConditions[i].block, isInFor);
      }
    }
  }
}

function isStatic(node: ASTNode): boolean {
  // 类型为2，是表达式。例如插值表达式，它的内容会发生变化
  if (node.type === 2) {
    // expression
    return false;
  }
  // 静态文本内容
  if (node.type === 3) {
    // text
    return true;
  }
  // 如果以下条件都满足，则是一个静态节点
  return !!(
    node.pre ||
    (!node.hasBindings && // no dynamic bindings
      !node.if &&
      !node.for && // not v-if or v-for or v-else
      !isBuiltInTag(node.tag) && // not a built-in 不能是内置组件
      // 是平台保留的标签
      isPlatformReservedTag(node.tag) && // not a component 不能是组件
      !isDirectChildOfTemplateFor(node) && // 不能是v-for下的直接子节点
      Object.keys(node).every(isStaticKey))
  );
}

function isDirectChildOfTemplateFor(node: ASTElement): boolean {
  while (node.parent) {
    node = node.parent;
    if (node.tag !== "template") {
      return false;
    }
    if (node.for) {
      return true;
    }
  }
  return false;
}
