<script lang="ts" setup>
import logo from '../../assets/nodepuls.svg'
</script>
      
<template>
  <div class="logo-container">
    <img class="logo" :src="logo" alt="Node.js logo" />
  </div>
</template>

<style scoped>

.logo-container {
	display: flex;
	align-items: center;
}

.logo {
	height: 40px;
	width: auto;
	filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	transition: transform 0.2s ease-in-out;
}

.logo:hover {
	transform: scale(1.05);
}

</style>