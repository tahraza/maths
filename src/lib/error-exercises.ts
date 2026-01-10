/**
 * Générateur d'exercices "Trouver l'erreur"
 * Présente des solutions avec des erreurs typiques que l'élève doit identifier
 */

// Types
export interface ErrorExercise {
  id: string
  category: string
  title: string
  difficulty: number
  statement: string
  wrongSolution: string
  errorDescription: string
  errorLine: number
  correctSolution: string
  hints: string[]
}

export interface ErrorGenerator {
  id: string
  category: string
  title: string
  description: string
  difficulty: number
  generate: () => ErrorExercise
}

// Utilitaires
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randNonZero(min: number, max: number): number {
  let n = 0
  while (n === 0) {
    n = randInt(min, max)
  }
  return n
}

function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ============================================
// GÉNÉRATEURS D'ERREURS PAR CATÉGORIE
// ============================================

// --- DÉRIVATION ---

const errorDerivationProduit: ErrorGenerator = {
  id: 'error-deriv-produit',
  category: 'Dérivation',
  title: 'Erreur sur la dérivée d\'un produit',
  description: 'Confusion fréquente : $(uv)\' \\neq u\' \\times v\'$',
  difficulty: 2,
  generate: () => {
    const a = randNonZero(-5, 5)
    const b = randInt(-5, 5)
    const c = randNonZero(-5, 5)

    // f(x) = (ax + b)e^(cx)
    const fStr = `f(x) = (${a === 1 ? '' : a === -1 ? '-' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)})e^{${c === 1 ? '' : c}x}`

    // Erreur typique : oublier la formule du produit, dériver chaque partie séparément
    const wrongAnswer = `f'(x) = ${a}e^{${c === 1 ? '' : c}x}`

    // Solution correcte : (uv)' = u'v + uv'
    // u = ax + b, u' = a
    // v = e^(cx), v' = ce^(cx)
    // f' = a.e^(cx) + (ax+b).ce^(cx) = e^(cx)(a + c(ax+b)) = e^(cx)(acx + a + bc)
    const acx = a * c
    const constant = a + b * c
    const correctAnswer = `f'(x) = e^{${c === 1 ? '' : c}x}(${acx === 1 ? '' : acx === -1 ? '-' : acx}x ${constant >= 0 ? '+' : '-'} ${Math.abs(constant)})`

    return {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'Dérivation',
      title: 'Trouver l\'erreur de dérivation',
      difficulty: 2,
      statement: `Soit $${fStr}$. On demande de calculer $f'(x)$.`,
      wrongSolution: `**Calcul proposé :**

1. On dérive $(${a === 1 ? '' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)})$ : on obtient $${a}$
2. On dérive $e^{${c === 1 ? '' : c}x}$ : on obtient $${c}e^{${c === 1 ? '' : c}x}$
3. Donc $${wrongAnswer}$`,
      errorDescription: `L'erreur est à la ligne 3 : l'élève a oublié d'appliquer la formule de dérivation du produit.

**Rappel :** $(uv)' = u'v + uv'$

Ici, avec $u = ${a === 1 ? '' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}$ et $v = e^{${c === 1 ? '' : c}x}$ :
- $u' = ${a}$
- $v' = ${c}e^{${c === 1 ? '' : c}x}$

Donc $f'(x) = ${a} \\cdot e^{${c === 1 ? '' : c}x} + (${a === 1 ? '' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}) \\cdot ${c}e^{${c === 1 ? '' : c}x}$`,
      errorLine: 3,
      correctSolution: correctAnswer,
      hints: [
        'Vérifie la formule utilisée pour dériver un produit de fonctions.',
        'La dérivée de $uv$ n\'est pas $u\' \\times v\'$.',
        'Applique la formule $(uv)\' = u\'v + uv\'$.'
      ]
    }
  }
}

