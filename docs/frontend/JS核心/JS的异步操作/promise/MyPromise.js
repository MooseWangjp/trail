/**
 * Promise 构造函数
 *
 * @param {Function} executor - 执行器函数，接收 resolve 和 reject 两个参数
 *
 * 【设计原理】
 * 1. 使用立即执行函数模式：new Promise 时立即执行 executor
 * 2. 捕获 executor 中的同步错误，自动 reject
 * 3. 维护内部状态：state、value、reason
 * 4. 维护回调队列：onFulfilledCallbacks、onRejectedCallbacks
 */
class MyPromise {
  // 三种状态的常量定义
  static PENDING = 'pending'
  static FULFILLED = 'fulfilled'
  static REJECTED = 'rejected'

  constructor(executor) {
    // 初始化状态为 pending
    this.state = MyPromise.PENDING
    // 成功的值
    this.value = undefined
    // 失败的原因
    this.reason = undefined
    // 成功回调的队列（支持多个 then 调用）
    this.onFulfilledCallbacks = []
    // 失败回调的队列
    this.onRejectedCallbacks = []

    // ==================== resolve 函数 ====================
    /**
     * resolve 函数 - 将 Promise 状态改为 fulfilled
     *
     * @param {*} value - 成功的值
     *
     * 【执行流程】
     * 1. 检查状态：只有 pending 状态才能改变（保证状态不可逆）
     * 2. 修改状态：pending → fulfilled
     * 3. 保存值：存储成功的结果
     * 4. 执行回调：遍历执行所有已注册的成功回调
     */
    const resolve = (value) => {
      // 只有 pending 状态才能转变
      if (this.state === MyPromise.PENDING) {
        this.state = MyPromise.FULFILLED
        this.value = value

        // 异步执行所有成功回调
        // 使用 setTimeout 模拟微任务（实际应该是 queueMicrotask 或 MutationObserver）
        setTimeout(() => {
          this.onFulfilledCallbacks.forEach(callback => callback(this.value))
        })
      }
    }

    // ==================== reject 函数 ====================
    /**
     * reject 函数 - 将 Promise 状态改为 rejected
     *
     * @param {*} reason - 失败的原因
     *
     * 【执行流程】
     * 1. 检查状态：只有 pending 状态才能改变
     * 2. 修改状态：pending → rejected
     * 3. 保存原因：存储失败的原因
     * 4. 执行回调：遍历执行所有已注册的失败回调
     */
    const reject = (reason) => {
      if (this.state === MyPromise.PENDING) {
        this.state = MyPromise.REJECTED
        this.reason = reason

        // 异步执行所有失败回调
        setTimeout(() => {
          this.onRejectedCallbacks.forEach(callback => callback(this.reason))
        })
      }
    }

    // ==================== 立即执行 executor ====================
    /**
     * 【为什么立即执行？】
     * 这是 Promise 的设计规范：new Promise 时，executor 立即同步执行。
     * 异步操作由开发者自己在 executor 中发起（如 setTimeout、ajax 等）。
     *
     * 【错误处理】
     * 使用 try-catch 捕获 executor 中的同步错误，
     * 如果出错则自动 reject 这个 Promise。
     */
    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  // ==================== then 方法 ====================
  /**
   * then 方法 - Promise 的核心方法
   *
   * @param {Function} onFulfilled - 成功时的回调
   * @param {Function} onRejected - 失败时的回调
   * @returns {MyPromise} 返回新的 Promise（支持链式调用）
   *
   * 【Promise/A+ 规范要求】
   * 1. then 方法必须返回一个 Promise
   * 2. onFulfilled 和 onRejected 都是可选参数
   * 3. 如果不是函数，必须被忽略（实现值穿透）
   * 4. then 可以被同一个 Promise 调用多次
   * 5. 回调必须异步执行
   *
   * 【执行流程】
   * 1. 参数校验：确保回调是函数，否则实现值穿透
   * 2. 返回新 Promise：每个 then 都返回新的 Promise 实例
   * 3. 根据当前状态分情况处理：
   *    - 已成功：异步执行 onFulfilled
   *    - 已失败：异步执行 onRejected
   *    - 待定中：将回调加入队列
   * 4. 处理返回值：根据回调返回值决定新 Promise 的状态
   */
  then(onFulfilled, onRejected) {
    // ==================== 值穿透实现 ====================
    /**
     * 【值穿透原理】
     * 当 onFulfilled/onRejected 不是函数时，
     * 应该把上层 Promise 的值/value 传递给下一层。
     *
     * 例如：promise.then().then(value => console.log(value))
     * 第一个 then 没有传回调，值会"穿透"到第二个 then。
     */
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }

    // ==================== 返回新 Promise ====================
    /**
     * 【为什么返回新 Promise？】
     * 1. 支持链式调用
     * 2. 每个 then 都是独立的，可以分别处理
     * 3. 避免状态被意外修改
     */
    const promise2 = new MyPromise((resolve, reject) => {

      // ==================== 成功状态处理 ====================
      /**
       * 【微任务模拟】
       * 使用 setTimeout 确保 then 的回调异步执行。
       * 这是 Promise/A+ 规范的要求，确保：
       * 1. 回调在当前同步代码执行完毕后才执行
       * 2. 所有 then 回调按注册顺序执行
       */
      if (this.state === MyPromise.FULFILLED) {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value)
            // 【关键】处理返回值，决定新 Promise 的状态
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      }

      // ==================== 失败状态处理 ====================
      if (this.state === MyPromise.REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      }

      // ==================== 待定状态处理 ====================
      /**
       * 【为什么需要队列？】
       * 当 Promise 还在 pending 状态时，then 被调用，
       * 此时回调不能立即执行，需要暂存到队列中。
       * 等到 resolve/reject 被调用时，再执行队列中的回调。
       *
       * 这就是为什么可以"先调用 then，后改变状态"。
       */
      if (this.state === MyPromise.PENDING) {
        this.onFulfilledCallbacks.push((value) => {
          setTimeout(() => {
            try {
              const x = onFulfilled(value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          })
        })

        this.onRejectedCallbacks.push((reason) => {
          setTimeout(() => {
            try {
              const x = onRejected(reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          })
        })
      }
    })

    return promise2
  }

  // ==================== catch 方法 ====================
  /**
   * catch 方法 - 错误处理的语法糖
   *
   * @param {Function} onRejected - 失败时的回调
   * @returns {MyPromise} 返回新的 Promise
   *
   * 【实现原理】
   * catch 等同于 then(null, onRejected)
   * 它只是 then 方法的一个便捷写法。
   */
  catch(onRejected) {
    return this.then(null, onRejected)
  }

  // ==================== finally 方法 ====================
  /**
   * finally 方法 - 无论成功失败都会执行的回调
   *
   * @param {Function} callback - 最终执行的回调
   * @returns {MyPromise} 返回新的 Promise
   *
   * 【实现原理】
   * 1. 无论成功还是失败都执行 callback
   * 2. 传递上层的值/value 给下一个 then
   * 3. 如果 callback 返回 Promise，等待其完成
   */
  finally(callback) {
    return this.then(
      value => MyPromise.resolve(callback()).then(() => value),
      reason => MyPromise.resolve(callback()).then(() => { throw reason })
    )
  }

  // ==================== 静态方法：resolve ====================
  /**
   * Promise.resolve - 创建一个已成功的 Promise
   *
   * @param {*} value - 要 resolve 的值
   * @returns {MyPromise}
   *
   * 【处理逻辑】
   * 1. 如果是 Promise 实例，直接返回
   * 2. 如果是 thenable 对象，将其转为 Promise
   * 3. 其他值包装为 fulfilled Promise
   */
  static resolve(value) {
    if (value instanceof MyPromise) {
      return value
    }
    return new MyPromise((resolve) => {
      resolve(value)
    })
  }

  // ==================== 静态方法：reject ====================
  /**
   * Promise.reject - 创建一个已失败的 Promise
   *
   * @param {*} reason - 拒绝的原因
   * @returns {MyPromise}
   *
   * 【注意】
   * 即使 reason 是一个 Promise，也会原样作为拒绝原因，
   * 不会等待其完成（这与 resolve 不同）。
   */
  static reject(reason) {
    return new MyPromise((_, reject) => {
      reject(reason)
    })
  }

  // ==================== 静态方法：all ====================
  /**
   * Promise.all - 所有成功才成功，有一个失败就失败
   *
   * @param {Array} promises - Promise 数组
   * @returns {MyPromise}
   *
   * 【执行流程】
   * 1. 创建结果数组
   * 2. 计数已完成的 Promise 数量
   * 3. 每个 Promise 成功时，保存结果并计数
   * 4. 全部成功后，resolve 结果数组
   * 5. 有一个失败，立即 reject
   */
  static all(promises) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        return reject(new TypeError('Argument must be an array'))
      }

      const result = []
      let count = 0
      const length = promises.length

      if (length === 0) {
        return resolve(result)
      }

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          value => {
            result[index] = value
            count++
            if (count === length) {
              resolve(result)
            }
          },
          reason => {
            reject(reason)
          }
        )
      })
    })
  }

  // ==================== 静态方法：race ====================
  /**
   * Promise.race - 谁先完成就返回谁的结果
   *
   * @param {Array} promises - Promise 数组
   * @returns {MyPromise}
   *
   * 【执行流程】
   * 1. 遍历所有 Promise
   * 2. 第一个完成（成功或失败）的结果就是最终结果
   * 3. 一旦有结果，立即返回
   */
  static race(promises) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        return reject(new TypeError('Argument must be an array'))
      }

      promises.forEach(promise => {
        MyPromise.resolve(promise).then(resolve, reject)
      })
    })
  }

  // ==================== 静态方法：allSettled ====================
  /**
   * Promise.allSettled - 等待所有 Promise 完成，无论成功失败
   *
   * @param {Array} promises - Promise 数组
   * @returns {MyPromise}
   *
   * 【返回格式】
   * 每个结果都是 { status: 'fulfilled'|'rejected', value?: any, reason?: any }
   */
  static allSettled(promises) {
    return new MyPromise((resolve) => {
      if (!Array.isArray(promises)) {
        return reject(new TypeError('Argument must be an array'))
      }

      const result = []
      let count = 0
      const length = promises.length

      if (length === 0) {
        return resolve(result)
      }

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          value => {
            result[index] = { status: 'fulfilled', value }
            count++
            if (count === length) {
              resolve(result)
            }
          },
          reason => {
            result[index] = { status: 'rejected', reason }
            count++
            if (count === length) {
              resolve(result)
            }
          }
        )
      })
    })
  }

  // ==================== 静态方法：any ====================
  /**
   * Promise.any - 只要有一个成功就成功，全部失败才失败
   *
   * @param {Array} promises - Promise 数组
   * @returns {MyPromise}
   *
   * 【与 all 的区别】
   * - all：全部成功才成功，有一个失败就失败
   * - any：有一个成功就成功，全部失败才失败
   */
  static any(promises) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        return reject(new TypeError('Argument must be an array'))
      }

      const errors = []
      let count = 0
      const length = promises.length

      if (length === 0) {
        return reject(new AggregateError('All promises were rejected'))
      }

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          value => {
            resolve(value)
          },
          reason => {
            errors[index] = reason
            count++
            if (count === length) {
              reject(new AggregateError('All promises were rejected', errors))
            }
          }
        )
      })
    })
  }
}

