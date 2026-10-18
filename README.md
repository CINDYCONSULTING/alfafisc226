# ALFA FISC — Générateur de sujets QCM interactifs

Application React (Vite + Tailwind) qui transforme du texte brut de QCM en un
fichier **HTML autonome et interactif** téléchargeable. Le candidat ouvre le
fichier dans son navigateur, répond aux questions, et obtient sa correction
(immédiate ou à la fin) ainsi que son score final.

## Fonctionnement

1. Onglet **Générateur** : saisir un titre, coller le bloc de QCM, choisir le
   mode de correction.
2. **Prévisualiser** dans un onglet ou **Télécharger** le fichier HTML.
3. Partager le fichier `.html` avec les candidats — ils l'ouvrent hors ligne,
   répondent, et peuvent imprimer en PDF.

## Format de saisie

```
QCM 1 : Texte de la question
A. Option A
B. Option B
C. Option C
D. Option D

Réponse : B
Justification : Explication juridique...

QCM 2 : ...
```

Le parseur est insensible à la casse (QCM/qcm, Réponse/Reponse/reponse) et
accepte aussi le format numéroté « 1. question ». Options de A à E supportées.
Le support MathJax est inclus dans le fichier généré ($...$, \(...\)).

## Déploiement sur GitHub Pages

Le workflow `.github/workflows/deploy.yml` build et publie automatiquement sur
GitHub Pages à chaque push sur `main`. Activez simplement GitHub Pages
(Settings → Pages → Source : GitHub Actions).

La base Vite est relative (`base: './'`) ce qui permet au site de fonctionner
aussi bien sur un sous-chemin `user.github.io/repo` que sur un domaine custom.

## Stack

- React 18 + Vite
- Tailwind CSS
- Lucide React (icônes)
- MathJax (rendu mathématique dans le fichier généré)
