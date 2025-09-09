<template>
  <div>
    <AppNavbar />
    <HomePart />
    <AboutPart />
    <ServicesPart />
    <ImagesGallery />
    <PricingPart />
    <PartnersPart />
    <ContactPart />
    <VisitCard />
    <AppFooter />
  </div>
</template>

<script>
import AppNavbar from '@/components/AppNavbar.vue'
import HomePart from '@/components/HomePart.vue'
import AboutPart from '@/components/AboutPart.vue'
import ServicesPart from '@/components/ServicesPart.vue'
import ImagesGallery from '@/components/ImagesGallery.vue'
import PricingPart from '@/components/PricingPart.vue'
import PartnersPart from '@/components/PartnersPart.vue'
import ContactPart from '@/components/ContactPart.vue'
import AppFooter from '@/components/AppFooter.vue'
import VisitCard from '@/components/VisitCard.vue'

export default {
  name: 'HomeView',
  components: {
    AppNavbar,
    HomePart,
    AboutPart,
    ServicesPart,
    ImagesGallery,
    PricingPart,
    PartnersPart,
    ContactPart,
    AppFooter,
    VisitCard
  }
}
</script> 