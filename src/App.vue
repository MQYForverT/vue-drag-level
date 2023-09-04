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
