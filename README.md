# vue-drag-level

[![npm](https://img.shields.io/npm/v/vue-drag-level.svg) ![npm](https://img.shields.io/npm/dt/vue-drag-level.svg)](https://www.npmjs.com/package/vue-drag-level)
[![vue3](https://img.shields.io/badge/vue-3.x-brightgreen.svg)](https://cn.vuejs.org/)

Vue3 component that simulates a user typing, selecting, and erasing text.

Checkout the offical project [here](https://github.com/MQYForverT/vue-drag-level).

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [Example](#examples)

## 效果
下图中你不喜欢的图标皆提供插槽以供自定义

1、第一层拖拽为组
![](https://oss-cdn.mashibing.com/default/634cfd9e6405685a2bd03efcd84d9846.gif)

2、树形拖拽
![](https://oss-cdn.mashibing.com/default/dcf89b00b2a6fd98239fd2e00fd99c28.gif)

# Installation

```
npm install --save vue-drag-level
```

## Global import

Install the component:

```js
import { createApp } from 'vue' 
import vueDragLevel from "vue-drag-level";
import "vue-drag-level/dist/style.css"; 
import App from './App.vue' 

const app = createApp(App) 
app.use(vueDragLevel) 
app.mount('#app')
```

## Manual import

```html
<template>
  <div>
    <dragLevel
      groupDrag
      treeDrag
      :data="departResultStrings"
      :no-drag-class="['itemDisabled']"
      @onDragEnd="onDragEnd"
      @delItem="delItem"
    >
      <template #default="{ item }">
        <div
          :class="{
            itemBox: true,
            itemDisabled: item.id == 1,
          }"
        >
          <span>{{ item.name }}</span>
        </div>
      </template>
    </dragLevel>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import dragLevel from "./components/index.vue";

const departResultStrings = ref([
  {
    id: 1,
    name: "row1",
  },
  {
    id: 3,
    name: "row3",
  },
  {
    id: 2,
    name: "row2",
  },
  {
    id: 4,
    name: "row4",
  },
  {
    id: 5,
    name: "row5",
  },
  {
    id: 6,
    name: "row6",
  },
  {
    id: 7,
    name: "row7",
  },
]);

function onDragEnd(res: any) {
  console.log(res);
}

function delItem(res: any, fn: Function) {
  // 执行自己的逻辑
  console.log(res);

  // 回调如果false，阻止组件的默认删除行为
  fn(true);
}
</script>

<style scoped>
.itemBox {
  padding: 5px 10px;
  border-bottom: 1px solid #ccc;
}
</style>
```

## Properties

你可以使用以下属性:

| 参数      | 类型         | 默认值 | 说明              |
| ------------- | ------------ | --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| data          | Array |    []     | 显示的数据 |
| id          | String |     id  |  唯一id-key
| noDragClass    | Array       | []     | 禁止拖拽的class元素                       |
| treeDrag     | Boolean       | false      | 允许树形拖拽，拖拽时，虚线左边是同级，虚线右边是子级     |
| levelGap | String       | 30px     | 树形中，不同层级的间隔                                        |
| groupDrag     | Boolean       | false      | 允许第一级拖拽成组           |
| groupKey     | String       | parentId        | 唯一父级key                   |
| groupListKey     | String       | children        | 唯一子级List-key                   |
| showGroupTagLine     | Boolean       | true        | 是否显示不同组之间的分隔标识线                  |
| groupDragHover     | Boolean       | true        | 组拖拽按钮鼠标浮动出现，默认true，为false将一存直在         |
| levelByTop     | Boolean       | false        | 组项离开组时回到最外层数组或者父层所在数组，默认回到父层所在数组                  |
| showDelBtn     | Boolean       | true        | 是否展示删除按钮        |

## Events

你能使用以下事件:

| 事件名称        | Description            | Usage                      |
| ------------ | ---------------------- | -------------------------- |
| onDragEnd     | 每次操作数据的回调 | `@onDragEnd="doSomeThing()"`     |
| delItem     | 点击删除的数据回调 | `@delItem="delItem()"`     |
```js
function delItem(res: any, fn: Function) {
  // 执行自己的逻辑
  console.log(res);

  // 回调如果false，阻止组件的默认删除行为
  fn(true);
}
```   

## Slots

你能使用以下插槽:

| 插槽名称   | 说明 |
| ------ | ----------- |
| default| 自定义列的内容，参数为 {item}      |
| joinGroup | 加入组的样式内容      |
| levelGroup | 离开组的样式内容      |
| groupDrag | 拖拽组的样式内容      |
| delete | 删除的样式内容      |

## Features

- [ ] 树形拖拽操作的交互优化，比如出现两个按钮替换虚线的左右
- [ ] 组拖拽为单行数据的子级
---

# License

[MIT](http://opensource.org/licenses/MIT)
