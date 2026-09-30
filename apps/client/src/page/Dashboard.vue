<script setup lang="ts">
import { Section } from '@lucide/vue'
import Block from '../components/layout/Block.vue'
import NavBar from '../components/layout/NavBar.vue'
</script>

<template>
  <NavBar />
  <section class="dashboard">
    <Block title="Dashboard">
      <p>Welcome to the NodePuls Dashboard!</p>
    </Block>
  </section>
</template>

<style scoped>
.dashboard {
  padding: 2rem;
}
</style>