const errorDerivationQuotient: ErrorGenerator = {
  id: 'error-deriv-quotient',
  category: 'Dérivation',
  title: 'Erreur sur la dérivée d\'un quotient',
  description: 'Confusion sur la formule $(u/v)\' = (u\'v - uv\')/v^2$',
  difficulty: 2,
  generate: () => {
    const a = randNonZero(-4, 4)
    const b = randInt(-5, 5)
    const c = randNonZero(1, 4)

    // f(x) = (ax + b) / x^c
    const fStr = `f(x) = \\frac{${a === 1 ? '' : a === -1 ? '-' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}}{x^{${c}}}`

    // Erreur : inverser u'v et uv' dans la formule
    // Correct: (u'v - uv') / v^2 = (a.x^c - (ax+b).cx^{c-1}) / x^{2c}

    return {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'Dérivation',
      title: 'Trouver l\'erreur de dérivation',
      difficulty: 2,
      statement: `Soit $${fStr}$. On demande de calculer $f'(x)$.`,
      wrongSolution: `**Calcul proposé :**

1. On pose $u = ${a === 1 ? '' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}$, donc $u' = ${a}$
2. On pose $v = x^{${c}}$, donc $v' = ${c}x^{${c-1}}$
3. On applique : $f'(x) = \\frac{uv' - u'v}{v^2} = \\frac{(${a === 1 ? '' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}) \\cdot ${c}x^{${c-1}} - ${a} \\cdot x^{${c}}}{x^{${2*c}}}$`,
      errorDescription: `L'erreur est à la ligne 3 : la formule est inversée !

**Rappel :** $\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}$ (et non $\\frac{uv' - u'v}{v^2}$)

La bonne formule donne :
$f'(x) = \\frac{${a} \\cdot x^{${c}} - (${a === 1 ? '' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}) \\cdot ${c}x^{${c-1}}}{x^{${2*c}}}$

**Astuce mnémotechnique :** "u' en premier" dans le numérateur.`,
      errorLine: 3,
      correctSolution: `$f'(x) = \\frac{${a}x^{${c}} - ${c}x^{${c-1}}(${a === 1 ? '' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)})}{x^{${2*c}}}$`,
      hints: [
        'Vérifie l\'ordre des termes dans la formule du quotient.',
        'Dans $(u/v)\'$, c\'est $u\'v$ qui vient en premier, pas $uv\'$.',
        'Rappel : $(u/v)\' = (u\'v - uv\') / v^2$'
      ]
    }
  }
}

const errorDerivationChaine: ErrorGenerator = {
  id: 'error-deriv-chaine',
  category: 'Dérivation',
  title: 'Oubli de la dérivée en chaîne',
  description: 'Oubli de dériver "l\'intérieur" dans une fonction composée',
  difficulty: 2,
  generate: () => {
    const a = randNonZero(2, 5)
    const b = randInt(-5, 5)
    const n = randInt(2, 4)

    // f(x) = (ax + b)^n
    const fStr = `f(x) = (${a === 1 ? '' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)})^{${n}}`

    // Erreur : oublier de multiplier par a (dérivée de l'intérieur)
    const wrongAnswer = `f'(x) = ${n}(${a === 1 ? '' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)})^{${n-1}}`

    // Correct : f'(x) = n.a.(ax+b)^{n-1}
    const coef = n * a
    const correctAnswer = `f'(x) = ${coef}(${a === 1 ? '' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)})^{${n-1}}`

    return {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'Dérivation',
      title: 'Trouver l\'erreur de dérivation',
      difficulty: 2,
      statement: `Soit $${fStr}$. On demande de calculer $f'(x)$.`,
      wrongSolution: `**Calcul proposé :**

1. On reconnaît la forme $u^n$ avec $u = ${a === 1 ? '' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}$
2. La dérivée de $u^n$ est $nu^{n-1}$
3. Donc $${wrongAnswer}$`,
      errorDescription: `L'erreur est à la ligne 2-3 : l'élève a oublié de multiplier par $u'$ !

**Rappel :** $(u^n)' = n \\cdot u' \\cdot u^{n-1}$ (formule de la dérivée en chaîne)

Ici, $u = ${a === 1 ? '' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}$, donc $u' = ${a}$

La bonne réponse est : $${correctAnswer}$`,
      errorLine: 2,
      correctSolution: correctAnswer,
      hints: [
        'As-tu pensé à dériver "l\'intérieur" de la fonction ?',
        'Pour une fonction composée, on ne peut pas oublier la dérivée de l\'argument.',
        'Formule : $(u^n)\' = n \\cdot u\' \\cdot u^{n-1}$'
      ]
    }
  }
}

// --- EXPONENTIELLE ET LOGARITHME ---

