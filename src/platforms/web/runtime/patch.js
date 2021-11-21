/* @flow */

import * as nodeOps from 'web/runtime/node-ops'
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index'
import platformModules from 'web/runtime/modules/index'

// the directive module should be applied last, after all
// built-in modules have been applied.
const modules = platformModules.concat(baseModules)

// patch函数，由该方法生成，说明它也是一个高阶函数，是一个柯里化的函数
export const patch: Function = createPatchFunction({ nodeOps, modules })
