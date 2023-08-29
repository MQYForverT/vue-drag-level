<template>
  <div class="level-drag-main">
    <transition-group tag="div" name="list">
      <div
        v-for="(groupItem, groupIndex) of state.dragData"
        :key="groupItem[props.groupKey]"
        :style="groupItem.list.length > 1 && props.groupDrag ? props.groupItemStyle : ''"
        class="groupItem"
        :id="`levelGroupDrag${groupIndex}`"
        @mousedown="handleMouseDown($event, groupItem, groupIndex)"
        :draggable="groupItem.draggable"
        @dragstart="handleGroupDragStart($event)"
        @dragenter="handleGroupDragEnter(groupIndex, $event)"
        @dragover="handleGroupDragOver(groupIndex, $event)"
        @dragend="handleGroupDragEnd(groupItem, groupIndex)"
      >
        <transition-group tag="div" name="list">
          <div
            v-for="(item, index) of groupItem.list"
            :id="`levelDrag${item[props.id]}`"
            :key="item[props.id]"
            class="levelDragItem move"
            :class="{
              levelDragItemDisabled: !item.allowRowDrag && !item.allowColumnDrag,
            }"
            :style="
              !item[props.levelKey] || item[props.levelKey] === 1
                ? 'padding-left:0px'
                : `padding-left:${props.levelGap}`
            "
            :draggable="item.allowRowDrag || item.allowColumnDrag ? true : false"
            @dragstart="handleDragStart(item, $event)"
            @dragenter="handleDragEnter(item, $event)"
            @dragover="handleDragOver(item, $event)"
            @dragend="handleDragEnd(item, index, groupItem.list)"
          >
            <div v-if="props.groupDrag && (item.allowRowDrag || item.allowColumnDrag)">
              <div
                v-if="groupItem.list.length > 1"
                @click="levelGroup(item, index, groupItem.list)"
              >
                <slot name="levelGroup">
                  <div class="allowGroup levelGroup" title="脱离组">-></div>
                </slot>
              </div>
              <div
                v-else-if="
                  state.isHandleDragStart &&
                  state.dragFromInfo.item[props.id] !== item[props.id]
                "
                @drop="handleDrop(item, groupItem.list)"
              >
                <slot name="joinGroup">
                  <div class="allowGroup joinGroup" title="与之成组">-></div>
                </slot>
              </div>
            </div>
            <slot :item="item"></slot>
          </div>
        </transition-group>

        <div
          :id="`levelGroupSonDrag${groupIndex}`"
          v-if="groupItem.list.length > 1 && props.groupDrag"
        >
          <slot name="groupDrag">
            <div class="allowGroup joinGroup move" title="点我拖拽组">+</div>
          </slot>
        </div>
      </div>
    </transition-group>

    <div class="level-drag-plan-item-line"></div>
  </div>
</template>

<script setup lang="ts">
import { reactive, nextTick, onMounted } from "vue";
import { dragProps } from "./index";
import "./style/index.css";

defineOptions({
  name: "vueDragLevel",
});

const props = defineProps(dragProps);

const emit = defineEmits<{ (e: "onDragEnd", { }: any): void }>();

/**
 * 指定元素是否有拖拽的权限
 * @param {*} id 指定元素的id
 * @param {*} type 拖拽类型 ['row'. 'column']
 * 返回true有权限，false没权限
 */
type directionType = "row" | "column";
function hasDragPermission(id: number | string, type: directionType) {
  const parentDom = document.querySelector(`#levelDrag${id}`) as HTMLElement;

  let domClass: String = "";
  for (let i = 0; i < parentDom.children.length; i++) {
    const item = parentDom.children[i];
    domClass = domClass + item.className;
  }

  let flag = true;

  if (type === "row") {
    flag = !props.noRowDragClass.find((x) => domClass.includes(x));
  } else if (type === "column") {
    flag = !props.noColumnDragClass.find((x) => domClass.includes(x));
  }

  return flag;
}

const state = reactive({
  dragData: [] as any,
  dragFromInfo: {
    item: {} as { [key: string]: any },
  },
  dragToInfo: {
    item: {} as { [key: string]: any },
    index: -1,
    event: {} as DragEvent,
    direction: "",
  },
  currentY: 0,
  isHandleDrop: false, // 是否在执行handleDrop事件
  isHandleDragStart: false, // 是否在执行handleDragStart事件
  isHandleGroupDrag: false, // 组拖拽开始
});

