<template>
  <div class="min-h-screen bg-gray-100 flex">
    <!-- Side Navigation -->
    <div v-if="isAuthenticated" class="w-64 bg-white shadow-lg fixed h-full overflow-y-auto">
      <div class="flex items-center justify-center h-16 border-b">
        <span class="text-xl font-bold text-gray-900">LedgerBook</span>
      </div>
      
      <nav class="mt-5 px-2">
        <div class="space-y-1">
          <!-- Dashboard -->
          <router-link to="/dashboard" class="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
            <i class="fas fa-home mr-3"></i>
            Dashboard
          </router-link>

          <!-- POS -->
          <router-link to="/pos" class="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
            <i class="fas fa-cash-register mr-3"></i>
            POS
          </router-link>

          <!-- Settings -->
          <router-link to="/settings" class="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
            <i class="fas fa-cog mr-3"></i>
            Settings
          </router-link>

          <!-- Logout -->
          <a @click="handleLogout" class="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 cursor-pointer">
            <i class="fas fa-sign-out-alt mr-3"></i>
            Logout
          </a>
        </div>
      </nav>
    </div>

    <!-- Main Content -->
    <div :class="{ 'ml-64': isAuthenticated, 'w-full': !isAuthenticated }">
      <main class="py-6 px-4 sm:px-6 lg:px-8">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from './services/api';

const router = useRouter();
const isAuthenticated = computed(() => !!authService.getCurrentUser());

const handleLogout = async () => {
  await authService.logout();
  router.push('/login');
};
</script>

<style>
.router-link-active {
  background-color: #f3f4f6;
  color: #111827;
}
</style>
