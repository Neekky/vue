/* @flow */

import { parse } from "./parser/index";
import { optimize } from "./optimizer";
import { generate } from "./codegen/index";
import { createCompilerCreator } from "./create-compiler";

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
// 此处又通过createCompilerCreator处理，传入了一个核心函数，再返回一个函数
export const createCompiler = createCompilerCreator(function baseCompile(
  template: string,
  options: CompilerOptions
): CompiledResult {
  // 把模板转换成 ast 抽象语法树
  // 抽象语法树，用来以树形的方式描述代码结构
  const ast = parse(template.trim(), options);
  if (options.optimize !== false) {
    // 优化抽象语法树
    optimize(ast, options);
  }
  console.log(options, "options1123");
  // 把抽象语法树生成字符串形式的 js 代码
  const code = generate(ast, options);
  console.log(code, "查看优化后的code");
  return {
    ast,
    // 渲染函数
    render: code.render,
    // 静态渲染函数，生成静态 VNode 树
    staticRenderFns: code.staticRenderFns,
  };
});
