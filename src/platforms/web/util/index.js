/* @flow */

import { warn } from 'core/util/index'

export * from './attrs'
export * from './class'
export * from './element'

/**
 * Query an element selector if it's not an element already.
 */
export function query (el: string | Element): Element {
  if (typeof el === 'string') {
    const selected = document.querySelector(el)
    if (!selected) {
      // 如果找不到根元素，在非生产环境下会报出警告
      process.env.NODE_ENV !== 'production' && warn(
        'Cannot find element: ' + el
      )
      // 默认创建一个div标签返回
      return document.createElement('div');
    }
    return selected
  } else {
    return el
  }
}
