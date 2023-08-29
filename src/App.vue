<template>
  <div>
    <dragLevel
      groupDrag
      :data="departResultStrings"
      :no-row-drag-class="['itemBox','itemDisabled']"
      :no-column-drag-class="['itemDisabled']"
      @onDragEnd="onDragEnd"
    >
      <template #default="{ item }">
        <div
          :class="{
            itemBox: true,
            itemDisabled: item.id < 3
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

<style scoped>
.itemBox {
  padding: 5px 10px;
  border-bottom: 1px solid #ccc;
}
</style>
