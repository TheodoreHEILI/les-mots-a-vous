# Les mots à vous

**Transformez vos souvenirs en mots croisés personnalisés.** Choisissez une occasion, ajoutez vos mots et indices, puis imprimez une grille unique à offrir ou à partager.

🌐 **Site public :** [les-mots-a-vous.tiop.chatgpt.site](https://les-mots-a-vous.tiop.chatgpt.site/)

<p align="center">
  <a href="https://les-mots-a-vous.tiop.chatgpt.site/"><img src="docs/screenshots/home.png" alt="Page d’accueil de Les mots à vous" width="760"></a>
</p>

<p align="center">
  <img src="docs/screenshots/workshop.png" alt="Aperçu de la grille et des options d’export" width="760">
</p>

## Fonctionnalités

- Landing page soignée et parcours de création en quatre étapes.
- Mots croisés et mots fléchés, avec de 5 à 18 mots personnalisés.
- Aperçu animé : l’indice apparaît avant les lettres du mot au fil de la saisie.
- Mot mystère, couleurs, titre, signature et corrigé optionnel.
- Exports PDF A4, SVG et impression depuis le navigateur.
- Brouillon conservé localement : aucun souvenir n’est envoyé à un serveur.
- Version anglaise complète : ajoutez [`?lang=en`](https://les-mots-a-vous.tiop.chatgpt.site/?lang=en) ou utilisez le bouton **EN** du site.

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvrez ensuite [http://127.0.0.1:4173](http://127.0.0.1:4173). Le site est statique : les fichiers publiés sont dans [`dist/`](dist/).

## Vérifications

```bash
npm test
npm run check
```

Les tests couvrent les croisements, les entrées invalides et dupliquées, le mot mystère, les deux formats de grilles ainsi que les exports PDF.

## Structure

| Emplacement | Rôle |
| --- | --- |
| [`dist/app.js`](dist/app.js) | Interface, bilinguisme, brouillon local et exports |
| [`dist/generator.js`](dist/generator.js) | Placement déterministe des mots et génération des grilles |
| [`dist/pdf.js`](dist/pdf.js) | Création des PDF A4 et corrigés |
| [`dist/atelier.css`](dist/atelier.css) | Atelier de création et animation des lettres |
| [`tests/`](tests/) | Tests du générateur et des exports |

## Vie privée

Les mots et indices restent dans le navigateur de la personne qui crée la grille. Ils ne sont pas transmis à un serveur. La configuration d’hébergement locale est volontairement exclue du dépôt.
