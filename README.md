# MathsTerminale - Application de Révision Interactive

Une application web complète pour réviser les mathématiques de Terminale (Spécialité Maths et Maths Expertes) avec une approche pédagogique basée sur la répétition espacée et le testing effect, enrichie par des contenus interactifs.

## Fonctionnalités

### Contenu pédagogique (données du dépôt)
- **38 leçons** (25 Spécialité, 13 Expertes) au format Markdown/MDX avec blocs pédagogiques.
- **165 exercices corrigés** + **49 exercices guidés** pas à pas.
- **236 flashcards** avec répétition espacée (algorithme SM-2).
- **76 QCM** pré/post-leçon pour diagnostic et validation.
- **28 annales** du bac avec corrections.

### Apprentissage & progression
- **Répétition espacée** : révisions planifiées à J+1, J+3, J+10, J+30, J+90.
- **Sessions de révision** : modes 10 min (express) et 25 min (pomodoro).
- **Parcours et statistiques** : suivi par leçon/track + stats globales.
- **Gamification** : points, badges, mini-jeux et compagnon virtuel.
- **Sauvegarde locale** : progression persistée dans localStorage.

### Expérience
- Rendu mathématique avec KaTeX.
- Graphes interactifs (fonctions, suites, intégrales, probabilités, etc.).
- Recherche globale dans tout le contenu (Fuse.js).
- Thème clair/sombre automatique et interface responsive.
- Carte conceptuelle pour naviguer dans les notions.

## Démarrage rapide

Prérequis : Node.js (LTS) + npm.

```bash
# Cloner le repository
git clone <repo-url>
cd maths

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

Ouvre ensuite `http://localhost:3000`.

## Scripts utiles

```bash
npm run dev        # mode développement
npm run build      # build production
npm run start      # serveur Next.js en production
npm run lint       # lint ESLint
npm run type-check # vérification TypeScript
```

## Structure du projet

```
maths/
├── content/                    # Contenu pédagogique
│   ├── lessons/                # Leçons (.mdx/.md)
│   │   ├── spe/
│   │   └── expertes/
│   ├── exercises.json          # Exercices corrigés
│   ├── guided-exercises.json   # Exercices guidés
│   ├── flashcards.json         # Flashcards
│   ├── quizzes.json            # QCM
│   ├── annales.json            # Annales du bac
│   └── paths.json              # Parcours (optionnel)
├── docs/                       # PDFs de référence
├── src/
│   ├── app/                    # Routes Next.js (App Router)
│   │   ├── annales/
│   │   ├── carte-conceptuelle/
│   │   ├── exercices/
│   │   ├── exercices-guides/
│   │   ├── flashcards/
│   │   ├── lecons/
│   │   ├── methode/
│   │   ├── parcours/
│   │   ├── qcm/
│   │   ├── revision/
│   │   ├── stats/
│   │   └── api/                # API locales (contenu, recherche)
│   ├── components/             # UI + graphes interactifs + mini-jeux
│   ├── lib/                    # Chargement contenu + utilitaires
│   ├── store/                  # Store principal (Zustand)
│   ├── stores/                 # Stores gamification / mini-jeux
│   └── types/
└── public/                     # Assets statiques
```

## Format des leçons (MDX)

```mdx
---
id: "suites-definition"
title: "Suites numériques"
track: "spe"
level: 2
prerequisites: ["entiers-naturels"]
tags: ["suites", "arithmétique", "géométrique"]
estimatedTime: 45
chapter: "suites"
order: 1
---

# Titre de la leçon

## Intuition et analogie
...

:::definition
**Définition**
Contenu de la définition avec $formules$ LaTeX.
:::

:::theorem[Théorème de X]
Énoncé du théorème...
:::

:::property[Propriété]
...
:::

:::method[Méthode type]
1. Étape 1
2. Étape 2
:::

:::warning
**Attention !** Piège courant...
:::

:::tip
Astuce utile...
:::

:::graph[FunctionPlot]
f: "x^2"
xmin: -5
xmax: 5
:::
```

Blocs disponibles : `definition`, `theorem`, `property`, `method`, `example`, `remark`, `proof`, `exercise`, `warning`, `erreur`, `tip`, `mnemonic`, `graph`.

## Format des exercices (JSON)