const errorLnProduit: ErrorGenerator = {
  id: 'error-ln-produit',
  category: 'Exponentielle',
  title: 'Confusion $\\ln(ab) = \\ln(a) + \\ln(b)$',
  description: 'Appliquer la propriété du ln dans le mauvais sens',
  difficulty: 2,
  generate: () => {
    const a = randInt(2, 5)
    const b = randInt(2, 5)

    return {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'Exponentielle',
      title: 'Trouver l\'erreur',
      difficulty: 2,
      statement: `Simplifier : $\\ln(${a}) + \\ln(${b})$`,
      wrongSolution: `**Calcul proposé :**

1. On a $\\ln(${a}) + \\ln(${b})$
2. Or $\\ln(a + b) = \\ln(a) + \\ln(b)$
3. Donc $\\ln(${a}) + \\ln(${b}) = \\ln(${a + b})$`,
      errorDescription: `L'erreur est à la ligne 2 : la formule est fausse !

**Rappel :** $\\ln(a \\times b) = \\ln(a) + \\ln(b)$ (produit, pas somme !)

La bonne réponse est :
$\\ln(${a}) + \\ln(${b}) = \\ln(${a} \\times ${b}) = \\ln(${a * b})$`,
      errorLine: 2,
      correctSolution: `$\\ln(${a * b})$`,
      hints: [
        'Vérifie la formule utilisée pour la somme de logarithmes.',
        '$\\ln(a) + \\ln(b) = \\ln(?)$ — est-ce $a+b$ ou $a \\times b$ ?',
        'Le logarithme transforme les produits en sommes.'
      ]
    }
  }
}

const errorExpSomme: ErrorGenerator = {
  id: 'error-exp-somme',
  category: 'Exponentielle',
  title: 'Confusion $e^{a+b} = e^a \\cdot e^b$',
  description: 'Erreur sur les propriétés de l\'exponentielle',
  difficulty: 2,
  generate: () => {
    const a = randInt(2, 5)
    const b = randInt(2, 5)

    return {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'Exponentielle',
      title: 'Trouver l\'erreur',
      difficulty: 2,
      statement: `Simplifier : $e^{${a}} \\cdot e^{${b}}$`,
      wrongSolution: `**Calcul proposé :**

1. On a $e^{${a}} \\cdot e^{${b}}$
2. Or $e^a \\cdot e^b = e^{a \\cdot b}$
3. Donc $e^{${a}} \\cdot e^{${b}} = e^{${a * b}}$`,
      errorDescription: `L'erreur est à la ligne 2 : la formule est fausse !

**Rappel :** $e^a \\cdot e^b = e^{a + b}$ (exposants s'additionnent !)

La bonne réponse est :
$e^{${a}} \\cdot e^{${b}} = e^{${a} + ${b}} = e^{${a + b}}$`,
      errorLine: 2,
      correctSolution: `$e^{${a + b}}$`,
      hints: [
        'Vérifie la formule utilisée pour le produit d\'exponentielles.',
        'Quand on multiplie des puissances de même base, que fait-on avec les exposants ?',
        'Rappel : $a^m \\cdot a^n = a^{m+n}$'
      ]
    }
  }
}

// --- INTÉGRALES ---

const errorIntegralePrimitiveConstante: ErrorGenerator = {
  id: 'error-integ-cste',
  category: 'Intégrales',
  title: 'Oubli de la constante d\'intégration',
  description: 'Oubli du "+ C" dans une primitive',
  difficulty: 1,
  generate: () => {
    const a = randNonZero(-5, 5)
    const n = randInt(2, 4)

    // Intégrer ax^n
    const fStr = `${a === 1 ? '' : a === -1 ? '-' : a}x^{${n}}`
    const primitiveCoef = a / (n + 1)
    const primitiveCoefStr = Number.isInteger(primitiveCoef)
      ? `${primitiveCoef}`
      : `\\frac{${a}}{${n + 1}}`

    return {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'Intégrales',
      title: 'Trouver l\'erreur',
      difficulty: 1,
      statement: `Déterminer les primitives de $f(x) = ${fStr}$ sur $\\mathbb{R}$.`,
      wrongSolution: `**Calcul proposé :**

1. On cherche $F$ telle que $F' = f$
2. Une primitive de $x^n$ est $\\frac{x^{n+1}}{n+1}$
3. Donc la primitive de $f$ est $F(x) = ${primitiveCoefStr}x^{${n + 1}}$`,
      errorDescription: `L'erreur est à la ligne 3 : il manque la constante d'intégration !

**Rappel :** Les primitives d'une fonction forment une famille de fonctions qui diffèrent d'une constante.

La bonne réponse est :
$F(x) = ${primitiveCoefStr}x^{${n + 1}} + C$ où $C \\in \\mathbb{R}$

Ou, si on demande UNE primitive : $F(x) = ${primitiveCoefStr}x^{${n + 1}}$ (on prend $C = 0$)`,
      errorLine: 3,
      correctSolution: `$F(x) = ${primitiveCoefStr}x^{${n + 1}} + C$`,
      hints: [
        'La question demande "les primitives" (pluriel).',
        'Que se passe-t-il si on dérive $F(x) + 5$ ?',
        'Les primitives diffèrent d\'une constante.'
      ]
    }
  }
}

