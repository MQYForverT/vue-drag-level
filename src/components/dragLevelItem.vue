<template>
  <template v-if="prop.dragItem[props.groupListKey]?.length > 0">
    <transition-group tag="div" name="list">
      <div
        :key="prop.dragItem[props.id]"
        :id="`levelGroupDrag${prop.dragItem[props.id]}`"
        :class="{
          relative: true,
          groupGap: true,
          groupItemClass:
            props.showGroupTagLine &&
            (prop.dragItem.level > 0
              ? prop.dragItem[props.groupListKey]?.length > 0
              : prop.dragItem[props.groupListKey]?.length > 1),
        }"
        @mouseover.stop="groupHanderDragBtn(prop.dragItem, 'over')"
        @mouseout.stop="groupHanderDragBtn(prop.dragItem, 'out')"
        :draggable="prop.dragItem.handleMouseDown"
        @dragstart.stop="handleGroupDragStart(prop.dragItem, $event)"
        @dragenter.stop="handleGroupDragEnter(prop.dragItem, $event, prop.groupList)"
        @dragover.stop="handleGroupDragOver(prop.dragItem, $event)"
        @dragend.stop="handleGroupDragEnd(prop.dragItem, prop.groupList)"
      >
        <div
          :id="`levelDrag${prop.dragItem[props.id]}`"
          v-if="prop.dragItem.level > 0"
          :class="{
            levelDragItemDisabled: !prop.dragItem.draggable,
          }"
        >
          <slot :item="prop.dragItem"></slot>
        </div>

        <div
          v-for="item of prop.dragItem[props.groupListKey]"
          :style="
            prop.dragItem.level > 0 && prop.dragItem[props.groupListKey]?.length > 0
              ? `margin-left:${props.levelGap}`
              : ''
          "
        >
          <dragLevelItem
            :dragItem="item"
            :groupList="prop.dragItem[props.groupListKey]"
            @onDragEnd="onDragEnd"
            @delItem="delItem"
          >
            <template v-for="(_, key, index) in $slots" :key="index" #[key]="args: any">
              <slot :name="key" v-bind="args"></slot>
            </template>
          </dragLevelItem>
        </div>

        <div
          :id="`groupDragBtn${prop.dragItem[props.id]}`"
          class="allowGroup groupDragBtn move"
          :class="{ displayNone: props.groupDragHover }"
          v-if="
            prop.dragItem.level > 0
              ? prop.dragItem[props.groupListKey]?.length > 0
              : prop.dragItem[props.groupListKey]?.length > 1
          "
          @mousedown="handleMouseDownFunc(prop.dragItem)"
        >
          <slot name="groupDrag">
            <div title="点我拖拽组" class="move">+</div>
          </slot>
        </div>

        <template v-if="props.showDelBtn">
          <div
            v-show="prop.dragItem.handleMouseDown"
            @drop="
              handleDelFunc(
                prop.dragItem,
                prop.groupList,
                !state.isHandleGroupDrag,
                'group'
              )
            "
          >
            <slot name="delete">
              <div class="allowGroup delete" title="删除它">del</div>
            </slot>
          </div>
        </template>
      </div>
    </transition-group>
  </template>
  <template v-else>
    <transition-group tag="div" name="list">
      <div
        :id="`levelDrag${prop.dragItem[props.id]}`"
        :key="prop.dragItem[props.id]"
        class="levelDragItem move"
        :class="{
          levelDragItemDisabled: !prop.dragItem.draggable,
          groupGap: true,
        }"
        :draggable="prop.dragItem.draggable"
        @dragstart="handleDragStart(prop.dragItem, $event)"
        @dragenter="handleDragEnter(prop.dragItem, $event, prop.groupList)"
        @dragover="handleDragOver(prop.dragItem, $event)"
        @dragend="handleDragEnd(prop.dragItem, prop.groupList)"
      >
        <template v-if="prop.groupList.length > 1 || prop.dragItem.level > 1">
          <div
            v-show="!state.isHandleDragStart"
            @click="levelGroupFunc(prop.dragItem, prop.groupList)"
          >
            <slot name="levelGroup">
              <div class="allowGroup levelGroup" title="脱离组">-></div>
            </slot>
          </div>
        </template>

        <template v-if="props.showDelBtn">
          <div
            v-show="
              state.isHandleDragStart &&
              state.dragFromInfo.item[props.id] === prop.dragItem[props.id]
            "
            @drop="handleDelFunc(prop.dragItem, prop.groupList, !state.isHandleDragStart)"
          >
            <slot name="delete">
              <div class="allowGroup delete" title="删除它">del</div>
            </slot>
          </div>
        </template>

        <template
          v-if="
            props.groupDrag &&
            prop.dragItem.draggable &&
            prop.groupList.length === 1 &&
            prop.dragItem.level === 1 &&
            state.dragFromInfo.item[props.id] !== prop.dragItem[props.id]
          "
        >
          <div
            v-show="state.isHandleDragStart"
            @drop="handleDropFunc(prop.dragItem, prop.groupList)"
          >
            <slot name="joinGroup">
              <div class="allowGroup joinGroup" title="与之成组">-></div>
            </slot>
          </div>
        </template>

        <slot :item="prop.dragItem"></slot>
      </div>
    </transition-group>
  </template>
