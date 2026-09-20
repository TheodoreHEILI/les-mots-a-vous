# Les mots à vous

Générateur français de mots croisés et fléchés personnalisés, avec landing page, parcours en quatre étapes, mot mystère, brouillon local, thèmes, export PDF vectoriel (A4 et corrigé optionnel), SVG et impression.

## Utilisation locale

`npm install` puis `npm run dev`, ouvrir http://127.0.0.1:4173.

`npm test` vérifie les intersections, les cases réservées aux indices, les doublons, accents, mots disjoints, mots mystères et exports PDF. `npm run check` vérifie la syntaxe.

## Architecture

Site statique sans compilation. Le contenu servi et publiable se trouve dans `dist/`. Aucun mot personnel n’est envoyé à un serveur. Le brouillon est stocké uniquement dans le navigateur. Le mode exemple n’écrase pas le brouillon existant.

- `generator.js` : essais déterministes à partir d’une graine, intersections vérifiées, conservation des mots non raccordables dans des groupes séparés, réservation des cases fléchées, association unique des lettres du mot mystère.
- `app.js` : landing et atelier, validation, stockage et exports.
- `pdf.js` : export vectoriel avec jsPDF, indices complets et corrigé séparé. Les indices longs sont abrégés dans les petites cases fléchées et reproduits intégralement sous la grille.
- `vendor/` : version locale de jsPDF et sa licence. Après mise à jour de la dépendance, recopier `node_modules/jspdf/dist/jspdf.umd.min.js` dans ce dossier.

La photo d’ambiance a été générée avec Imagegen. Police : DM Sans et Manrope, via Google Fonts, avec polices système de repli.

L’application n’inclut pas de paiement ni d’envoi postal. La publication Sites initiale est privée. Pour les grilles denses, les indices complets passent sur des pages séparées afin de conserver des cases lisibles.
