/* @flow */

import { toArray } from '../util/index'

export function initUse (Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    // 此处的this指向Vue构造函数，这里的常量是记录已安装的插件
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if (installedPlugins.indexOf(plugin) > -1) {
      // 已注册则直接返回当前构造函数
      return this
    }

    // additional parameters
    // 把数组中的第一个元素（plugin）去掉，保留可能传入的参数
    const args = toArray(arguments, 1)
    // 将Vue构造函数作为第一个参数进行传递，这也是开发Vue插件的一个规范
    args.unshift(this)
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }
    // 注册好后，将插件存储起来
    installedPlugins.push(plugin)
    
    return this
  }
}
