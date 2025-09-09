<template>
  <div>
    <AppNavbar />
    
    <section class="py-20 bg-white dark:bg-gray-900">
      <div class="container mx-auto px-4 md:px-8">
        <div class="max-w-3xl mx-auto">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Politique de Confidentialité</h1>
          
          <div class="prose prose-blue dark:prose-invert max-w-none">
            <p class="mb-4">Dernière mise à jour : {{ updateDate }}</p>
            
            <h2 class="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
            <p>Chez Jeroka, nous accordons une grande importance à la protection de vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos informations lorsque vous utilisez notre site web et nos services.</p>
            
            <h2 class="text-2xl font-semibold mt-8 mb-4">2. Données collectées</h2>
            <p>Nous collectons les informations suivantes lorsque vous utilisez notre site web ou nos services :</p>
            <ul class="list-disc ml-6 mt-2 mb-4">
              <li><strong>Données d'identification</strong> : nom, prénom, adresse email, numéro de téléphone.</li>
              <li><strong>Données de communication</strong> : messages que vous nous envoyez via le formulaire de contact.</li>
              <li><strong>Données techniques</strong> : adresse IP, type de navigateur, pages visitées, temps passé sur le site.</li>
            </ul>
            
            <h2 class="text-2xl font-semibold mt-8 mb-4">3. Utilisation des données</h2>
            <p>Nous utilisons vos données personnelles pour :</p>
            <ul class="list-disc ml-6 mt-2 mb-4">
              <li>Répondre à vos demandes et vous fournir nos services.</li>
              <li>Améliorer votre expérience sur notre site web.</li>
              <li>Vous envoyer des informations sur nos services (uniquement avec votre consentement).</li>
              <li>Respecter nos obligations légales.</li>
            </ul>
            
            <h2 class="text-2xl font-semibold mt-8 mb-4">4. Partage des données</h2>
            <p>Nous ne vendons jamais vos données personnelles à des tiers. Nous pouvons partager vos données avec :</p>
            <ul class="list-disc ml-6 mt-2 mb-4">
              <li>Nos prestataires de services qui nous aident à fournir nos services.</li>
              <li>Les autorités publiques lorsque la loi l'exige.</li>
            </ul>
            
            <h2 class="text-2xl font-semibold mt-8 mb-4">5. Sécurité des données</h2>
            <p>Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données contre tout accès non autorisé, toute divulgation, altération ou destruction.</p>
            
            <h2 class="text-2xl font-semibold mt-8 mb-4">6. Vos droits</h2>
            <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
            <ul class="list-disc ml-6 mt-2 mb-4">
              <li>Droit d'accès à vos données personnelles.</li>
              <li>Droit de rectification des données inexactes.</li>
              <li>Droit à l'effacement de vos données ("droit à l'oubli").</li>
              <li>Droit à la limitation du traitement.</li>
              <li>Droit à la portabilité de vos données.</li>
              <li>Droit d'opposition au traitement de vos données.</li>
            </ul>
            <p>Pour exercer ces droits, veuillez nous contacter à l'adresse email suivante : <a href="mailto:contact@jeroka.fr" class="text-blue-600 dark:text-blue-400 hover:underline">contact@jeroka.fr</a>.</p>
            
            <h2 class="text-2xl font-semibold mt-8 mb-4">7. Cookies</h2>
            <p>Notre site web utilise des cookies pour améliorer votre expérience. Pour plus d'informations, veuillez consulter notre <a href="/politique-cookies" class="text-blue-600 dark:text-blue-400 hover:underline">politique de cookies</a>.</p>
            
            <h2 class="text-2xl font-semibold mt-8 mb-4">8. Modifications de la politique de confidentialité</h2>
            <p>Nous pouvons modifier cette politique de confidentialité à tout moment. La date de la dernière mise à jour sera toujours indiquée en haut de cette page. Nous vous encourageons à consulter régulièrement cette politique pour rester informé de la façon dont nous protégeons vos informations.</p>
            
            <h2 class="text-2xl font-semibold mt-8 mb-4">9. Contact</h2>
            <p>Si vous avez des questions concernant cette politique de confidentialité, veuillez nous contacter à :</p>
            <p class="mt-2">
              <strong>Email</strong> : <a href="mailto:contact@jeroka.fr" class="text-blue-600 dark:text-blue-400 hover:underline">contact@jeroka.fr</a><br>
              <strong>Adresse</strong> : 13 rue des Fauvettes, 59470 Wormhout<br>
              <strong>Téléphone</strong> : +33 6 19 57 69 47
            </p>
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
  name: 'PrivacyView',
  components: {
    AppNavbar,
    AppFooter
  },
  data() {
    return {
      updateDate: '1 avril 2023'
    }
  }
}
</script> 