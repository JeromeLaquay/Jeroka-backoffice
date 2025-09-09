<template>
  <div>
    <AppNavbar />
    
    <section class="py-20 bg-white dark:bg-gray-900">
      <div class="container mx-auto px-4 md:px-8">
        <div class="max-w-3xl mx-auto">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Mentions Légales</h1>
          
          <div class="prose prose-blue dark:prose-invert max-w-none">
            <h2 class="text-2xl font-semibold mt-8 mb-4">Éditeur du site</h2>
            <p>
              <strong>Nom de l'entreprise</strong> : Jeroka<br>
              <strong>Statut juridique</strong> : Auto-entrepreneur<br>
              <strong>Adresse</strong> : 13 rue des Fauvettes, 59470 Wormhout<br>
              <strong>Téléphone</strong> : +33 6 19 57 69 47<br>
              <strong>Email</strong> : <a href="mailto:contact@jeroka.fr" class="text-blue-600 dark:text-blue-400 hover:underline">contact@jeroka.fr</a><br>
              <strong>SIRET</strong> : [Numéro SIRET]<br>
            </p>
            
            <h2 class="text-2xl font-semibold mt-8 mb-4">Directeur de la publication</h2>
            <p>Jérôme Jaquay</p>
            
            <h2 class="text-2xl font-semibold mt-8 mb-4">Hébergement</h2>
            <p>
              <strong>Nom de l'hébergeur</strong> : Hostinger<br>
              <strong>Adresse</strong> : HOSTINGER INTERNATIONAL LTD, 61 Lordou Vironos Street, 6023 Larnaca, Chypre<br>
            </p>
            
            <h2 class="text-2xl font-semibold mt-8 mb-4">Propriété intellectuelle</h2>
            <p>L'ensemble du contenu de ce site, incluant les textes, images, vidéos, logos, codes sources et autres éléments, est protégé par les lois sur la propriété intellectuelle et appartient à Jeroka ou est utilisé avec l'autorisation des titulaires des droits.</p>
            <p>Toute reproduction, représentation, modification, publication, transmission ou exploitation totale ou partielle des contenus et services de ce site, sans l'autorisation écrite préalable de Jeroka, est strictement interdite.</p>
            
            <h2 class="text-2xl font-semibold mt-8 mb-4">Protection des données personnelles</h2>
            <p>Conformément à la loi "Informatique et Libertés" du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), vous disposez de droits concernant vos données personnelles.</p>
            <p>Pour en savoir plus, veuillez consulter notre <a href="/politique-confidentialite" class="text-blue-600 dark:text-blue-400 hover:underline">politique de confidentialité</a>.</p>
            
            <h2 class="text-2xl font-semibold mt-8 mb-4">Liens hypertextes</h2>
            <p>Le site peut contenir des liens vers d'autres sites internet. Jeroka n'exerce aucun contrôle sur ces sites et n'assume aucune responsabilité quant à leur contenu.</p>
            
            <h2 class="text-2xl font-semibold mt-8 mb-4">Droit applicable et juridiction compétente</h2>
            <p>Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>
          </div>
        </div>
      </div>
    </section>
    
    <AppFooter />
  </div>
</template>

<script>
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'

export default {
  name: 'LegalView',
  components: {
    AppNavbar,
    AppFooter
  }
}
</script> 