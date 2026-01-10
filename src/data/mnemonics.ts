// Moyens mnémotechniques pour retenir les formules et définitions mathématiques

export interface Mnemonic {
  id: string
  lessonId: string // ID de la leçon associée
  category: 'formula' | 'definition' | 'method' | 'property' | 'tip' | 'theorem'
  title: string
  content: string // La formule ou définition à retenir
  mnemonic: string // L'astuce mnémotechnique
  explanation?: string // Explication de l'astuce
  visualAid?: string // Aide visuelle (emoji ou description)
}

export const mnemonics: Mnemonic[] = [
  // === DÉRIVATION ===
  {
    id: 'deriv-produit',
    lessonId: 'derivation',
    category: 'formula',
    title: 'Dérivée d\'un produit',
    content: '$(uv)\' = u\'v + uv\'$',
    mnemonic: '**"U prime V plus U V prime"** - Comme une danse : le premier avance (u\'), le second reste (v), puis on inverse !',
    explanation: 'Imaginez deux danseurs U et V. D\'abord U fait un pas (dérive) pendant que V reste immobile, puis c\'est l\'inverse.',
    visualAid: '💃🕺'
  },
  {
    id: 'deriv-quotient',
    lessonId: 'derivation',
    category: 'formula',
    title: 'Dérivée d\'un quotient',
    content: '$\\left(\\frac{u}{v}\\right)\' = \\frac{u\'v - uv\'}{v^2}$',
    mnemonic: '**"Au numérateur : U prime V moins U V prime, le tout sur V carré"** - Le numérateur c\'est comme le produit mais avec un MOINS, et on divise par le carré du bas.',
    explanation: 'Retenir : produit avec "-" au lieu de "+" et on met v² en dessous.',
    visualAid: '➗'
  },
  {
    id: 'deriv-composee',
    lessonId: 'derivation',
    category: 'formula',
    title: 'Dérivée d\'une fonction composée',
    content: '$[f(g(x))]\' = g\'(x) \\times f\'(g(x))$',
    mnemonic: '**"La chaîne : dérive l\'intérieur, multiplie par la dérivée de l\'extérieur évaluée à l\'intérieur"**',
    explanation: 'Pensez à éplucher un oignon : on dérive couche par couche, de l\'intérieur vers l\'extérieur.',
    visualAid: '🧅'
  },
  {
    id: 'deriv-puissance',
    lessonId: 'derivation',
    category: 'formula',
    title: 'Dérivée de x^n',
    content: '$(x^n)\' = nx^{n-1}$',
    mnemonic: '**"L\'exposant descend devant et diminue de 1"** - L\'exposant fait une glissade !',
    explanation: 'L\'exposant n descend pour devenir coefficient, puis on le réduit de 1.',
    visualAid: '🎿'
  },
  {
    id: 'tangente-equation',
    lessonId: 'derivation',
    category: 'formula',
    title: 'Équation de la tangente',
    content: '$y = f\'(a)(x-a) + f(a)$',
    mnemonic: '**"Y égale PENTE fois (x moins a) plus ORDONNÉE"** - C\'est l\'équation d\'une droite avec pente = f\'(a) passant par (a, f(a)).',
    explanation: 'La tangente est une droite : y = mx + p avec m = f\'(a) et passage par le point de tangence.',
    visualAid: '📐'
  },

  // === EXPONENTIELLE ===
  {
    id: 'exp-definition',
    lessonId: 'exponentielle',
    category: 'definition',
    title: 'Définition de l\'exponentielle',
    content: '$e^x$ est l\'unique fonction égale à sa dérivée valant 1 en 0',
    mnemonic: '**"EXP est sa propre dérivée, elle vaut 1 au départ"** - Elle est narcissique : elle ne change jamais quand on la dérive !',
    explanation: 'La fonction exponentielle est la seule fonction f telle que f\' = f et f(0) = 1.',
    visualAid: '🪞'
  },
  {
    id: 'exp-proprietes',
    lessonId: 'exponentielle',
    category: 'property',
    title: 'Propriétés de l\'exponentielle',
    content: '$e^{a+b} = e^a \\times e^b$ et $e^{a-b} = \\frac{e^a}{e^b}$',
    mnemonic: '**"SOMME en exposant = PRODUIT, DIFFÉRENCE en exposant = QUOTIENT"** - Les opérations "descendent d\'un niveau"',
    explanation: 'L\'exponentielle transforme les additions en multiplications et les soustractions en divisions.',
    visualAid: '⬇️'
  },
  {
    id: 'exp-limites',
    lessonId: 'exponentielle',
    category: 'property',
    title: 'Croissances comparées',
    content: '$\\lim_{x \\to +\\infty} \\frac{e^x}{x^n} = +\\infty$',
    mnemonic: '**"L\'exponentielle ÉCRASE toujours les polynômes"** - E comme Écrasante !',
    explanation: 'Peu importe la puissance de x, l\'exponentielle gagne toujours à l\'infini.',
    visualAid: '🦖'
  },
  {
    id: 'exp-euler',
    lessonId: 'exponentielle',
    category: 'formula',
    title: 'Nombre e',
    content: '$e \\approx 2{,}718281828...$',
    mnemonic: '**"2,7 - 1828 - 1828"** - Le nombre e commence par 2,7 puis 1828 répété deux fois !',
    explanation: 'Andrew Jackson fut élu président américain en 1828, et ce nombre apparaît deux fois après 2,7.',
    visualAid: '🔢'
  },

  // === LOGARITHME ===
  {
    id: 'ln-definition',
    lessonId: 'logarithme',
    category: 'definition',
    title: 'Définition du logarithme',
    content: '$\\ln(x) = y \\Leftrightarrow e^y = x$',
    mnemonic: '**"LN et EXP sont inverses : ce que l\'un fait, l\'autre défait"** - Comme défaire ses lacets !',
    explanation: 'Le logarithme népérien est la fonction réciproque de l\'exponentielle.',
    visualAid: '🔄'
  },
  {
    id: 'ln-proprietes',
    lessonId: 'logarithme',
    category: 'property',
    title: 'Propriétés du logarithme',
    content: '$\\ln(ab) = \\ln(a) + \\ln(b)$ et $\\ln\\left(\\frac{a}{b}\\right) = \\ln(a) - \\ln(b)$',
    mnemonic: '**"PRODUIT devient SOMME, QUOTIENT devient DIFFÉRENCE"** - C\'est l\'inverse de l\'exponentielle : les opérations "montent d\'un niveau"',
    explanation: 'Le logarithme transforme les multiplications en additions et les divisions en soustractions.',
    visualAid: '⬆️'
  },
  {
    id: 'ln-puissance',
    lessonId: 'logarithme',
    category: 'formula',
    title: 'Logarithme d\'une puissance',
    content: '$\\ln(a^n) = n \\ln(a)$',
    mnemonic: '**"L\'exposant sort et se met devant"** - Comme un élève impatient qui veut sortir de classe !',
    explanation: 'L\'exposant n devient un coefficient multiplicateur.',
    visualAid: '🚪'
  },
  {
    id: 'ln-derivee',
    lessonId: 'logarithme',
    category: 'formula',
    title: 'Dérivée du logarithme',
    content: '$(\\ln x)\' = \\frac{1}{x}$ et $(\\ln u)\' = \\frac{u\'}{u}$',
    mnemonic: '**"La dérivée de ln c\'est 1 sur ce qu\'il y a dedans, fois la dérivée de ce qu\'il y a dedans"**',
    explanation: 'Pour ln(u), on fait u\'/u : la dérivée de l\'intérieur sur l\'intérieur.',
    visualAid: '📊'
  },

  // === INTÉGRALES ===
  {
    id: 'integrale-chasles',
    lessonId: 'integrales',
    category: 'property',
    title: 'Relation de Chasles',
    content: '$\\int_a^c f = \\int_a^b f + \\int_b^c f$',
    mnemonic: '**"On peut s\'arrêter au milieu pour souffler !"** - Comme une randonnée en deux étapes.',
    explanation: 'L\'intégrale de a à c peut se décomposer en passant par n\'importe quel point intermédiaire b.',
    visualAid: '🥾'
  },
  {
    id: 'integrale-ipp',
    lessonId: 'integrales',
    category: 'formula',
    title: 'Intégration par parties',
    content: '$\\int u\'v = [uv] - \\int uv\'$',
    mnemonic: '**"U prime V intégrale = UV crochet MOINS intégrale de U V prime"** - On échange les rôles : qui dérivait intègre, qui était intégré dérive !',
    explanation: 'C\'est la formule inverse de la dérivée d\'un produit, adaptée à l\'intégration.',
    visualAid: '🔀'
  },
  {
    id: 'integrale-aire',
    lessonId: 'integrales',
    category: 'definition',
    title: 'Interprétation géométrique',
    content: '$\\int_a^b f(x)dx$ = aire algébrique sous la courbe',
    mnemonic: '**"L\'intégrale COMPTE l\'aire : positive au-dessus, négative en-dessous"**',
    explanation: 'L\'aire au-dessus de l\'axe des x est positive, en-dessous elle est négative.',
    visualAid: '📏'
  },
  {
    id: 'integrale-moyenne',
    lessonId: 'integrales',
    category: 'formula',
    title: 'Valeur moyenne',
    content: '$\\mu = \\frac{1}{b-a}\\int_a^b f(x)dx$',
    mnemonic: '**"Aire divisée par largeur = hauteur moyenne"** - Comme aplatir la courbe en un rectangle de même aire !',
    explanation: 'C\'est la hauteur du rectangle de même aire que la surface sous la courbe.',
    visualAid: '📊'
  },

  // === PRIMITIVES ===
  {
    id: 'primitive-xn',
    lessonId: 'primitives',
    category: 'formula',
    title: 'Primitive de x^n',
    content: '$\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$ (pour $n \\neq -1$)',
    mnemonic: '**"L\'exposant monte de 1 et divise"** - C\'est l\'inverse de la dérivation : l\'exposant remonte !',
    explanation: 'On augmente l\'exposant de 1 et on divise par le nouvel exposant. N\'oubliez pas la constante C !',
    visualAid: '⬆️'
  },
  {
    id: 'primitive-exp',
    lessonId: 'primitives',
    category: 'formula',
    title: 'Primitive de e^x',
    content: '$\\int e^x dx = e^x + C$',
    mnemonic: '**"EXP reste EXP"** - Toujours narcissique : elle ne change ni en dérivant ni en primitivant !',
    explanation: 'L\'exponentielle est sa propre primitive (à une constante près).',
    visualAid: '🪞'
  },
  {
    id: 'primitive-inverse',
    lessonId: 'primitives',
    category: 'formula',
    title: 'Primitive de 1/x',
    content: '$\\int \\frac{1}{x} dx = \\ln|x| + C$',
    mnemonic: '**"1/x donne ln"** - Le seul cas où la formule de x^n ne marche pas ! (car n = -1)',
    explanation: 'C\'est le cas particulier n = -1 où on ne peut pas appliquer la formule générale.',
    visualAid: '⚠️'
  },

  // === SUITES ===
  {
    id: 'suite-arithmetique',
    lessonId: 'suites-definition',
    category: 'formula',
    title: 'Suite arithmétique',
    content: '$u_n = u_0 + nr$ ou $u_n = u_p + (n-p)r$',
    mnemonic: '**"ARITHMÉTIQUE = ADDITION de la raison"** - Le A de Arithmétique comme Addition !',
    explanation: 'On ajoute la raison r à chaque terme pour passer au suivant.',
    visualAid: '➕'
  },
  {
    id: 'suite-geometrique',
    lessonId: 'suites-definition',
    category: 'formula',
    title: 'Suite géométrique',
    content: '$u_n = u_0 \\times q^n$ ou $u_n = u_p \\times q^{n-p}$',
    mnemonic: '**"GÉOMÉTRIQUE = on MULTIPLIE par la raison"** - Le G de Géométrique mais pensez Multiplication !',
    explanation: 'On multiplie par la raison q pour passer au terme suivant.',
    visualAid: '✖️'
  },
  {
    id: 'suite-somme-arith',
    lessonId: 'suites-definition',
    category: 'formula',
    title: 'Somme arithmétique',
    content: '$S = \\frac{(n+1)(u_0 + u_n)}{2} = \\frac{\\text{nb termes} \\times (\\text{premier} + \\text{dernier})}{2}$',
    mnemonic: '**"Nombre de termes fois la moyenne du premier et du dernier"** - Comme Gauss qui additionna 1+2+...+100 en faisant 101×50 !',
    explanation: 'La somme c\'est le nombre de termes multiplié par la moyenne des extrêmes.',
    visualAid: '🧒'
  },
  {
    id: 'suite-somme-geo',
    lessonId: 'suites-definition',
    category: 'formula',
    title: 'Somme géométrique',
    content: '$S = u_0 \\times \\frac{1-q^{n+1}}{1-q}$ pour $q \\neq 1$',
    mnemonic: '**"Premier terme fois (1 moins raison puissance nb termes) sur (1 moins raison)"** - Pensez : $\\frac{1-q^n}{1-q}$ = somme de 1+q+q²+...+q^{n-1}',
    explanation: 'Le n+1 à l\'exposant correspond au nombre de termes (de 0 à n).',
    visualAid: '📈'
  },

  // === LIMITES ===
  {
    id: 'limite-formes-ind',
    lessonId: 'limites-fonctions',
    category: 'tip',
    title: 'Formes indéterminées',
    content: '$\\frac{\\infty}{\\infty}$, $\\frac{0}{0}$, $\\infty - \\infty$, $0 \\times \\infty$, $1^\\infty$, $0^0$, $\\infty^0$',
    mnemonic: '**"Les 7 FI"** (Formes Indéterminées) - Comme les 7 nains, on doit travailler pour les résoudre !',
    explanation: 'Ces formes nécessitent une transformation avant de calculer la limite.',
    visualAid: '⛏️'
  },
  {
    id: 'limite-croissances',
    lessonId: 'limites-fonctions',
    category: 'property',
    title: 'Croissances comparées',
    content: 'À l\'infini : $\\ln \\ll x^\\alpha \\ll e^x$ pour tout $\\alpha > 0$',
    mnemonic: '**"Log, Puis Poly, Puis Expo"** - LPE dans l\'ordre croissant de rapidité !',
    explanation: 'L\'exponentielle croît plus vite que tout polynôme, qui croît plus vite que le logarithme.',
    visualAid: '🚀'
  },

  // === PROBABILITÉS ===
  {
    id: 'proba-binomiale',
    lessonId: 'loi-binomiale',
    category: 'formula',
    title: 'Loi binomiale',
    content: '$P(X=k) = \\binom{n}{k} p^k (1-p)^{n-k}$',
    mnemonic: '**"Combinaison × Succès^k × Échecs^{reste}"** - On choisit k succès parmi n, avec proba p pour chaque succès et (1-p) pour chaque échec.',
    explanation: 'C(n,k) compte les façons de placer les k succès, puis on multiplie les probas.',
    visualAid: '🎲'
  },
  {
    id: 'proba-binomiale-params',
    lessonId: 'loi-binomiale',
    category: 'formula',
    title: 'Espérance et variance binomiale',
    content: '$E(X) = np$ et $V(X) = np(1-p)$',
    mnemonic: '**"E = np, V = npq"** où q = 1-p. L\'espérance c\'est "nombre d\'essais × proba", la variance ajoute le facteur q.',
    explanation: 'Sur n essais avec proba p, on attend np succès. La variance mesure l\'écart autour de cette moyenne.',
    visualAid: '📊'
  },
  {
    id: 'proba-normale',
    lessonId: 'loi-normale',
    category: 'property',
    title: 'Règle empirique (68-95-99,7)',
    content: 'Pour $X \\sim \\mathcal{N}(\\mu, \\sigma^2)$ : 68% dans $[\\mu-\\sigma, \\mu+\\sigma]$, 95% dans $[\\mu-2\\sigma, \\mu+2\\sigma]$, 99,7% dans $[\\mu-3\\sigma, \\mu+3\\sigma]$',
    mnemonic: '**"68 - 95 - 99,7"** - Pensez à un compte à rebours approximatif : 70, 95, 100 !',
    explanation: 'La plupart des valeurs (68%) sont à 1 écart-type, presque toutes (95%) à 2, et quasiment toutes (99,7%) à 3.',
    visualAid: '🔔'
  },

  // === NOMBRES COMPLEXES ===
  {
    id: 'complexe-i2',
    lessonId: 'complexes-introduction',
    category: 'definition',
    title: 'Le nombre i',
    content: '$i^2 = -1$',
    mnemonic: '**"i carré c\'est moins un"** - i est Imaginaire car son carré est négatif, ce qui est Impossible pour un réel !',
    explanation: 'Le nombre i est défini comme une solution de x² = -1.',
    visualAid: '🔮'
  },
  {
    id: 'complexe-module',
    lessonId: 'complexes-introduction',
    category: 'formula',
    title: 'Module d\'un complexe',
    content: '$|z| = |a+ib| = \\sqrt{a^2 + b^2}$',
    mnemonic: '**"Pythagore !"** - Le module c\'est la distance à l\'origine, donc racine de la somme des carrés.',
    explanation: 'Dans le plan complexe, |z| est la distance du point z à l\'origine.',
    visualAid: '📐'
  },
  {
    id: 'complexe-euler',
    lessonId: 'complexes-introduction',
    category: 'formula',
    title: 'Formule d\'Euler',
    content: '$e^{i\\theta} = \\cos\\theta + i\\sin\\theta$',
    mnemonic: '**"EXP de i thêta = COS + i SIN"** - Pensez : exp(iθ) tourne sur le cercle unité !',
    explanation: 'Cette formule relie l\'exponentielle complexe aux fonctions trigonométriques.',
    visualAid: '⭕'
  },
  {
    id: 'complexe-conjugue',
    lessonId: 'complexes-introduction',
    category: 'property',
    title: 'Conjugué',
    content: '$\\overline{a+ib} = a-ib$ et $z \\times \\bar{z} = |z|^2$',
    mnemonic: '**"Conjuguer = changer le signe de la partie imaginaire"** - C\'est le reflet par rapport à l\'axe réel !',
    explanation: 'Le conjugué est symétrique par rapport à l\'axe des réels. Leur produit donne le module au carré.',
    visualAid: '🪞'
  },

  // === TRIGONOMÉTRIE ===
  {
    id: 'trigo-valeurs',
    lessonId: 'trigonometrie-bases',
    category: 'tip',
    title: 'Valeurs remarquables',
    content: 'cos et sin de 0, π/6, π/4, π/3, π/2',
    mnemonic: '**"Pour le cosinus : √4/2, √3/2, √2/2, √1/2, √0/2"** soit 1, √3/2, √2/2, 1/2, 0. **Pour le sinus, c\'est l\'inverse !**',
    explanation: 'Le cosinus décroît de 1 à 0, le sinus croît de 0 à 1 sur [0, π/2].',
    visualAid: '📋'
  },
  {
    id: 'trigo-formules-add',
    lessonId: 'trigonometrie-bases',
    category: 'formula',
    title: 'Formules d\'addition',
    content: '$\\cos(a+b) = \\cos a \\cos b - \\sin a \\sin b$',
    mnemonic: '**"COS COS - SIN SIN"** pour cos(a+b). Le cosinus garde les mêmes fonctions, avec un moins !',
    explanation: 'Pour cos(a-b), le - devient +. Pour sin(a±b), c\'est "SIN COS ± COS SIN".',
    visualAid: '🔢'
  },
  {
    id: 'trigo-pythagore',
    lessonId: 'trigonometrie-bases',
    category: 'formula',
    title: 'Identité fondamentale',
    content: '$\\cos^2(x) + \\sin^2(x) = 1$',
    mnemonic: '**"COS carré + SIN carré = 1"** - Pythagore sur le cercle unité : le rayon vaut toujours 1 !',
    explanation: 'Sur le cercle unité, tout point (cos θ, sin θ) vérifie x² + y² = 1.',
    visualAid: '⭕'
  },

  // === RÉCURRENCE ===
  {
    id: 'recurrence-etapes',
    lessonId: 'recurrence',
    category: 'method',
    title: 'Étapes d\'une récurrence',
    content: 'Initialisation → Hérédité → Conclusion',
    mnemonic: '**"IHC"** comme **I**nitialement **H**éréditairement **C**onclu - Ou pensez à "**I**l **H**abite **C**hez moi" !',
    explanation: '1) On vérifie P(n₀), 2) On suppose P(n) vraie et on montre P(n+1), 3) On conclut par récurrence.',
    visualAid: '🪜'
  },
  {
    id: 'recurrence-heredite',
    lessonId: 'recurrence',
    category: 'tip',
    title: 'Rédiger l\'hérédité',
    content: 'Supposons P(n) vraie pour un n fixé, montrons P(n+1)',
    mnemonic: '**"Soit n fixé tel que P(n). Montrons P(n+1)."** - N\'oubliez jamais de fixer n !',
    explanation: 'L\'erreur classique est d\'oublier de préciser que n est fixé dans l\'hypothèse de récurrence.',
    visualAid: '📝'
  },

  // === COMBINATOIRE ===
  {
    id: 'combi-factorielle',
    lessonId: 'combinatoire',
    category: 'definition',
    title: 'Factorielle',
    content: '$n! = n \\times (n-1) \\times ... \\times 2 \\times 1$',
    mnemonic: '**"n! = produit de tous les entiers de 1 à n"** - Le point d\'exclamation exprime la surprise : "Ça fait beaucoup !"',
    explanation: '0! = 1 par convention. 5! = 120, 10! = 3 628 800.',
    visualAid: '❗'
  },
  {
    id: 'combi-cnk',
    lessonId: 'combinatoire',
    category: 'formula',
    title: 'Coefficient binomial',
    content: '$\\binom{n}{k} = \\frac{n!}{k!(n-k)!}$',
    mnemonic: '**"n! divisé par k! fois (n-k)!"** - Ou utilisez le triangle de Pascal : chaque nombre = somme des deux au-dessus !',
    explanation: 'C\'est le nombre de façons de choisir k éléments parmi n, sans tenir compte de l\'ordre.',
    visualAid: '🔺'
  },
  {
    id: 'combi-pascal',
    lessonId: 'combinatoire',
    category: 'property',
    title: 'Relation de Pascal',
    content: '$\\binom{n}{k} = \\binom{n-1}{k-1} + \\binom{n-1}{k}$',
    mnemonic: '**"Chaque case = somme des deux parents au-dessus"** - Le triangle de Pascal se construit ligne par ligne !',
    explanation: 'Pour choisir k parmi n : soit on prend le n-ième (et on choisit k-1 parmi n-1), soit on ne le prend pas (et on choisit k parmi n-1).',
    visualAid: '🔺'
  },

  // === ÉQUATIONS DIFFÉRENTIELLES ===
  {
    id: 'equadiff-ordre1',
    lessonId: 'equations-differentielles',
    category: 'formula',
    title: 'Solution de y\' = ay',
    content: '$y = Ce^{ax}$ où $C \\in \\mathbb{R}$',
    mnemonic: '**"y\' = ay implique y = constante × exp(ax)"** - La solution est TOUJOURS une exponentielle !',
    explanation: 'L\'équation différentielle la plus simple : la fonction et sa dérivée sont proportionnelles.',
    visualAid: '📈'
  },
  {
    id: 'equadiff-second-membre',
    lessonId: 'equations-differentielles',
    category: 'method',
    title: 'Équation avec second membre',
    content: 'Solution générale = Solution homogène + Solution particulière',
    mnemonic: '**"SG = SH + SP"** - D\'abord résoudre sans le second membre, puis trouver UNE solution avec.',
    explanation: 'Pour y\' = ay + b, on résout y\' = ay (donne Ce^{ax}), puis on trouve une solution particulière de y\' = ay + b.',
    visualAid: '➕'
  },

  // === MATRICES ===
  {
    id: 'matrice-produit',
    lessonId: 'matrices-operations',
    category: 'method',
    title: 'Produit matriciel',
    content: '$(AB)_{i,j} = \\sum_k A_{i,k} B_{k,j}$',
    mnemonic: '**"Ligne par colonne"** - Pour calculer la case (i,j), on fait le produit scalaire de la ligne i de A par la colonne j de B.',
    explanation: 'Chaque élément du résultat est la somme des produits terme à terme.',
    visualAid: '⊗'
  },
  {
    id: 'matrice-inverse',
    lessonId: 'matrices-operations',
    category: 'property',
    title: 'Matrice inverse 2×2',
    content: '$\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}^{-1} = \\frac{1}{ad-bc}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}$',
    mnemonic: '**"On échange a et d, on change le signe de b et c, on divise par le déterminant"**',
    explanation: 'Le déterminant ad-bc doit être non nul pour que la matrice soit inversible.',
    visualAid: '🔄'
  },

  // === GÉOMÉTRIE DANS L'ESPACE ===
  {
    id: 'geo-produit-scalaire',
    lessonId: 'vecteurs-espace',
    category: 'formula',
    title: 'Produit scalaire',
    content: '$\\vec{u} \\cdot \\vec{v} = x_u x_v + y_u y_v + z_u z_v = ||\\vec{u}|| \\cdot ||\\vec{v}|| \\cos(\\theta)$',
    mnemonic: '**"Somme des produits des coordonnées"** ou **"Normes fois cosinus de l\'angle"**',
    explanation: 'Deux vecteurs sont orthogonaux si et seulement si leur produit scalaire est nul.',
    visualAid: '📐'
  },
  {
    id: 'geo-equation-plan',
    lessonId: 'droites-plans-espace',
    category: 'formula',
    title: 'Équation cartésienne d\'un plan',
    content: '$ax + by + cz + d = 0$ avec $\\vec{n}(a,b,c)$ vecteur normal',
    mnemonic: '**"Les coefficients x, y, z donnent directement le vecteur normal !"**',
    explanation: 'Un plan est entièrement déterminé par un point et un vecteur normal.',
    visualAid: '✈️'
  },

  // === ARITHMÉTIQUE ===
  {
    id: 'arith-euclide',
    lessonId: 'divisibilite',
    category: 'method',
    title: 'Algorithme d\'Euclide',
    content: 'PGCD(a,b) = PGCD(b, a mod b) jusqu\'à reste nul',
    mnemonic: '**"Diviser, garder le reste, recommencer"** - Le dernier reste non nul est le PGCD !',
    explanation: 'On remplace (a,b) par (b, reste de a÷b) jusqu\'à obtenir un reste nul.',
    visualAid: '🔄'
  },
  {
    id: 'arith-bezout',
    lessonId: 'divisibilite',
    category: 'theorem',
    title: 'Théorème de Bézout',
    content: 'a et b sont premiers entre eux ⟺ ∃ u,v ∈ ℤ, au + bv = 1',
    mnemonic: '**"PGCD = 1 si et seulement si combinaison linéaire = 1"**',
    explanation: 'On peut toujours écrire PGCD(a,b) = au + bv pour certains entiers u et v.',
    visualAid: '🤝'
  }
]

// Fonction pour récupérer les mnémotechniques d'une leçon
export function getMnemonicsByLesson(lessonId: string): Mnemonic[] {
  return mnemonics.filter(m => m.lessonId === lessonId)
}

// Fonction pour récupérer les mnémotechniques par catégorie
export function getMnemonicsByCategory(category: Mnemonic['category']): Mnemonic[] {
  return mnemonics.filter(m => m.category === category)
}

// Récupérer toutes les catégories de leçons qui ont des mnémotechniques
export function getLessonsWithMnemonics(): string[] {
  return Array.from(new Set(mnemonics.map(m => m.lessonId)))
}
