<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Settings</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- General Settings Section -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-2xl font-bold mb-6">General Settings</h2>
        <!-- Add your general settings here -->
      </div>

      <!-- User Registration Section (Admin Only) -->
      <div v-if="isAdmin">
        <UserRegistration />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import UserRegistration from '../components/UserRegistration.vue';
import { authService } from '../services/api';

export default defineComponent({
  name: 'Settings',
  components: {
    UserRegistration,
  },
  setup() {
    const isAdmin = computed(() => authService.isAdmin());

    return {
      isAdmin,
    };
  },
});
</script>
