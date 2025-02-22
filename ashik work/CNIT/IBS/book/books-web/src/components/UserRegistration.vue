<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <h2 class="text-2xl font-bold mb-6">Register New User</h2>
    <form @submit.prevent="handleRegister" class="space-y-4">
      <div>
        <label for="newUsername" class="block text-sm font-medium text-gray-700">Username</label>
        <input
          id="newUsername"
          v-model="newUsername"
          type="text"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      
      <div>
        <label for="newPassword" class="block text-sm font-medium text-gray-700">Password</label>
        <input
          id="newPassword"
          v-model="newPassword"
          type="password"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
        <select
          id="role"
          v-model="role"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
      <div v-if="success" class="text-green-600 text-sm">{{ success }}</div>

      <button
        type="submit"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Register User
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { authService } from '../services/api';

export default defineComponent({
  name: 'UserRegistration',
  setup() {
    const newUsername = ref('');
    const newPassword = ref('');
    const role = ref<'admin' | 'user'>('user');
    const error = ref('');
    const success = ref('');

    const handleRegister = async () => {
      try {
        error.value = '';
        success.value = '';
        
        await authService.registerUser(newUsername.value, newPassword.value, role.value);
        success.value = 'User registered successfully';
        newUsername.value = '';
        newPassword.value = '';
        role.value = 'user';
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Registration failed';
      }
    };

    return {
      newUsername,
      newPassword,
      role,
      error,
      success,
      handleRegister,
    };
  },
});
</script>
