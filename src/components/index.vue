<template>
  <div class="level-drag-main">
    <template v-for="item of state.dragData" :key="item[props.id]">
      <dragLevelItem :dragItem="item" :groupList="state.dragData" v-bind="$attrs">
        <!-- 通过便利实现插槽透传 -->
        <template v-for="(_, key, index) in $slots" :key="index" #[key]="args">
          <slot :name="key" v-bind="args"></slot>
        </template>
      </dragLevelItem>
    </template>

    <div class="level-drag-plan-item-line"></div>
  </div>
</template>

<script setup lang="ts">
import { reactive, nextTick, provide } from "vue";
import { dragProps } from "./index";
import "./style/index.css";

import dragLevelItem from "./dragLevelItem.vue";

defineOptions({
  name: "vueDragLevel",
});

const state = reactive({
  dragData: [] as Array<any>,
});

const itemState = reactive({
  dragFromInfo: {
    item: {} as { [key: string]: any },
  },
  dragToInfo: {
    item: {} as { [key: string]: any },
    groupList: [] as Array<any>,
    event: {} as DragEvent,
    direction: "",
  },
  currentY: 0,
  isHandleDrop: false, // 是否在执行项其他事件（为了不触发项拖拽事件）
  isHandleDragStart: false, // 项是否开始拖拽了
  isHandleGroupDrag: false, // 组是否开始拖拽了
});

provide("state", itemState);

const props = defineProps(dragProps);
provide("props", props);

/**
 * 指定元素是否有拖拽的权限
 * @param {*} id 指定元素的id
 * 返回true有权限，false没权限
 */
function hasDragPermission(item: any) {
  return new Promise((resolve) => {
    nextTick(() => {
      let parentDom = document.querySelector(
        `#levelDrag${item[props.id]}`
      ) as HTMLElement;

      let domClass: String = "";
      for (let i = 0; i < parentDom.children.length; i++) {
        const item = parentDom.children[i];
        domClass = domClass + item.className;
      }

      let flag = true;

      flag = !props.noDragClass.find((x) => domClass.includes(x));

      resolve(flag);
    });
  });
}

initData(props.data);

function initData(data: Array<any>) {
  let result: any = [];

  data.forEach((x: any) => {
    const groupKey = `${new Date().getTime()}group${x[props.id]}`;
    const obj = {} as { [key: string]: any };
    obj.topId = groupKey;
    obj[props.id] = groupKey;

    // 给第一层虚构父级
    if (!x[props.groupKey]) {
      x[props.groupKey] = groupKey;
      obj[props.groupKey] = groupKey;
      obj[props.groupListKey] = [x];

      result.push(obj);
    } else {
      obj[props.id] = x[props.groupKey];

      let findIndex = result.findIndex(
        (res: any) => res[props.groupKey] === x[props.groupKey]
      );
      if (findIndex > -1) {
        result[findIndex][props.groupListKey].push(x);
      } else {
        obj[props.groupKey] = x[props.groupKey];
        obj[props.groupListKey] = [x];

        result.push(obj);
      }
    }
  });

  state.dragData = result;

  state.dragData.forEach((item: any) => {
    item.level = 0;
    item.draggable = true;

    setChildrenData(item);
  });

  console.log("初始化数据完成：", state.dragData);
  provide("dragData", state.dragData);
}

function setChildrenData(item: any, level: number = 1) {
  item[props.groupListKey].forEach(async (x2: any, index: number) => {
    if (!x2[props.groupKey]) {
      x2[props.groupKey] = item[props.id];
    }

    if (index > 0) {
      level = item[props.groupListKey][index - 1].level;
    }

    x2.level = level;
    x2.topId = item.topId;

    if (item.draggable) {
      x2.draggable = await hasDragPermission(x2);
    } else {
      x2.draggable = item.draggable;
    }

    if (x2[props.groupListKey]?.length > 0) {
      setChildrenData(x2, ++level);
    }
  });
}
</script>
