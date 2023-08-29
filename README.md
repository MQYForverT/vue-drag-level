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

![](https://oss-cdn.mashibing.com/default/634cfd9e6405685a2bd03efcd84d9846.gif)

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
    <vueDragLevel
      groupDrag
      :data="departResultStrings"
      :no-row-drag-class="['itemBox', 'itemDisabled']"
      :no-column-drag-class="['itemDisabled']"
      @onDragEnd="onDragEnd"
    >
      <template #default="{ item }">
        <div
          :class="{
            itemBox: true,
            itemDisabled: item.id < 3,
          }"
        >
          <span>{{ item.name }}</span>
        </div>
      </template>
    </vueDragLevel>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { vueDragLevel } from "vue-drag-level";
import "vue-drag-level/dist/style.css";

const departResultStrings = ref([
  {
    id: 1,
    name: "row1",
  },
  {
    id: 2,
    name: "row2",
  },
  {
    id: 3,
    name: "row3",
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
  {
    id: 8,
    name: "row8",
  },
]);

function onDragEnd(res: any) {
  console.log(res);
}
</script>
```

## Properties

你可以使用以下属性:

| 参数      | 类型         | 默认值 | 说明              |
| ------------- | ------------ | --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| data          | Array<object> |         | 显示的数据 |
| id    | String       | id      | 数据的唯一值key                                             |
| levelKey     | String       | level      | 不同等级的key区分值     |
| levelGap | String       | 30px     | 不同等级的间隔                                        |
| noRowDragClass    | Array<string>       | []     | 禁止横向拖拽的class元素                            |
| noColumnDragClass     | Array<string>    | []     | 禁止竖向拖拽的class元素                             |
| groupDrag     | Boolean       | false      | 开启组拖拽           |
| groupKey     | String       | groupId        | 组拖拽中的组key                   |
| groupItemStyle     | String       | border: 1px solid red;margin-bottom: 10px;        | 自定义组item样式                   |

## Events

你能使用以下事件:

| 事件名称        | Description            | Usage                      |
| ------------ | ---------------------- | -------------------------- |
| onDragEnd     | 每次拖拽的数据回调 | `@onDragEnd="doSmth()"`     |

## Slots

你能使用以下插槽:

| 插槽名称   | 说明 |
| ------ | ----------- |
| default| 自定义列的内容，参数为 {item}      |
| joinGroup | 组拖拽模式下，加入组的样式内容      |
| levelGroup | 组拖拽模式下，离开组的样式内容      |
| groupDrag | 组拖拽模式下，拖拽组的样式内容      |

## Features

暂时没有，欢迎来访

---

# License

[MIT](http://opensource.org/licenses/MIT)