```json
{
  "id": "ex-suites-001",
  "lessonId": "suites-definition",
  "title": "Reconnaître une suite arithmétique",
  "difficulty": 2,
  "statement": "Énoncé avec $formules$ LaTeX...",
  "hints": ["Indice 1", "Indice 2"],
  "solutionSteps": [
    { "step": 1, "title": "Étape 1", "content": "..." },
    { "step": 2, "title": "Étape 2", "content": "..." }
  ],
  "method": "Méthode générale...",
  "commonMistakes": ["Erreur 1", "Erreur 2"],
  "tags": ["suites", "arithmétique"],
  "isComprehension": false
}
```

## Format des flashcards (JSON)

```json
{
  "id": "fc-001",
  "lessonId": "suites-definition",
  "front": "Question (avec $LaTeX$)",
  "back": "Réponse (avec $formules$)",
  "category": "formula|definition|method|trap|interpretation",
  "level": 2,
  "tags": ["suites"]
}
```

## Format des QCM (JSON)

```json
{
  "id": "pre-suites-definition",
  "lessonId": "suites-definition",
  "type": "pre|post",
  "title": "Diagnostic : Suites",
  "difficulty": 1,
  "questions": [
    {
      "id": "q1",
      "question": "Question avec $LaTeX$...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explication de la réponse..."
    }
  ]
}
```

## Format des exercices guidés (JSON)

```json
{
  "id": "gx-001",
  "title": "Dériver un polynôme",
  "theme": "Dérivation",
  "difficulty": "facile|moyen|difficile",
  "duration": 20,
  "description": "...",
  "problem": "Énoncé de l'exercice...",
  "steps": [
    {
      "instruction": "Consigne",
      "hint": "Indice",
      "solution": "Solution"
    }
  ],
  "finalAnswer": "Réponse finale"
}
```

## Format des annales (JSON)

```json
{
  "id": "annale-2023-1",
  "year": 2023,
  "session": "Juin",
  "exerciseNumber": 1,
  "title": "...",
  "subject": "physique|chimie",
  "themes": ["..."],
  "points": 5,
  "duration": 60,
  "difficulty": "facile|moyen|difficile",
  "description": "...",
  "parts": [
    {
      "id": "A",
      "title": "Partie A",
      "questions": [
        { "number": "1", "text": "Question...", "points": 1, "answer": "..." }
      ]
    }
  ]
}
```

## Système de Répétition Espacée

L'application utilise un algorithme basé sur SM-2 pour la répétition espacée des flashcards :

- **Niveau 0** : Nouveau → révision dans 1 jour
- **Niveau 1** : → révision dans 3 jours
- **Niveau 2** : → révision dans 10 jours
- **Niveau 3** : → révision dans 30 jours
- **Niveau 4** : → révision dans 90 jours
- **Niveau 5** : Maîtrisé

La qualité de réponse (0-5) ajuste le niveau et la prochaine date de révision.

## Persistance

Toutes les données de progression sont stockées dans localStorage :
- Progression des leçons (lues, QCM passés)
- État des flashcards (niveau, prochaine révision)
- Historique des exercices
- Statistiques globales

## Méthodologie d'Apprentissage

L'application s'appuie sur des principes pédagogiques éprouvés :

1. **Testing Effect** : Apprendre en se testant est plus efficace que relire
2. **Répétition Espacée** : Réviser à intervalles croissants optimise la mémorisation
3. **Feedback Immédiat** : Corrections immédiates avec explications détaillées
4. **Diagnostic** : QCM pré-leçon pour identifier les lacunes
5. **Multi-représentations** : Même concept présenté de plusieurs façons

## Contribution

Les contributions sont les bienvenues ! Pour ajouter du contenu :

1. **Nouvelle leçon** : Créer un fichier `.mdx` dans `content/lessons/[track]/`
2. **Nouveaux exercices** : Ajouter au fichier `content/exercises.json`
3. **Nouveaux exercices guidés** : Ajouter au fichier `content/guided-exercises.json`
4. **Nouvelles flashcards** : Ajouter au fichier `content/flashcards.json`
5. **Nouveaux quiz** : Ajouter au fichier `content/quizzes.json`
6. **Nouvelles annales** : Ajouter au fichier `content/annales.json`
7. **Parcours de révision** : Ajouter au fichier `content/paths.json` (optionnel)

## Licence

MIT

---

Développé pour les élèves de Terminale préparant le Baccalauréat.
