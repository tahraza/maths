/**
 * Questions conceptuelles pour développer la compréhension profonde
 * Ces questions vont au-delà du calcul mécanique
 */

export interface ConceptualQuestion {
  id: string
  category: string
  topic: string
  question: string
  difficulty: number // 1-3
  hints: string[]
  answer: string
  keyInsight: string // L'idée clé à retenir
}

export interface ConceptualGenerator {
  id: string
  category: string
  title: string
  description: string
  difficulty: number
  generate: () => ConceptualQuestion
}

// Utilitaire pour choix aléatoire
function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ============================================
// QUESTIONS CONCEPTUELLES PAR THÈME
// ============================================

// --- DÉRIVATION ---

const conceptDerivationPourquoi: ConceptualGenerator = {
  id: 'concept-deriv-pourquoi',
  category: 'Dérivation',
  title: 'Sens de la dérivée',
  description: 'Comprendre ce que représente la dérivée',
  difficulty: 1,
  generate: () => {
    const scenarios = [
      {
        question: "Si $f'(x) > 0$ sur un intervalle $I$, que peut-on dire de $f$ sur $I$ ? **Expliquer pourquoi** avec une interprétation graphique.",
        answer: "Si $f'(x) > 0$ sur $I$, alors $f$ est **strictement croissante** sur $I$.\n\nGraphiquement, $f'(x)$ représente le coefficient directeur de la tangente au point d'abscisse $x$. Si ce coefficient est positif, la tangente \"monte\" de gauche à droite, donc la courbe aussi.",
        keyInsight: "La dérivée mesure la pente. Pente positive = montée = fonction croissante.",
        hints: ["Que représente $f'(x)$ graphiquement ?", "Pense à la tangente à la courbe.", "Si la tangente monte, que fait la courbe ?"]
      },
      {
        question: "Pourquoi le maximum d'une fonction dérivable se trouve-t-il là où $f'(x) = 0$ (en général) ?",
        answer: "Au maximum, la tangente est **horizontale** (pente nulle).\n\nAvant le maximum, $f$ monte ($f' > 0$). Après le maximum, $f$ descend ($f' < 0$).\n\nAu point de transition (le sommet), la pente passe de positive à négative, donc elle vaut 0.",
        keyInsight: "Au sommet d'une colline, le sol est plat pendant un instant (pente = 0).",
        hints: ["Imagine-toi en train de gravir une colline puis de la descendre.", "Comment est le sol au sommet ?", "Que fait le signe de $f'$ avant et après le maximum ?"]
      },
      {
        question: "Soit $f(x) = x^2$. Pourquoi $f'(0) = 0$ alors que $f$ n'est pas constante ?",
        answer: "$f'(0) = 0$ signifie que la tangente à $f$ en $x=0$ est horizontale.\n\nMais la tangente horizontale est **locale** : juste à ce point précis. Autour de ce point, la fonction remonte des deux côtés (c'est un minimum).\n\nUne dérivée nulle en un point ne dit rien sur le comportement global.",
        keyInsight: "La dérivée est une information locale (en un point), pas globale.",
        hints: ["Dessine la parabole $y = x^2$.", "Comment est la tangente en $x = 0$ ?", "Est-ce un maximum, minimum, ou ni l'un ni l'autre ?"]
      }
    ]
    const s = randChoice(scenarios)
    return {
      id: `concept-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'Dérivation',
      topic: 'Interprétation de la dérivée',
      question: s.question,
      difficulty: 1,
      hints: s.hints,
      answer: s.answer,
      keyInsight: s.keyInsight
    }
  }
}

const conceptDerivationContreExemple: ConceptualGenerator = {
  id: 'concept-deriv-contre-exemple',
  category: 'Dérivation',
  title: 'Contre-exemples en dérivation',
  description: 'Identifier les limites des règles usuelles',
  difficulty: 2,
  generate: () => {
    const scenarios = [
      {
        question: "\"Si $f'(a) = 0$, alors $a$ est un extremum de $f$.\" Cette affirmation est-elle vraie ? Donner un contre-exemple si elle est fausse.",
        answer: "**Faux !** Contre-exemple : $f(x) = x^3$.\n\nOn a $f'(x) = 3x^2$, donc $f'(0) = 0$.\n\nMais $f$ est strictement croissante sur $\\mathbb{R}$ (car $3x^2 \\geq 0$), donc $x = 0$ n'est ni un maximum ni un minimum. C'est un **point d'inflexion**.",
        keyInsight: "$f'(a) = 0$ est une condition nécessaire mais pas suffisante pour un extremum.",
        hints: ["Pense à une fonction qui 'passe à travers' la tangente horizontale.", "Essaie une fonction impaire simple.", "$x^3$ a une tangente horizontale en 0, mais est-ce un extremum ?"]
      },
      {
        question: "\"Si $f$ est continue, alors $f$ est dérivable.\" Cette affirmation est-elle vraie ?",
        answer: "**Faux !** Contre-exemple : $f(x) = |x|$ (valeur absolue).\n\n$f$ est continue sur $\\mathbb{R}$ mais n'est **pas dérivable en 0** : la courbe forme un \"angle\" et il n'existe pas de tangente unique.\n\nÀ gauche de 0, la pente est $-1$. À droite, elle est $+1$.",
        keyInsight: "Continuité ⇏ Dérivabilité. Il faut aussi qu'il n'y ait pas d'angle.",
        hints: ["Dessine la courbe de $f(x) = |x|$.", "Y a-t-il une tangente bien définie en $x = 0$ ?", "Les tangentes à gauche et à droite sont-elles les mêmes ?"]
      }
    ]
    const s = randChoice(scenarios)
    return {
      id: `concept-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'Dérivation',
      topic: 'Limites des théorèmes',
      question: s.question,
      difficulty: 2,
      hints: s.hints,
      answer: s.answer,
      keyInsight: s.keyInsight
    }
  }
}

