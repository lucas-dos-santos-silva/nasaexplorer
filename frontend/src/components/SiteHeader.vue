<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)

const links = [
  { href: '#imagens', label: 'Imagens' },
  { href: '#asteroides', label: 'Asteroides' },
  { href: '#clima-espacial', label: 'Clima espacial' },
  { href: '#terra', label: 'Terra' },
  { href: '#catalogo', label: 'APIs' },
]

function closeMenu() {
  open.value = false
}
</script>

<template>
  <header class="site-header">
    <div class="site-header__bar">
      <a class="brand" href="#topo" aria-label="NASA Data Explorer, início">
        <span class="brand__mark">N</span>
        <span class="brand__name">NASA<br>Data Explorer</span>
      </a>
      <p class="site-header__statement">Dados públicos para observar<br class="hidden sm:block"> um universo em movimento.</p>
      <button
        type="button"
        class="menu-button"
        :aria-expanded="open"
        aria-controls="main-navigation"
        @click="open = !open"
      >
        <span>{{ open ? 'Fechar' : 'Menu' }}</span>
        <span class="menu-button__icon" aria-hidden="true">
          <i></i>
          <i></i>
        </span>
      </button>
    </div>
    <nav id="main-navigation" class="site-nav" :class="{ 'site-nav--open': open }" aria-label="Navegação principal">
      <a v-for="(link, index) in links" :key="link.href" :href="link.href" @click="closeMenu">
        <span>0{{ index + 1 }}</span>
        {{ link.label }}
      </a>
    </nav>
  </header>
</template>
