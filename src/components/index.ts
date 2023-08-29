import type { ExtractPropTypes } from "vue";

export const dragProps = {
  // 数据
  data: {
    type: Array<any>,
    default: () => [],
  },
  // 唯一id
  id: {
    type: String,
    default: "id",
  },
  // 不同等级的key区分值
  levelKey: {
    type: String,
    default: "level",
  },
  // 不同等级的间隔
  levelGap: {
    type: String,
    default: "30px",
  },
  // 禁止横向拖拽的class元素
  noRowDragClass: {
    type: Array<string>,
    default: () => [],
  },
  // 禁止竖向拖拽的class元素
  noColumnDragClass: {
    type: Array<string>,
    default: () => [],
  },
  // 开启组拖拽
  groupDrag: {
    type: Boolean,
    default: false,
  },
  // 组拖拽中的组key
  groupKey: {
    type: String,
    default: "groupId",
  },
  // 自定义组item样式
  groupItemStyle: {
    type: String,
    default: "border: 1px solid red;margin-bottom: 10px;",
  },
};
// ExtractPropTypes:提取属性类型
export type dragProps = ExtractPropTypes<typeof dragProps>;