// --- EXPONENTIELLE ET LOGARITHME ---

const conceptExpLnLien: ConceptualGenerator = {
  id: 'concept-exp-ln-lien',
  category: 'Exponentielle',
  title: 'Lien exp/ln',
  description: 'Comprendre la relation entre exponentielle et logarithme',
  difficulty: 2,
  generate: () => {
    const scenarios = [
      {
        question: "Expliquer pourquoi $\\ln(e^x) = x$ et $e^{\\ln(x)} = x$. Quel est le lien entre ces deux égalités ?",
        answer: "$\\exp$ et $\\ln$ sont des **fonctions réciproques** :\n\n- $\\exp : \\mathbb{R} \\to ]0, +\\infty[$\n- $\\ln : ]0, +\\infty[ \\to \\mathbb{R}$\n\n\"Réciproques\" signifie que l'une défait ce que l'autre fait :\n- $\\ln(e^x) = x$ : le ln \"annule\" l'exponentielle\n- $e^{\\ln(x)} = x$ : l'exp \"annule\" le ln\n\nC'est comme la relation entre élever au carré et prendre la racine carrée (pour les positifs).",
        keyInsight: "exp et ln sont inverses l'une de l'autre, comme + et -, ou × et ÷.",
        hints: ["Pense à ce que signifie 'fonction réciproque'.", "Que se passe-t-il quand on applique une fonction puis son inverse ?", "Compare avec carré/racine carrée."]
      },
      {
        question: "Pourquoi $\\ln(ab) = \\ln(a) + \\ln(b)$ ? Donner une explication sans calcul.",
        answer: "L'exponentielle transforme les **sommes en produits** : $e^{x+y} = e^x \\cdot e^y$.\n\nComme $\\ln$ est l'opération inverse, il fait l'inverse : il transforme les **produits en sommes**.\n\nHistoriquement, c'est pour ça qu'on a inventé les logarithmes : pour transformer des multiplications (difficiles) en additions (faciles) !",
        keyInsight: "Le ln transforme × en + car l'exp fait l'inverse.",
        hints: ["Que fait l'exponentielle avec une somme d'exposants ?", "Si exp(a+b) = exp(a)×exp(b), que fait le ln ?", "Le ln est l'opération inverse de l'exp."]
      }
    ]
    const s = randChoice(scenarios)
    return {
      id: `concept-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'Exponentielle',
      topic: 'Relation exp/ln',
      question: s.question,
      difficulty: 2,
      hints: s.hints,
      answer: s.answer,
      keyInsight: s.keyInsight
    }
  }
}

// --- INTÉGRALES ---

const conceptIntegraleAire: ConceptualGenerator = {
  id: 'concept-integrale-aire',
  category: 'Intégrales',
  title: 'Sens de l\'intégrale',
  description: 'Comprendre l\'intégrale comme aire',
  difficulty: 1,
  generate: () => {
    const scenarios = [
      {
        question: "Pourquoi $\\int_a^b f(x)\\,dx$ peut-elle être négative, alors qu'une aire est toujours positive ?",
        answer: "L'intégrale mesure une **aire algébrique**, pas géométrique :\n\n- Aire **au-dessus** de l'axe des x : comptée positivement\n- Aire **en-dessous** de l'axe des x : comptée négativement\n\nSi la courbe passe plus de temps sous l'axe des x, l'intégrale peut être négative.\n\nPour l'aire géométrique (toujours positive), on utilise $\\int |f(x)|\\,dx$.",
        keyInsight: "L'intégrale est une aire 'signée' : + au-dessus, - en-dessous de l'axe x.",
        hints: ["Pense à la position de la courbe par rapport à l'axe des x.", "Que se passe-t-il quand f(x) < 0 ?", "L'intégrale tient compte du signe."]
      },
      {
        question: "Expliquer intuitivement pourquoi $\\int_a^a f(x)\\,dx = 0$.",
        answer: "L'intégrale de $a$ à $a$ représente l'aire sous la courbe entre $x = a$ et $x = a$.\n\nMais entre un point et lui-même, il n'y a **pas d'espace** ! L'intervalle a une \"largeur\" nulle.\n\nC'est comme calculer l'aire d'un rectangle de largeur 0 : peu importe la hauteur, l'aire est 0.",
        keyInsight: "Pas d'intervalle = pas d'aire = intégrale nulle.",
        hints: ["Quel est l'intervalle d'intégration ?", "Quelle est la 'largeur' de cet intervalle ?", "Aire = base × hauteur. Si la base = 0..."]
      },
      {
        question: "Pourquoi $\\int_a^b f(x)\\,dx = -\\int_b^a f(x)\\,dx$ ? (Inverser les bornes change le signe)",
        answer: "Quand on intègre de $a$ vers $b$, on \"avance\" dans le sens positif.\n\nQuand on intègre de $b$ vers $a$, on \"recule\". C'est comme faire le chemin inverse.\n\nPar convention, reculer donne l'opposé d'avancer. C'est cohérent avec :\n$$\\int_a^b + \\int_b^a = \\int_a^a = 0$$",
        keyInsight: "Inverser le sens du parcours inverse le signe, comme pour les distances orientées.",
        hints: ["Compare avec marcher de A vers B, puis de B vers A.", "La relation de Chasles : $\\int_a^b + \\int_b^c = \\int_a^c$", "Que donne $\\int_a^b + \\int_b^a$ ?"]
      }
    ]
    const s = randChoice(scenarios)
    return {
      id: `concept-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'Intégrales',
      topic: 'Interprétation de l\'intégrale',
      question: s.question,
      difficulty: 1,
      hints: s.hints,
      answer: s.answer,
      keyInsight: s.keyInsight
    }
  }
}