</template>

<script setup lang="ts">
import { inject } from "vue";

defineOptions({
  name: "dragLevelItem",
});

const props: any = inject("props");
const dragData: any[] = inject("dragData") as Array<any>;
const state: any = inject("state");

const prop = defineProps({
  // 当前项
  dragItem: {
    type: Object,
    default: () => { },
  },
  // 当前项所在的数组
  groupList: {
    type: Array<any>,
    default: () => [],
  },
});

const emit = defineEmits<{
  onDragEnd: [data: any];
  delItem: [item: any, func: Function];
}>();

function onDragEnd(res: any) {
  emit("onDragEnd", res);
}

function delItem(res: any, fn: Function) {
  emit("delItem", res, (flag: Boolean) => {
    fn(flag);
  });
}

function handleDragStart(item: any, event: DragEvent) {
  if (state.isHandleGroupDrag) {
    return;
  }
  state.isHandleDragStart = true;
  state.dragFromInfo.item = item;
  state.currentY = event.y;
}

// 记录进入的元素
function handleDragEnter(item: any, event: DragEvent, groupList: any[]) {
  if (state.isHandleGroupDrag) {
    return;
  }

  event.preventDefault();

  if (props.treeDrag) {
    // 创建虚线
    lineClass("add", item, event);
  }

  if (
    state.dragToInfo.item[props.id] &&
    state.dragToInfo.item[props.id] !== item[props.id]
  ) {
    // 移除样式
    bottomClass(
      state.dragToInfo.item,
      `#levelDrag${state.dragToInfo.item.id}`,
      "remove"
    );
  }

  state.dragToInfo.item = item;
  state.dragToInfo.groupList = groupList;
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
function handleDropFunc(item: any, groupList: { [key: string]: any }[]) {
  if (state.isHandleGroupDrag) {
    return;
  }

  const fromItem = JSON.parse(JSON.stringify(state.dragFromInfo.item));

  state.isHandleDrop = true;

  // 移除样式
  removeClass(item, `#levelDrag${item.id}`);

  // 当前item所在组的位置，一定要先找再删，不然先删就找不到了
  const currentIndex = dragData.findIndex(
    (x: any) => x.topId === fromItem.topId
  );
  const currenGroup = dragData[currentIndex][props.groupListKey];
  const currentGroupIndex = currenGroup.findIndex(
    (x: any) => x[props.id] === fromItem[props.id]
  );
  //当前删除
  currenGroup.splice(currentGroupIndex, 1);

  if (currenGroup.length === 0) {
    dragData.splice(currentIndex, 1);
  }

  // 目标所在位置
  const targetGroupIndex = groupList.findIndex(
    (x: any) => x[props.id] === item[props.id]
  );

  fromItem.topId = item.topId;
  fromItem.level = item.level;
  fromItem[props.groupKey] = item[props.groupKey];

  // 成组
  if (state.dragToInfo.direction === "top") {
    groupList.splice(targetGroupIndex, 0, fromItem);
  } else {
    groupList.splice(targetGroupIndex + 1, 0, fromItem);
  }

  emit("onDragEnd", {
    oldItem: state.dragFromInfo.item,
    newItem: item,
    newData: getNewData(),
  });

  state.isHandleDragStart = false;
}

// 删除元素;type:删除项还是组项
function handleDelFunc(item: any, groupList: { [key: string]: any }[], flag: boolean, type: string = 'item') {
  if (flag) {
    return;
  }

  const dragItem = JSON.parse(JSON.stringify(state.dragFromInfo.item));

  if (type === 'item') {
    state.isHandleDrop = true;
  }

  // 移除样式
  if (type === 'item') {
    removeClass(item, `#levelDrag${item.id}`);
  } else {
    removeClass(item, `#levelGroupDrag${item.id}`);
  }

  // 是否注册了onDelItem方法
  if (state.signUpOnDelItem) {
    emit("delItem", item, (flag: Boolean = false) => {
      if (flag) {
        defaultDo();
      }
    });
  } else {
    defaultDo();
  }

  function defaultDo() {
    // 在当前组的位置
    const currentGroupIndex = groupList.findIndex(
      (x: any) => x[props.id] === dragItem[props.id]
    );
    // 当前组中删除元素
    groupList.splice(currentGroupIndex, 1);

    // 如果是第一层
    if (dragItem.level <= 1 && groupList.length === 0) {
      const currentIndex = dragData.findIndex(
        (x: any) => x.topId === dragItem.topId
      );
      dragData.splice(currentIndex, 1);
    }

    emit("onDragEnd", {
      oldItem: item,
      newItem: dragItem,
      newData: getNewData(),
    });
  }

  if (type === 'item') {
    state.isHandleDragStart = false;
  } else {
    item.handleMouseDown = false;
    state.isHandleGroupDrag = false;
  }

  state.dragToInfo.item = {}
}

// 拖拽结束
function handleDragEnd(item: any, groupList: any[]) {
  if (state.isHandleGroupDrag) {
    return;
  }

  if (state.isHandleDrop) {
    state.isHandleDrop = false;
    return;
  }

  const dragItem = JSON.parse(JSON.stringify(item));

  if (state.dragToInfo.item[props.id]) {
    // 移除样式
    removeClass(state.dragToInfo.item, `#levelDrag${state.dragToInfo.item.id}`);

    if (dragItem.draggable && state.dragToInfo.item.draggable) {
      // 是否同一个item
      if (dragItem[props.id] !== state.dragToInfo.item[props.id]) {
        const currentIndex = dragData.findIndex(
          (x: any) => x.topId === dragItem.topId
        );
        const targetIndex = dragData.findIndex(
          (x: any) => x.topId === state.dragToInfo.item.topId
        );
        // ---------------目标item的处理start-------------
        // 目标所处的list
        const targetGroup = state.dragToInfo.groupList;

        // 目标在所处list的位置
        const targetGroupIndex = targetGroup.findIndex(
          (x: any) => x[props.id] === state.dragToInfo.item[props.id]
        );
        // ---------------目标item的处理end-------------

        // ---------------当前item的处理start-------------
        // 在当前组的位置
        const currentGroupIndex = groupList.findIndex(
          (x: any) => x[props.id] === dragItem[props.id]
        );

        // 当前组中删除元素
        groupList.splice(currentGroupIndex, 1);

        // 如果是第一层
        if (dragItem.level <= 1 && groupList.length === 0) {
          const currentIndex = dragData.findIndex(
            (x: any) => x.topId === dragItem.topId
          );
          dragData.splice(currentIndex, 1);
        }
        // ---------------当前item的处理end-------------
        if (props.treeDrag) {
          //得到线的位置
          const centerLine = document.querySelector(
            ".level-drag-plan-item-line"
          ) as HTMLElement;
          const { x } = centerLine.getBoundingClientRect();

          // 判断目标数据是第一级还是第二级
          if (state.dragToInfo.event.x <= x) {
            setSameData();
          } else {
            setSonData();
          }
        } else {
          setSameData();
        }

        // 设置同级数据
        function setSameData() {
          // 两者是同组或者两者都是level1
          if (state.dragToInfo.item.level === 1) {
            const groupKey = `${new Date().getTime()}group${dragItem[props.id]
              }`;

            dragItem.topId = groupKey;
            dragItem.level = 1;
            dragItem[props.groupKey] = groupKey;

            const obj = {} as { [key: string]: any };
            obj.topId = groupKey;
            obj.level = 0;
            obj.draggable = true;
            obj[props.id] = groupKey;
            obj[props.groupKey] = groupKey;
            obj[props.groupListKey] = [dragItem];

            if (item.level === 1) {
              if (state.dragToInfo.groupList.length > 1) {
                dragItem.topId = state.dragToInfo.item.topId;
                dragItem.level = state.dragToInfo.item.level;
                dragItem[props.groupKey] =
                  state.dragToInfo.item[props.groupKey];

                if (state.dragToInfo.direction === "top") {
                  targetGroup.splice(targetGroupIndex, 0, dragItem);
                } else {
                  targetGroup.splice(targetGroupIndex + 1, 0, dragItem);
                }
              } else {
                if (currentIndex < targetIndex) {
                  if (state.dragToInfo.direction === "top") {
                    dragData.splice(targetIndex - 1, 0, obj);
                  } else {
                    dragData.splice(targetIndex, 0, obj);
                  }
                } else {
                  if (state.dragToInfo.direction === "top") {
                    dragData.splice(targetIndex, 0, obj);
                  } else {
                    dragData.splice(targetIndex + 1, 0, obj);
                  }
                }
              }
            } else {
              if (state.dragToInfo.direction === "top") {
                dragData.splice(targetIndex, 0, obj);
              } else {
                dragData.splice(targetIndex + 1, 0, obj);
              }
            }
          } else if (
            state.dragToInfo.item[props.groupKey] === dragItem[props.groupKey]
          ) {
            if (currentGroupIndex < targetGroupIndex) {
              if (state.dragToInfo.direction === "top") {
                targetGroup.splice(targetGroupIndex - 1, 0, dragItem);
              } else {
                targetGroup.splice(targetGroupIndex, 0, dragItem);
              }
            } else {
              if (state.dragToInfo.direction === "top") {
                targetGroup.splice(targetGroupIndex, 0, dragItem);
              } else {
                targetGroup.splice(targetGroupIndex + 1, 0, dragItem);
              }
            }
          } else {
            dragItem.topId = state.dragToInfo.item.topId;
            dragItem.level = state.dragToInfo.item.level;
            dragItem[props.groupKey] = state.dragToInfo.item[props.groupKey];

            if (state.dragToInfo.direction === "top") {
              targetGroup.splice(targetGroupIndex, 0, dragItem);
            } else {
              targetGroup.splice(targetGroupIndex + 1, 0, dragItem);
            }
          }
        }

        // 设置子级数据
        function setSonData() {
          // 目标的子级list
          if (!state.dragToInfo.item[props.groupListKey]) {
            state.dragToInfo.item[props.groupListKey] = [];
          }
          const targetGroupChildren = state.dragToInfo.item[props.groupListKey];

          dragItem.level = state.dragToInfo.item.level + 1;
          dragItem.topId = state.dragToInfo.item.topId;
          dragItem[props.groupKey] = state.dragToInfo.item[props.id];

          targetGroupChildren.push(dragItem);
        }

        emit("onDragEnd", {
          oldItem: dragItem,
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
function levelGroupFunc(item: any, groupList: any[]) {
  if (state.isHandleGroupDrag) {
    return;
  }

  const dragItem = JSON.parse(JSON.stringify(item));

  // 在当前组的位置
  const currentGroupIndex = groupList.findIndex(
    (x: any) => x[props.id] === dragItem[props.id]
  );
  // 当前组中删除元素
  groupList.splice(currentGroupIndex, 1);
  //重新加入
  if (props.levelByTop || dragItem.level === 1) {
    const targetGroupIndex = dragData.findIndex(
      (x: any) => x.topId === dragItem.topId
    );
    const groupKey = `${new Date().getTime()}group${dragItem[props.id]}`;

    dragItem.topId = groupKey;
    dragItem.level = 1;
    dragItem[props.groupKey] = groupKey;

    const obj = {} as { [key: string]: any };
    obj.topId = groupKey;
    obj.level = 0;
    obj.draggable = true;
    obj[props.id] = groupKey;
    obj[props.groupKey] = groupKey;
    obj[props.groupListKey] = [dragItem];

    dragData.splice(targetGroupIndex + 1, 0, obj);
  } else {
    const prentItem = getItemById(dragItem[props.groupKey]);
    const targetItem = getItemById(prentItem[props.groupKey]);

    const targetGroupIndex = targetItem[props.groupListKey].findIndex(
      (x: any) => x[props.id] === prentItem[props.id]
    );

    dragItem.topId = prentItem.topId;
    dragItem.level = prentItem.level;
    dragItem[props.groupKey] = prentItem[props.groupKey];

    targetItem[props.groupListKey].splice(targetGroupIndex + 1, 0, dragItem);
  }

  emit("onDragEnd", {
    oldItem: item,
    newItem: dragItem,
    newData: getNewData(),
  });
}

function getItemById(id: any, data: Array<any> = dragData) {
  for (const item of data) {
    if (item[props.id] === id) {
      return item; // 找到了目标节点，返回它
    }

    if (item[props.groupListKey] && item[props.groupListKey].length > 0) {
      const result: any = getItemById(id, item[props.groupListKey]); // 递归查找子节点
      if (result) {
        return result; // 如果子节点找到了目标节点，返回它
      }
    }
  }
}

function handleMouseDownFunc(item: any) {
  if (!item.draggable) {
    return;
  }
  item.handleMouseDown = true;
  state.isHandleGroupDrag = true;
}

function groupHanderDragBtn(groupItem: any, method: string = "over") {
  if (!props.groupDragHover) {
    return;
  }

  let dom = document.querySelector(
    `#groupDragBtn${groupItem[props.id]}`
  ) as HTMLElement;

  if (dom) {
    if (method === "over") {
      dom.style.display = "flex";
    } else {
      dom.style.display = "none";
    }
  }
}

function handleGroupDragStart(item: any, event: DragEvent) {
  if (!state.isHandleGroupDrag) {
    return;
  }

  state.dragFromInfo.item = item;
  state.currentY = event.y;
}

function handleGroupDragEnter(item: any, event: DragEvent, groupList: any[]) {
  if (!state.isHandleGroupDrag) {
    return;
  }

  event.preventDefault();

  if (props.treeDrag) {
    // 创建虚线
    lineClass("add", item, event);
  }

  if (
    state.dragToInfo.item[props.id] &&
    state.dragToInfo.item[props.id] !== item[props.id]
  ) {
    // 移除样式
    bottomClass(
      { draggable: true },
      `#levelGroupDrag${state.dragToInfo.item[props.id]}`,
      "remove"
    );
  }

  state.dragToInfo.item = item;
  state.dragToInfo.groupList = groupList;
  state.currentY = event.y;
}

function handleGroupDragOver(item: any, event: DragEvent) {
  if (!state.isHandleGroupDrag) {
    return;
  }

  event.preventDefault();

  if (state.dragToInfo.item[props.id]) {
    state.dragToInfo.event = event;

    if (event.y > state.currentY) {
      state.dragToInfo.direction = "bottom";
      bottomClass(
        { draggable: true },
        `#levelGroupDrag${item[props.id]}`,
        "add",
        "bottom"
      );
    } else {
      state.dragToInfo.direction = "top";
      bottomClass(
        { draggable: true },
        `#levelGroupDrag${item[props.id]}`,
        "add",
        "top"
      );
    }
  }
}

// 拖拽组结束
function handleGroupDragEnd(item: any, groupList: any[]) {
  if (!state.isHandleGroupDrag) {
    return;
  }

  if (state.dragToInfo.item[props.id]) {
    // 移除样式
    removeClass(
      { draggable: true },
      `#levelGroupDrag${state.dragToInfo.item[props.id]}`
    );

    const dragItem = JSON.parse(JSON.stringify(item));
    dragItem.handleMouseDown = false;

    if (dragItem.draggable && state.dragToInfo.item.draggable) {
      // 是否同一个item
      if (state.dragToInfo.item[props.id] !== item[props.id]) {
        // 在当前组的位置
        const currentGroupIndex = groupList.findIndex(
          (x: any) => x[props.id] === dragItem[props.id]
        );

        // 当前组中删除元素
        groupList.splice(currentGroupIndex, 1);

        // 如果是第一层
        if (dragItem.level <= 1 && groupList.length === 0) {
          const currentIndex = dragData.findIndex(
            (x: any) => x.topId === dragItem.topId
          );
          dragData.splice(currentIndex, 1);
        }

        // 获取目标的位置
        const targetIndex = state.dragToInfo.groupList.findIndex(
          (x: any) => x[props.id] === state.dragToInfo.item[props.id]
        );

        if (props.treeDrag) {
          //得到线的位置
          const centerLine = document.querySelector(
            ".level-drag-plan-item-line"
          ) as HTMLElement;
          const { x } = centerLine.getBoundingClientRect();

          // 判断目标数据是第一级还是第二级
          if (state.dragToInfo.event.x <= x) {
            setSameGroupData();
          } else {
            setSonGroupData();
          }
        } else {
          setSameGroupData();
        }

        function setSameGroupData() {
          let targetItem: any = {};

          if (state.dragToInfo.item.level === 0) {
            if (dragItem.level !== 0) {
              const groupKey = `${new Date().getTime()}group${dragItem[props.id]
                }`;
              dragItem.topId = groupKey;
              dragItem.level = 0;
              dragItem[props.groupKey] = groupKey;

              const obj = {} as { [key: string]: any };
              obj.topId = groupKey;
              obj.level = 0;
              obj.draggable = true;
              obj[props.id] = groupKey;
              obj[props.groupKey] = groupKey;
              obj[props.groupListKey] = [dragItem];

              getInitData(obj);

              targetItem = obj;
            } else {
              targetItem = dragItem;
            }
          } else {
            // 如果组来源是第一级
            if (dragItem.level === 0) {
              dragItem[props.groupListKey].forEach((x: any) => {
                x.topId = state.dragToInfo.item.topId;
                x.level = state.dragToInfo.item.level;
                x[props.groupKey] = state.dragToInfo.item[props.groupKey];

                if (state.dragToInfo.direction === "top") {
                  state.dragToInfo.groupList.splice(targetIndex, 0, x);
                } else {
                  state.dragToInfo.groupList.splice(targetIndex + 1, 0, x);
                }
              });
              emit("onDragEnd", {
                oldItem: item,
                newItem: state.dragToInfo.item,
                newData: getNewData(),
              });

              //做完逻辑之后清空
              state.dragToInfo.item = {};
              state.currentY = 0;
              state.isHandleGroupDrag = false;
              item.handleMouseDown = false;
              return;
            } else {
              dragItem.topId = state.dragToInfo.item.topId;
              dragItem.level = state.dragToInfo.item.level;
              dragItem[props.groupKey] = state.dragToInfo.item[props.groupKey];

              targetItem = dragItem;
            }

            getInitData(dragItem);
          }

          // 是否是同一组
          if (
            state.dragToInfo.item[props.groupKey] === targetItem[props.groupKey]
          ) {
            if (currentGroupIndex < targetIndex) {
              if (state.dragToInfo.direction === "top") {
                state.dragToInfo.groupList.splice(
                  targetIndex - 1,
                  0,
                  targetItem
                );
              } else {
                state.dragToInfo.groupList.splice(targetIndex, 0, targetItem);
              }
            } else {
              if (state.dragToInfo.direction === "top") {
                state.dragToInfo.groupList.splice(targetIndex, 0, targetItem);
              } else {
                state.dragToInfo.groupList.splice(
                  targetIndex + 1,
                  0,
                  targetItem
                );
              }
            }
          } else {
            if (state.dragToInfo.direction === "top") {
              state.dragToInfo.groupList.splice(targetIndex, 0, targetItem);
            } else {
              state.dragToInfo.groupList.splice(targetIndex + 1, 0, targetItem);
            }
          }
        }

        function setSonGroupData() {
          if (!state.dragToInfo.item[props.groupListKey]) {
            state.dragToInfo.item[props.groupListKey] = [];
          }
          const targetGroupChildren = state.dragToInfo.item[props.groupListKey];

          if (dragItem.level === 0) {
            dragItem[props.groupListKey].forEach((x: any) => {
              x.topId = state.dragToInfo.item.topId;
              x.level = state.dragToInfo.item.level;
              x[props.groupKey] = state.dragToInfo.item[props.groupKey];

              targetGroupChildren.push(x);
            });
          } else {
            dragItem.level = state.dragToInfo.item.level + 1;
            dragItem.topId = state.dragToInfo.item.topId;
            dragItem[props.groupKey] = state.dragToInfo.item[props.id];

            targetGroupChildren.push(dragItem);
          }
        }

        emit("onDragEnd", {
          oldItem: dragItem,
          newItem: state.dragToInfo.item,
          newData: getNewData(),
        });
      }

      //做完逻辑之后清空
      state.dragToInfo.item = {};
      state.dragToInfo.event = {} as DragEvent;
      state.currentY = 0;
    }
  }

  state.isHandleGroupDrag = false;
  item.handleMouseDown = false;
}

// 根据最新的数据源得到格式化之后的数据
function getNewData() {
  const result: any = [];
  dragData.forEach((x: any) => {
    const list = x[props.groupListKey];
    list.forEach((xx: any) => {
      result.push(xx);
    });
  });
  return result;
}

function getInitData(item: any, level: number = 1) {
  if (item[props.groupListKey]) {
    item[props.groupListKey].forEach(async (x2: any, index: number) => {
      if (!x2[props.groupKey]) {
        x2[props.groupKey] = item[props.id];
      }

      if (index > 0) {
        level = item[props.groupListKey][index - 1].level;
      }

      x2.level = level;
      x2.topId = item.topId;

      if (x2[props.groupListKey]?.length > 0) {
        getInitData(x2, ++level);
      }
    });
  }
}

// 移除样式
function removeClass(item: any, domId: string) {
  bottomClass(item, domId, "remove");
  lineClass("remove");
}

//type: add:添加；remove：移除
type lineClassType = "add" | "remove";
function lineClass(
  type: lineClassType,
  item: any = {},
  event: DragEvent = {} as DragEvent
) {
  const centerLine = document.querySelector(
    ".level-drag-plan-item-line"
  ) as HTMLElement;

  if (type === "add") {
    if (!item.draggable) {
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
    if (!item.draggable) {
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