onMounted(() => {
  initData(props.data);
});

function initData(data: Array<any>) {
  let result: any = [];

  data.forEach((x: any) => {
    const obj = {} as { [key: string]: any };
    obj.draggable = false;
    obj.list = [x];

    if (!x[props.groupKey]) {
      obj[props.groupKey] = `${new Date().getTime()}group${x[props.id]}`;
      result.push(obj);
    } else {
      let findIndex = result.findIndex(
        (res: any) => res[props.groupKey] === x[props.groupKey]
      );
      if (findIndex > -1) {
        result[findIndex].list.push(x);
      } else {
        obj[props.groupKey] = x[props.groupKey];

        result.push(obj);
      }
    }
  });

  state.dragData = result;

  nextTick(() => {
    state.dragData.forEach((item: any) => {
      item.list.forEach((x2: any) => {
        x2.allowRowDrag = hasDragPermission(x2[props.id], "row");
        x2.allowColumnDrag = hasDragPermission(x2[props.id], "column");
      });
    });
  });
}

function handleDragStart(item: any, event: DragEvent) {
  if (state.isHandleGroupDrag) {
    return;
  }
  state.isHandleDragStart = true;
  state.dragFromInfo.item = item;
  state.currentY = event.y;
  // 创建虚线
  lineClass("add", item, event);
}

// 记录进入的元素
function handleDragEnter(item: any, event: DragEvent) {
  if (state.isHandleGroupDrag) {
    return;
  }

  event.preventDefault();

  if (
    state.dragToInfo.item[props.id] &&
    state.dragToInfo.item[props.id] !== item[props.id]
  ) {
    // 移除样式
    bottomClass(state.dragToInfo.item, `#levelDrag${state.dragToInfo.item.id}`, "remove");
  }

  state.dragToInfo.item = item;
  state.currentY = event.y;
}

// 动态改变上底线或者下底线
function handleDragOver(item: any, event: DragEvent) {
  if (state.isHandleGroupDrag) {
    return;
  }

  event.preventDefault();
  if (state.dragToInfo.item[props.id]) {
    state.dragToInfo.event = event;

    if (event.y > state.currentY) {
      state.dragToInfo.direction = "bottom";
      bottomClass(item, `#levelDrag${item.id}`, "add", "bottom");
    } else {
      state.dragToInfo.direction = "top";
      bottomClass(item, `#levelDrag${item.id}`, "add", "top");
    }
  }
}

// 合并为组
function handleDrop(item: any, groupList: { [key: string]: any }[]) {
  if (state.isHandleGroupDrag) {
    return;
  }

  state.isHandleDrop = true;

  // 移除样式
  removeClass(item, `#levelDrag${item.id}`);

  // 当前item所在组的位置，一定要先找再删，不然先删就找不到了
  const currentIndex = findPosition(state.dragFromInfo.item[props.id]);
  const currenGroup = state.dragData[currentIndex].list;
  const currentGroupIndex = currenGroup.findIndex(
    (x: any) => x[props.id] === state.dragFromInfo.item[props.id]
  );
  //当前删除
  currenGroup.splice(currentGroupIndex, 1);

  if (currenGroup.length === 0) {
    state.dragData.splice(currentIndex, 1);
  }

  // 目标所在位置
  const targetGroupIndex = groupList.findIndex(
    (x: any) => x[props.id] === item[props.id]
  );

  // 成组
  if (state.dragToInfo.direction === "top") {
    groupList.splice(targetGroupIndex, 0, state.dragFromInfo.item);
  } else {
    groupList.splice(targetGroupIndex + 1, 0, state.dragFromInfo.item);
  }

  emit("onDragEnd", {
    oldItem: state.dragFromInfo.item,
    newItem: item,
    newData: getNewData(),
  });

  state.isHandleDragStart = false;
}

