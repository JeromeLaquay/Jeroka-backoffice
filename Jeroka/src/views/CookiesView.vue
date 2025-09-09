<template>
  <div>
    <AppNavbar />
    
    <section class="py-20 bg-white dark:bg-gray-900">
      <div class="container mx-auto px-4 md:px-8">
        <div class="max-w-3xl mx-auto">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Politique de Cookies</h1>
          
          <div class="prose prose-blue dark:prose-invert max-w-none">
            <p class="mb-4">Dernière mise à jour : {{ updateDate }}</p>
            
            <h2 class="text-2xl font-semibold mt-8 mb-4">1. Qu'est-ce qu'un cookie ?</h2>
            <p>Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) lorsque vous visitez notre site web. Les cookies nous permettent de reconnaître votre navigateur et de stocker certaines informations pour améliorer votre expérience de navigation.</p>
            
            <h2 class="text-2xl font-semibold mt-8 mb-4">2. Types de cookies utilisés</h2>
            <p>Notre site utilise différents types de cookies :</p>
            <ul class="list-disc ml-6 mt-2 mb-4">
              <li><strong>Cookies essentiels</strong> : Ces cookies sont nécessaires au fonctionnement de notre site et ne peuvent pas être désactivés.</li>
              <li><strong>Cookies de performance</strong> : Ces cookies nous aident à comprendre comment les visiteurs interagissent avec notre site en collectant des informations anonymes.</li>
              <li><strong>Cookies fonctionnels</strong> : Ces cookies permettent au site de se souvenir de vos choix et préférences.</li>
              <li><strong>Cookies de ciblage</strong> : Ces cookies sont utilisés pour vous montrer des publicités pertinentes en fonction de vos intérêts.</li>
            </ul>
            
            <h2 class="text-2xl font-semibold mt-8 mb-4">3. Cookies tiers</h2>
            <p>Notre site peut également utiliser des cookies provenant de services tiers, notamment :</p>
            <ul class="list-disc ml-6 mt-2 mb-4">
              <li><strong>Google Analytics</strong> : pour analyser l'utilisation de notre site.</li>
              <li><strong>Réseaux sociaux</strong> : pour permettre le partage de contenu sur les réseaux sociaux.</li>
            </ul>
            
            <h2 class="text-2xl font-semibold mt-8 mb-4">4. Gestion des cookies</h2>
            <p>Vous pouvez gérer vos préférences en matière de cookies à tout moment en modifiant les paramètres de votre navigateur. Veuillez noter que la désactivation de certains cookies peut affecter le fonctionnement de notre site.</p>
            <p>Voici comment gérer les cookies dans les principaux navigateurs :</p>
            <ul class="list-disc ml-6 mt-2 mb-4">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/fr/kb/protection-renforcee-contre-pistage-firefox-ordinateur" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">Microsoft Edge</a></li>
            </ul>
            
            <h2 class="text-2xl font-semibold mt-8 mb-4">5. Durée de conservation des cookies</h2>
            <p>La durée de conservation des cookies varie selon leur type :</p>
            <ul class="list-disc ml-6 mt-2 mb-4">
              <li><strong>Cookies de session</strong> : supprimés lorsque vous fermez votre navigateur.</li>
              <li><strong>Cookies persistants</strong> : conservés sur votre appareil pour une durée déterminée (généralement entre 30 jours et 2 ans).</li>
            </ul>
            
            <h2 class="text-2xl font-semibold mt-8 mb-4">6. Modifications de la politique de cookies</h2>
            <p>Nous pouvons modifier cette politique de cookies à tout moment. La date de la dernière mise à jour sera toujours indiquée en haut de cette page.</p>
            
            <h2 class="text-2xl font-semibold mt-8 mb-4">7. Contact</h2>
            <p>Si vous avez des questions concernant cette politique de cookies, veuillez nous contacter à :</p>
            <p class="mt-2">
              <strong>Email</strong> : <a href="mailto:contact@jeroka.fr" class="text-blue-600 dark:text-blue-400 hover:underline">contact@jeroka.fr</a>
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
  name: 'CookiesView',
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