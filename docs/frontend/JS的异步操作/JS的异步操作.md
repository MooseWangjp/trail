# Javascript的异步操作

## 简介

Javascript的所有异步操作都是基于一个前提：Javascript是一个单线程语言，通过事件循环才实现的异步非阻塞。所以不管是最早的回调函数，还是Promise，以及现在流行的async/await，所有的异步优化都是在单线程事件循环的机制下进行的。


