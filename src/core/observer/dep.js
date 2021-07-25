/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'

// 初始为0
let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    // 每创建一个dep，都会使id++
    this.id = uid++
    this.subs = []
  }

  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  // 将观察对象和watcher建立依赖
  depend () {
    if (Dep.target) {
      // 如果 target 存在，则把 dep 对象添加到 watcher 的依赖中
      // 此时的this指向的是dep实例？没错，因为方法是dep实例所调用的。
      Dep.target.addDep(this)
    }
  }

  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
// Dep.target 用来存放目前正在使用的watcher
// 全局唯一，并且一次也只能有一个watcher被使用
Dep.target = null
const targetStack = []

export function pushTarget (target: ?Watcher) {
  // 将当前target（watcher实例）入栈，并将当前target（watcher实例）赋值给target
  targetStack.push(target)
  Dep.target = target
}

export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