const errorIntegraleChangementVariable: ErrorGenerator = {
  id: 'error-integ-changement',
  category: 'Intégrales',
  title: 'Oubli dans le changement de variable',
  description: 'Oubli de changer les bornes ou le $dx$',
  difficulty: 3,
  generate: () => {
    const a = randNonZero(2, 4)
    const lower = randInt(0, 2)
    const upper = lower + randInt(1, 3)

    // Intégrale de e^(ax) entre lower et upper

    return {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'Intégrales',
      title: 'Trouver l\'erreur',
      difficulty: 3,
      statement: `Calculer $\\displaystyle\\int_{${lower}}^{${upper}} e^{${a}x} \\, dx$`,
      wrongSolution: `**Calcul proposé :**

1. Une primitive de $e^{${a}x}$ est $e^{${a}x}$
2. Donc $\\displaystyle\\int_{${lower}}^{${upper}} e^{${a}x} \\, dx = \\left[e^{${a}x}\\right]_{${lower}}^{${upper}}$
3. $= e^{${a * upper}} - e^{${a * lower}}$`,
      errorDescription: `L'erreur est à la ligne 1 : la primitive de $e^{${a}x}$ n'est pas $e^{${a}x}$ !

**Rappel :** Une primitive de $e^{ax}$ est $\\frac{1}{a}e^{ax}$

(Car $(\\frac{1}{a}e^{ax})' = \\frac{1}{a} \\cdot a \\cdot e^{ax} = e^{ax}$)

La bonne réponse est :
$\\displaystyle\\int_{${lower}}^{${upper}} e^{${a}x} \\, dx = \\left[\\frac{1}{${a}}e^{${a}x}\\right]_{${lower}}^{${upper}} = \\frac{1}{${a}}(e^{${a * upper}} - e^{${a * lower}})$`,
      errorLine: 1,
      correctSolution: `$\\frac{1}{${a}}(e^{${a * upper}} - e^{${a * lower}})$`,
      hints: [
        'Vérifie la primitive de $e^{ax}$.',
        'Dérive ta primitive pour vérifier.',
        'N\'oublie pas le coefficient $1/a$ !'
      ]
    }
  }
}

// --- SUITES ---

const errorSuiteRecurrence: ErrorGenerator = {
  id: 'error-suite-recurrence',
  category: 'Suites',
  title: 'Erreur dans une récurrence',
  description: 'Erreur classique : oublier l\'initialisation ou mal formuler l\'hérédité',
  difficulty: 2,
  generate: () => {
    const n0 = randInt(0, 2)

    return {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'Suites',
      title: 'Trouver l\'erreur',
      difficulty: 2,
      statement: `Montrer par récurrence que pour tout $n \\geq ${n0}$ : $2^n \\geq n + 1$`,
      wrongSolution: `**Démonstration proposée :**

**Hérédité :** Soit $n \\geq ${n0}$. Supposons que $2^n \\geq n + 1$.
Alors $2^{n+1} = 2 \\cdot 2^n \\geq 2(n+1) = 2n + 2 \\geq n + 2 = (n+1) + 1$.
Donc la propriété est vraie au rang $n+1$.

**Conclusion :** Par récurrence, pour tout $n \\geq ${n0}$, $2^n \\geq n + 1$.`,
      errorDescription: `L'erreur est que **l'initialisation est absente** !

Une démonstration par récurrence DOIT toujours contenir :
1. **Initialisation** : vérifier que la propriété est vraie au rang initial
2. **Hérédité** : montrer que si c'est vrai au rang $n$, c'est vrai au rang $n+1$
3. **Conclusion**

Il manque ici la vérification au rang $n = ${n0}$ :
Pour $n = ${n0}$ : $2^{${n0}} = ${Math.pow(2, n0)}$ et ${n0} + 1 = ${n0 + 1}$.
Comme $${Math.pow(2, n0)} \\geq ${n0 + 1}$ ✓, la propriété est vraie au rang ${n0}.`,
      errorLine: 0,
      correctSolution: `La récurrence est incomplète : il manque l'initialisation au rang $n = ${n0}$.`,
      hints: [
        'Quelles sont les trois parties d\'une démonstration par récurrence ?',
        'Vérifie que toutes les étapes sont présentes.',
        'Une récurrence sans initialisation est comme un escalier sans première marche.'
      ]
    }
  }
}