// --- SUITES ---

const conceptSuiteConvergence: ConceptualGenerator = {
  id: 'concept-suite-convergence',
  category: 'Suites',
  title: 'Convergence des suites',
  description: 'Comprendre la notion de limite de suite',
  difficulty: 2,
  generate: () => {
    const scenarios = [
      {
        question: "La suite $(u_n) = (-1)^n$ est-elle bornée ? Converge-t-elle ? Expliquer la différence.",
        answer: "- **Bornée** : oui, car $-1 \\leq (-1)^n \\leq 1$ pour tout $n$.\n- **Convergente** : non, car elle oscille indéfiniment entre $-1$ et $1$.\n\n**Différence** :\n- Bornée = les termes restent dans un intervalle fixe\n- Convergente = les termes s'approchent d'une unique valeur\n\nUne suite peut rester dans un intervalle sans jamais \"se stabiliser\".",
        keyInsight: "Convergence ⇒ Bornée, mais Bornée ⇏ Convergence.",
        hints: ["Calcule les premiers termes : $u_0, u_1, u_2...$", "Les termes restent-ils dans un intervalle ?", "Les termes s'approchent-ils d'une seule valeur ?"]
      },
      {
        question: "Si $(u_n)$ converge vers $L$, est-ce que tous les termes $u_n$ sont proches de $L$ ?",
        answer: "**Non !** Seuls les termes **à partir d'un certain rang** sont proches de $L$.\n\nExemple : $u_n = 1000 - n$ pour $n \\leq 1000$, puis $u_n = \\frac{1}{n}$ après.\nCette suite converge vers 0, mais les 1000 premiers termes sont très éloignés de 0.\n\nLa convergence parle du comportement **à l'infini**, pas des premiers termes.",
        keyInsight: "La convergence ignore les premiers termes ; seul le comportement à l'infini compte.",
        hints: ["La définition de la limite parle de 'à partir d'un certain rang'.", "Les premiers termes peuvent-ils être loin de la limite ?", "Ce qui compte, c'est ce qui se passe quand $n \\to +\\infty$."]
      }
    ]
    const s = randChoice(scenarios)
    return {
      id: `concept-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'Suites',
      topic: 'Convergence',
      question: s.question,
      difficulty: 2,
      hints: s.hints,
      answer: s.answer,
      keyInsight: s.keyInsight
    }
  }
}

// --- PROBABILITÉS ---

const conceptProbaIndependance: ConceptualGenerator = {
  id: 'concept-proba-indep',
  category: 'Probabilités',
  title: 'Indépendance vs incompatibilité',
  description: 'Distinguer deux notions souvent confondues',
  difficulty: 2,
  generate: () => {
    const scenarios = [
      {
        question: "Quelle est la différence entre événements **indépendants** et événements **incompatibles** ? Donner un exemple de chaque.",
        answer: "**Incompatibles** : ne peuvent pas se produire en même temps.\n- Exemple : obtenir 6 et obtenir un nombre pair sur un dé → incompatibles ? Non ! 6 est pair.\n- Vrai exemple : obtenir 1 et obtenir 6 sur un même lancer.\n\n**Indépendants** : la réalisation de l'un n'affecte pas la probabilité de l'autre.\n- Exemple : résultat du 1er lancer et résultat du 2e lancer.\n\n**Attention** : Si $P(A) > 0$ et $P(B) > 0$, alors incompatibles ⇒ dépendants !",
        keyInsight: "Incompatible = ne peuvent pas coexister. Indépendant = n'influencent pas l'un l'autre.",
        hints: ["Incompatible : peuvent-ils arriver ensemble ?", "Indépendant : l'un change-t-il la probabilité de l'autre ?", "Si A et B sont incompatibles, que vaut $P(A \\cap B)$ ?"]
      },
      {
        question: "Deux événements $A$ et $B$ avec $P(A) = 0.5$ et $P(B) = 0.5$ peuvent-ils être indépendants ?",
        answer: "**Oui !** Par exemple, deux lancers de pièce :\n- $A$ = \"pile au 1er lancer\", $P(A) = 0.5$\n- $B$ = \"pile au 2e lancer\", $P(B) = 0.5$\n\nCes événements sont indépendants : le résultat du premier lancer n'affecte pas le second.\n\nOn vérifie : $P(A \\cap B) = 0.25 = P(A) \\times P(B)$. ✓",
        keyInsight: "L'indépendance dépend de la relation entre les événements, pas de leurs probabilités.",
        hints: ["Trouve un exemple concret avec deux expériences séparées.", "Le résultat d'un lancer affecte-t-il l'autre ?", "Vérifie le critère : $P(A \\cap B) = P(A) \\times P(B)$"]
      }
    ]
    const s = randChoice(scenarios)
    return {
      id: `concept-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'Probabilités',
      topic: 'Indépendance',
      question: s.question,
      difficulty: 2,
      hints: s.hints,
      answer: s.answer,
      keyInsight: s.keyInsight
    }
  }
}