// ==================== 辅助函数：resolvePromise ====================
/**
 * resolvePromise - Promise Resolution Procedure
 *
 * 这是 Promise/A+ 规范的核心部分，处理 then 回调的返回值。
 *
 * @param {MyPromise} promise2 - then 返回的新 Promise
 * @param {*} x - then 回调的返回值
 * @param {Function} resolve - promise2 的 resolve
 * @param {Function} reject - promise2 的 reject
 *
 * 【核心作用】
 * 根据回调返回值 x，决定 promise2 的状态：
 * 1. x 是普通值 → promise2 fulfilled，值为 x
 * 2. x 是 Promise → 等待 x 完成，结果传给 promise2
 * 3. x 是 thenable → 调用其 then 方法
 * 4. x 与 promise2 相同 → 循环引用，报错
 *
 * 【Promise/A+ 规范要点】
 */
function resolvePromise(promise2, x, resolve, reject) {
  // ==================== 规范 2.3.1：循环引用检测 ====================
  /**
   * 【循环引用问题】
   * 如果 x 就是 promise2 本身，会造成循环引用：
   * promise2 的状态依赖 x，而 x 就是 promise2，
   * 永远无法确定状态。
   *
   * 例如：
   * const promise = new Promise(resolve => {
   *   resolve(promise)  // 错误！
   * })
   */
  if (x === promise2) {
    return reject(new TypeError('Chaining cycle detected'))
  }

  // ==================== 规范 2.3.2：x 是 Promise 或 thenable ====================
  /**
   * 【thenable 对象】
   * thenable 是指具有 then 方法的对象。
   * Promise 是一种特殊的 thenable。
   *
   * 为了兼容其他 Promise 实现，需要处理 thenable。
   */
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    let called = false  // 防止多次调用

    try {
      const then = x.then

      // 判断是否是 thenable（有 then 方法）
      if (typeof then === 'function') {
        // ==================== 调用 thenable 的 then ====================
        /**
         * 【为什么用 call？】
         * 使用 then.call(x, ...) 而不是 x.then(...)
         * 1. 确保 then 方法中的 this 指向 x
         * 2. 避免访问 x.then 时可能抛出的错误
         */
        then.call(
          x,
          // x 成功的回调
          value => {
            if (called) return
            called = true
            // 【递归调用】处理返回值可能仍然是 thenable
            resolvePromise(promise2, value, resolve, reject)
          },
          // x 失败的回调
          reason => {
            if (called) return
            called = true
            reject(reason)
          }
        )
      } else {
        // 是普通对象，但有 then 属性（不是函数）
        resolve(x)
      }
    } catch (error) {
      // ==================== 规范 2.3.3.2：then 调用抛出异常 ====================
      if (called) return
      called = true
      reject(error)
    }
  } else {
    // ==================== 规范 2.3.4：x 是普通值 ====================
    /**
     * 【普通值包括】
     * - 基本类型：string, number, boolean, null, undefined, symbol
     * - 没有 then 方法的普通对象
     * - 函数（除了 thenable）
     */
    resolve(x)
  }
}

// ==================== AggregateError 实现 ====================
/**
 * AggregateError - Promise.any 失败时的错误类型
 *
 * ES2021 引入，用于表示多个错误的聚合。
 */
class AggregateError extends Error {
  constructor(message, errors = []) {
    super(message)
    this.name = 'AggregateError'
    this.errors = errors
  }
}