// --- PROBABILITÉS ---

const errorProbaSomme: ErrorGenerator = {
  id: 'error-proba-somme',
  category: 'Probabilités',
  title: 'Confusion probabilité de la réunion',
  description: 'Oubli de soustraire l\'intersection dans $P(A \\cup B)$',
  difficulty: 2,
  generate: () => {
    const pA = randInt(2, 5) / 10
    const pB = randInt(2, 5) / 10
    const pAB = randInt(1, Math.min(Math.floor(pA * 10), Math.floor(pB * 10))) / 10

    return {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'Probabilités',
      title: 'Trouver l\'erreur',
      difficulty: 2,
      statement: `Soient $A$ et $B$ deux événements tels que $P(A) = ${pA}$, $P(B) = ${pB}$ et $P(A \\cap B) = ${pAB}$.
Calculer $P(A \\cup B)$.`,
      wrongSolution: `**Calcul proposé :**

1. $P(A \\cup B) = P(A) + P(B)$
2. $P(A \\cup B) = ${pA} + ${pB} = ${(pA + pB).toFixed(1)}$`,
      errorDescription: `L'erreur est à la ligne 1 : la formule est incomplète !

**Rappel :** $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$

On soustrait l'intersection car elle est comptée deux fois (une fois dans $P(A)$ et une fois dans $P(B)$).

La bonne réponse est :
$P(A \\cup B) = ${pA} + ${pB} - ${pAB} = ${(pA + pB - pAB).toFixed(1)}$`,
      errorLine: 1,
      correctSolution: `$P(A \\cup B) = ${(pA + pB - pAB).toFixed(1)}$`,
      hints: [
        'Les événements sont-ils incompatibles ?',
        'Que se passe-t-il si $A$ et $B$ ont des éléments en commun ?',
        'Rappel : $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$'
      ]
    }
  }
}

// --- NOMBRES COMPLEXES ---

const errorComplexeModule: ErrorGenerator = {
  id: 'error-complexe-module',
  category: 'Nombres complexes',
  title: 'Erreur de calcul de module',
  description: 'Oubli de la racine carrée ou erreur de signe',
  difficulty: 2,
  generate: () => {
    const a = randNonZero(-5, 5)
    const b = randNonZero(-5, 5)
    const moduleCarre = a * a + b * b

    return {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'Nombres complexes',
      title: 'Trouver l\'erreur',
      difficulty: 2,
      statement: `Calculer le module de $z = ${a} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}i$.`,
      wrongSolution: `**Calcul proposé :**

1. $|z| = \\sqrt{a^2 + b^2}$ avec $a = ${a}$ et $b = ${b}$
2. $|z| = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${moduleCarre}$`,
      errorDescription: `L'erreur est à la ligne 2 : il manque la racine carrée !

**Rappel :** Le module de $z = a + bi$ est $|z| = \\sqrt{a^2 + b^2}$

La bonne réponse est :
$|z| = \\sqrt{${a}^2 + ${b}^2} = \\sqrt{${a * a} + ${b * b}} = \\sqrt{${moduleCarre}}${Number.isInteger(Math.sqrt(moduleCarre)) ? ` = ${Math.sqrt(moduleCarre)}` : ''}$`,
      errorLine: 2,
      correctSolution: `$|z| = \\sqrt{${moduleCarre}}${Number.isInteger(Math.sqrt(moduleCarre)) ? ` = ${Math.sqrt(moduleCarre)}` : ''}$`,
      hints: [
        'N\'oublie pas un élément dans la formule du module.',
        'Le module est une distance, donc toujours positif.',
        '$|z| = \\sqrt{a^2 + b^2}$, pas $a^2 + b^2$'
      ]
    }
  }
}

// Liste de tous les générateurs d'erreurs
export const errorGenerators: ErrorGenerator[] = [
  errorDerivationProduit,
  errorDerivationQuotient,
  errorDerivationChaine,
  errorLnProduit,
  errorExpSomme,
  errorIntegralePrimitiveConstante,
  errorIntegraleChangementVariable,
  errorSuiteRecurrence,
  errorProbaSomme,
  errorComplexeModule,
]

// Générateurs par catégorie
export const errorGeneratorsByCategory = errorGenerators.reduce((acc, gen) => {
  if (!acc[gen.category]) {
    acc[gen.category] = []
  }
  acc[gen.category].push(gen)
  return acc
}, {} as Record<string, ErrorGenerator[]>)
