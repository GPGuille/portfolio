<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";
import Experience from "./components/Experience.vue";
import Home from "./features/home/Home.vue";
import { startScroll, stopScroll } from "./composables/useScroll";

onMounted(startScroll);
onBeforeUnmount(stopScroll);
</script>

<template>
  <Experience />
  <Home />
</template>
