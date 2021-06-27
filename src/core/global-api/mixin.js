/* @flow */

import { mergeOptions } from '../util/index'

export function initMixin (Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    // 将传入的选项混入Vue构造函数的options中
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
