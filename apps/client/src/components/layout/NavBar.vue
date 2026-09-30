<script lang="ts" setup>
import ConnectionStatus from '../elements/ConnectionStatus.vue';
import NodeLogo from '../elements/NodeLogo.vue';

defineOptions({ name: 'LayoutNavBar' })

</script>

<template>
    <div class="navbar">
      <div class="navbar-content">
        <NodeLogo />
        <ConnectionStatus :connected="true" />
      </div>
    </div>
</template>

<style scoped>
.navbar {
	background: var(--bg1);
	backdrop-filter: blur(10px);
	border-bottom: 1px solid var(--border1);
	padding: 1rem 2rem;
}

.navbar-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 0 auto;
}

</style>