<script>

import { fade } from 'svelte/transition';

  let showMobileMenu = false;

  function toggleMobileMenu() {
    showMobileMenu = !showMobileMenu;
  }

</script>


<div class="container mx-auto px-4 py-6">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <i class="fas fa-regular fa-spa text-teal-300"></i>
          <h1 class="text-2xl font-heading font-bold">Shiatsu</h1>
        </div>
     <nav class="hidden md:flex space-x-6">
  <a href="./home" class="hover:text-teal-300 transition">Startseite</a>
  <a href="./booking" class="hover:text-teal-300 transition">Buchungen</a>
  <a href="./about" class="hover:text-teal-300 transition">Impressum</a>
</nav>

<button class="md:hidden text-2xl" on:click={toggleMobileMenu}>
  <i class="fas fa-bars"></i>
</button>

{#if showMobileMenu}
  <div
    class="md:hidden absolute top-16 left-0 w-full bg-gray-800 text-white flex flex-col items-center space-y-4 py-4"
    transition:fade={{ duration: 150 }}
  >
    <a href="./home" class="hover:text-teal-300 transition" on:click={toggleMobileMenu}>Startseite</a>
    <a href="./booking" class="hover:text-teal-300 transition" on:click={toggleMobileMenu}>Buchungen</a>
    <a href="./about" class="hover:text-teal-300 transition" on:click={toggleMobileMenu}>Impressum</a>
  </div>
{/if}
      </div>
    </div>