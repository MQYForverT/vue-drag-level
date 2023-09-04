import type { ExtractPropTypes } from "vue";

export const dragProps = {
  // 数据
  data: {
    type: Array<any>,
    default: () => [],
  },
  // 唯一id-key
  id: {
    type: String,
    default: "id",
  },
  // 禁止拖拽的class元素
  noDragClass: {
    type: Array<string>,
    default: () => [],
  },
  //允许树形拖拽，拖拽时，虚线左边是同级，虚线右边是子级
  treeDrag: {
    type: Boolean,
    default: false,
  },
  // 树形中，不同层级的间隔
  levelGap: {
    type: String,
    default: "30px",
  },
  //允许第一级拖拽成组
  groupDrag: {
    type: Boolean,
    default: false,
  },
  // 唯一父级key
  groupKey: {
    type: String,
    default: "parentId",
  },
  // 唯一子级List-key
  groupListKey: {
    type: String,
    default: "children",
  },
  // 是否显示不同组之间的分隔标识线
  showGroupTagLine: {
    type: Boolean,
    default: true,
  },
  // 组拖拽按钮浮动出现，默认true，false将一直存在
  groupDragHover: {
    type: Boolean,
    default: true,
  },
  // 组项离开组时是否回到最外层数组还是父层所在数组，默认回到父层所在数组
  levelByTop: {
    type: Boolean,
    default: false,
  },
  // 是否展示删除按钮
  showDelBtn: {
    type: Boolean,
    default: true,
  },
};
// ExtractPropTypes:提取属性类型
export type dragProps = ExtractPropTypes<typeof dragProps>;
