import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// 创建Vue的构造函数
// 设置Vue实例的成员

// 此处不用class是因为方便后续给Vue实例混入实例成员
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 调用 _init() 方法
  this._init(options)
}

// 以下函数的作用都是给Vue的原型上，混入一些成员方法

// 注册 vm 的 _init() 方法，初始化 vm，相当于整个Vue的入口
initMixin(Vue)

// 注册 vm 的 $data/$props/$set/$delete/$watch
stateMixin(Vue)

// 初始化事件相关方法
// $on/$once/$off/$emit
eventsMixin(Vue)

// 初始化生命周期相关的混入方法
// _update/$forceUpdate/$destroy
lifecycleMixin(Vue)

// 混入 render
// $nextTick/_render
renderMixin(Vue)

export default Vue