// 拖拽结束
function handleDragEnd(item: any, delIndex: number, groupList: []) {
  if (state.isHandleGroupDrag) {
    return;
  }

  if (state.isHandleDrop) {
    state.isHandleDrop = false;
    return;
  }

  if (state.dragToInfo.item[props.id]) {
    // 移除样式
    removeClass(state.dragToInfo.item, `#levelDrag${state.dragToInfo.item.id}`);

    //得到线的位置
    const centerLine = document.querySelector(
      ".level-drag-plan-item-line"
    ) as HTMLElement;
    const { x } = centerLine.getBoundingClientRect();

    if (item.allowRowDrag && state.dragToInfo.item.allowRowDrag) {
      // 判断目标数据是第一级还是第二级
      if (state.dragToInfo.event.x <= x) {
        item[props.levelKey] = 1;
      } else {
        item[props.levelKey] = 2;
      }
    }

    if (item.allowColumnDrag && state.dragToInfo.item.allowColumnDrag) {
      // 是否同一个item
      if (item[props.id] !== state.dragToInfo.item[props.id]) {
        // 目标item所在组的位置
        const targetIndex = findPosition(state.dragToInfo.item[props.id]);
        const targetGroup = state.dragData[targetIndex].list;
        const targetGroupSize = targetGroup.length;

        // ---------------当前item的处理start-------------
        // 当前item所在组的位置，一定要先找再删，不然先删就找不到了
        const currentIndex = findPosition(item[props.id]);

        // 当前组中删除元素
        groupList.splice(delIndex, 1);

        if (groupList.length === 0) {
          state.dragData.splice(currentIndex, 1);
        }
        // ---------------当前item的处理end-------------
        // 目标是组
        if (props.groupDrag && targetGroupSize > 1) {
          const targetGroupIndex = targetGroup.findIndex(
            (x: any) => x[props.id] === state.dragToInfo.item[props.id]
          );

          if (state.dragToInfo.direction === "top") {
            targetGroup.splice(targetGroupIndex, 0, item);
          } else {
            targetGroup.splice(targetGroupIndex + 1, 0, item);
          }
        } else {
          const obj = {} as { [key: string]: any };
          obj.draggable = false;
          obj.list = [item];
          obj[props.groupKey] = `${new Date().getTime()}group${item[props.id]}`;

          if (currentIndex < targetIndex) {
            if (state.dragToInfo.direction === "top") {
              state.dragData.splice(targetIndex - 1, 0, obj);
            } else {
              state.dragData.splice(targetIndex, 0, obj);
            }
          } else {
            if (state.dragToInfo.direction === "top") {
              state.dragData.splice(targetIndex, 0, obj);
            } else {
              state.dragData.splice(targetIndex + 1, 0, obj);
            }
          }
        }

        emit("onDragEnd", {
          oldItem: item,
          newItem: state.dragToInfo.item,
          newData: getNewData(),
        });
      }
    }

    //做完逻辑之后清空
    state.dragToInfo.item = {};
    state.dragToInfo.event = {} as DragEvent;
    state.currentY = 0;
    state.isHandleDragStart = false;
  }
}

// 离开组
function levelGroup(item: any, delIndex: number, groupList: []) {
  if (state.isHandleGroupDrag) {
    return;
  }

  // 当前item所在组的位置，一定要先找再删，不然先删就找不到了
  const currentIndex = findPosition(item[props.id]);

  // 当前组中删除元素
  groupList.splice(delIndex, 1);

  //重新加入
  const obj = {} as { [key: string]: any };
  obj.draggable = false;
  obj.list = [item];
  obj[props.groupKey] = `${new Date().getTime()}group${item[props.id]}`;

  state.dragData.splice(currentIndex + 1, 0, obj);

  emit("onDragEnd", {
    oldItem: item,
    newItem: item,
    newData: getNewData(),
  });
}

function handleMouseDown(event: MouseEvent, groupItem: any, groupIndex: number) {
  const target = event.target as HTMLElement;
  const dom = document.querySelector(`#levelGroupSonDrag${groupIndex}`) as HTMLElement;

  if (props.groupDrag && dom?.contains(target)) {
    groupItem.draggable = true;
    state.isHandleGroupDrag = true;
  }
}

function handleGroupDragStart(event: DragEvent) {
  if (!state.isHandleGroupDrag) {
    return;
  }

  state.currentY = event.y;
}

function handleGroupDragEnter(groupIndex: number, event: DragEvent) {
  if (!state.isHandleGroupDrag) {
    return;
  }

  event.preventDefault();
  if (state.dragToInfo.index > -1 && state.dragToInfo.index !== groupIndex) {
    // 移除样式
    bottomClass(
      { allowColumnDrag: true },
      `#levelGroupDrag${state.dragToInfo.index}`,
      "remove"
    );
  }

  state.dragToInfo.index = groupIndex;
  state.currentY = event.y;
}