// --- NOMBRES COMPLEXES ---

const conceptComplexeGeometrie: ConceptualGenerator = {
  id: 'concept-complexe-geo',
  category: 'Nombres complexes',
  title: 'Interprétation géométrique',
  description: 'Comprendre les complexes géométriquement',
  difficulty: 2,
  generate: () => {
    const scenarios = [
      {
        question: "Que représente géométriquement la multiplication par $i$ ?",
        answer: "Multiplier par $i$ équivaut à une **rotation de 90° dans le sens direct** (antihoraire).\n\nExemple : $z = 1$ (point sur l'axe réel)\n- $iz = i$ (point sur l'axe imaginaire, tourné de 90°)\n- $i \\cdot i = -1$ (encore 90°, total 180°)\n- $i^3 = -i$ (270°)\n- $i^4 = 1$ (360°, retour au départ)\n\nC'est pour ça que $i^4 = 1$ : 4 rotations de 90° = tour complet !",
        keyInsight: "Multiplier par i = rotation de 90°. C'est la clé de la géométrie des complexes.",
        hints: ["Place les points 1, i, -1, -i dans le plan complexe.", "Quel angle forment-ils entre eux ?", "Multiplier par i, c'est faire un quart de tour."]
      },
      {
        question: "Pourquoi le module de $z \\cdot w$ est-il $|z| \\times |w|$ ?",
        answer: "Le module représente la **distance à l'origine** (le rayon).\n\nQuand on multiplie deux complexes :\n- Les modules se multiplient\n- Les arguments s'additionnent\n\nIntuition : si on \"étire\" un vecteur par un facteur $|z|$, puis encore par $|w|$, l'étirement total est $|z| \\times |w|$.\n\nC'est comme les échelles : zoom ×2 puis zoom ×3 = zoom ×6.",
        keyInsight: "Multiplication de complexes = composition d'homothéties et de rotations.",
        hints: ["Le module mesure la 'taille' du complexe.", "Que fait la multiplication sur les tailles ?", "Pense aux facteurs d'agrandissement."]
      }
    ]
    const s = randChoice(scenarios)
    return {
      id: `concept-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'Nombres complexes',
      topic: 'Géométrie',
      question: s.question,
      difficulty: 2,
      hints: s.hints,
      answer: s.answer,
      keyInsight: s.keyInsight
    }
  }
}

// --- RÉCURRENCE ---

const conceptRecurrencePourquoi: ConceptualGenerator = {
  id: 'concept-recurrence-pourquoi',
  category: 'Récurrence',
  title: 'Comprendre la récurrence',
  description: 'Pourquoi la récurrence fonctionne',
  difficulty: 2,
  generate: () => {
    const scenarios = [
      {
        question: "Expliquer par une analogie pourquoi une preuve par récurrence est valide.",
        answer: "**Analogie des dominos** :\n\n1. **Initialisation** : Le premier domino tombe.\n2. **Hérédité** : Si un domino tombe, le suivant tombe aussi.\n\n⇒ Tous les dominos tombent !\n\n**Analogie de l'escalier** :\n1. Je sais monter sur la première marche.\n2. Si je suis sur une marche, je sais monter sur la suivante.\n\n⇒ Je peux atteindre n'importe quelle marche !",
        keyInsight: "La récurrence, c'est : savoir commencer + savoir continuer = pouvoir aller partout.",
        hints: ["Pense à une file de dominos.", "Que faut-il pour que tous tombent ?", "Et si le premier ne tombe pas ?"]
      },
      {
        question: "Pourquoi l'initialisation est-elle indispensable dans une récurrence ?",
        answer: "Sans initialisation, l'hérédité ne sert à rien !\n\n**Exemple absurde** : \"Tous les entiers sont égaux à 42.\"\n- Hérédité : Si $n = 42$, alors $n+1 = n+1$... (ne prouve rien)\n\nL'hérédité dit seulement : \"SI c'est vrai à un rang, c'est vrai au suivant.\"\nMais sans vérifier que c'est vrai AU DÉPART, on n'a rien prouvé.\n\nC'est comme dire \"si je suis sur une marche, je peux monter\" mais sans jamais monter sur l'escalier !",
        keyInsight: "L'hérédité est une implication : elle ne crée pas la vérité initiale.",
        hints: ["L'hérédité est de la forme 'Si P(n), alors P(n+1)'.", "Que vaut cette implication si P(n) est faux pour tout n ?", "Il faut un point de départ vrai."]
      }
    ]
    const s = randChoice(scenarios)
    return {
      id: `concept-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'Récurrence',
      topic: 'Principe de récurrence',
      question: s.question,
      difficulty: 2,
      hints: s.hints,
      answer: s.answer,
      keyInsight: s.keyInsight
    }
  }
}

// Liste de tous les générateurs conceptuels
export const conceptualGenerators: ConceptualGenerator[] = [
  conceptDerivationPourquoi,
  conceptDerivationContreExemple,
  conceptExpLnLien,
  conceptIntegraleAire,
  conceptSuiteConvergence,
  conceptProbaIndependance,
  conceptComplexeGeometrie,
  conceptRecurrencePourquoi,
]

// Générateurs par catégorie
export const conceptualGeneratorsByCategory = conceptualGenerators.reduce((acc, gen) => {
  if (!acc[gen.category]) {
    acc[gen.category] = []
  }
  acc[gen.category].push(gen)
  return acc
}, {} as Record<string, ConceptualGenerator[]>)
