<script setup lang="ts">
import ApiCatalog from './components/ApiCatalog.vue'
import ApodHero from './components/ApodHero.vue'
import AsteroidSection from './components/AsteroidSection.vue'
import EonetSection from './components/EonetSection.vue'
import ImageSearch from './components/ImageSearch.vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
import SpaceWeatherSection from './components/SpaceWeatherSection.vue'
</script>

<template>
  <SiteHeader />
  <main id="conteudo">
    <ApodHero />
    <ImageSearch />
    <AsteroidSection />
    <SpaceWeatherSection />
    <EonetSection />
    <ApiCatalog />
  </main>
  <SiteFooter />
</template>