function handleGroupDragOver(groupIndex: number, event: DragEvent) {
  if (!state.isHandleGroupDrag) {
    return;
  }

  event.preventDefault();

  if (state.dragToInfo.index > -1) {
    if (event.y > state.currentY) {
      state.dragToInfo.direction = "bottom";
      bottomClass(
        { allowColumnDrag: true },
        `#levelGroupDrag${groupIndex}`,
        "add",
        "bottom"
      );
    } else {
      state.dragToInfo.direction = "top";
      bottomClass(
        { allowColumnDrag: true },
        `#levelGroupDrag${groupIndex}`,
        "add",
        "top"
      );
    }
  }
}

// 拖拽组结束
function handleGroupDragEnd(groupItem: any, groupIndex: number) {
  if (!state.isHandleGroupDrag) {
    return;
  }

  if (state.dragToInfo.index > -1) {
    // 移除样式
    removeClass({ allowColumnDrag: true }, `#levelGroupDrag${state.dragToInfo.index}`);

    // 是否同一个item
    if (state.dragToInfo.index !== groupIndex) {
      // 当前组中删除元素
      state.dragData.splice(groupIndex, 1);

      if (groupIndex < state.dragToInfo.index) {
        if (state.dragToInfo.direction === "top") {
          state.dragData.splice(state.dragToInfo.index - 1, 0, groupItem);
        } else {
          state.dragData.splice(state.dragToInfo.index, 0, groupItem);
        }
      } else {
        if (state.dragToInfo.direction === "top") {
          state.dragData.splice(state.dragToInfo.index, 0, groupItem);
        } else {
          state.dragData.splice(state.dragToInfo.index + 1, 0, groupItem);
        }
      }

      emit("onDragEnd", {
        oldItem: groupItem.list,
        newItem: state.dragData[state.dragToInfo.index].list,
        newData: getNewData(),
      });
    }

    //做完逻辑之后清空
    state.dragToInfo.index = -1;
    state.currentY = 0;
  }

  state.isHandleGroupDrag = false;
  groupItem.draggable = false;
}

// 根据最新的数据源得到格式化之后的数据
function getNewData() {
  const result: any = []
  state.dragData.forEach((x: any) => {
    const list = x.list
    list.forEach((xx: any) => {
      if (list.length > 1) {
        xx[props.groupKey] = x[props.groupKey]
      }else{
        delete xx[props.groupKey]
      }
      result.push(xx)
    })
  })
  return result
}

// 移除样式
function removeClass(item: any, domId: string) {
  bottomClass(item, domId, "remove");
  lineClass("remove");
}

// 找出item所在数组在最外层数组中的位置
function findPosition(target: string, data = state.dragData, key = props.id) {
  for (let i = 0; i < data.length; i++) {
    const innerArray = data[i].list;
    const index = innerArray.findIndex((x: any) => x[key] === target);
    if (index !== -1) {
      return i;
    }
  }
  return -1;
}

//type: add:添加；remove：移除
type lineClassType = "add" | "remove";
function lineClass(
  type: lineClassType,
  item: any = {},
  event: DragEvent = {} as DragEvent
) {
  const centerLine = document.querySelector(".level-drag-plan-item-line") as HTMLElement;

  if (type === "add") {
    if (!item.allowRowDrag) {
      return;
    }

    const listDom = document.querySelector(".level-drag-main") as HTMLElement;
    const { x } = listDom.getBoundingClientRect();

    // 设置中心虚线的位置
    centerLine.style.left = `${event.x - x}px`;

    // 添加类名来显示中心虚线
    centerLine.classList.add("level-drag-line-show");
  } else {
    centerLine.classList.remove("level-drag-line-show");
  }
}

//type: add:添加；remove：移除
type bottomClassType = "add" | "remove";
type bottomClassDirectionType = "bottom" | "top";
function bottomClass(
  item: any = {},
  domId: string = "",
  type: bottomClassType = "add",
  direction: bottomClassDirectionType = "bottom"
) {
  // 获取拖拽元素的位置和尺寸信息
  const dom = document.querySelector(domId) as HTMLElement;

  if (type === "add") {
    if (!item.allowColumnDrag) {
      return;
    }

    if (direction === "bottom") {
      dom.classList.add("planItemBottom");
      dom.classList.remove("planItemTop");
    } else {
      dom.classList.add("planItemTop");
      dom.classList.remove("planItemBottom");
    }
  } else {
    dom.classList.remove("planItemBottom");
    dom.classList.remove("planItemTop");
  }
}
</script>
