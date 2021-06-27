/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'
import { observe } from 'core/observer/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'

export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    // 如果是非生产环境，则会添加一个set方法，警告开发人员，不要去给config对象重新赋值
    configDef.set = () => {
      console.log("我被设置啦")
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  const testConfigDef = {}
  testConfigDef.get = () => {
    return {a: 1}
  }
  if (process.env.NODE_ENV !== 'production') {
    // 如果是非生产环境，则会添加一个set方法，警告开发人员，不要去给config对象重新赋值
    testConfigDef.set = () => {
      console.log("我被设置啦")
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  // 初始化Vue config对象
  Object.defineProperty(Vue, 'config', configDef)
  Object.defineProperty(Vue, 'testConfig', testConfigDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  // 这些工具不视作全局Api的一部分，除非你已经意识到某些风险，否则不要去依赖它们
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }

  // 定义静态方法
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  // 让一个对象可响应
  Vue.observable = <T>(obj: T): T => {
    observe(obj)
    return obj
  }

  // 初始化 Vue.options 对象，并给其扩展
  // 也就是'components','directives','filters'，存储全局的组件、指令、过滤器
  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  // 记录当前的Vue构造函数
  Vue.options._base = Vue

  // 注册了内置的keep-alive组件到全局，这里把一个对象所有属性拷贝到另一个对象中来
  // 
  extend(Vue.options.components, builtInComponents)

  // 注册Vue.use()用来注册组件
  initUse(Vue)
  // 注册Vue.mixin()实现混入
  initMixin(Vue)
  // 注册Vue.extend()基于传入的options返回一个组件的构造函数
  initExtend(Vue)
  // 注册Vue.directive()、Vue.component()、Vue.filter()
  initAssetRegisters(Vue)
}
