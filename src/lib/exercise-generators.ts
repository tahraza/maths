/**
 * Générateur d'exercices paramétrés
 * Chaque générateur produit un exercice avec des valeurs aléatoires
 * et calcule automatiquement la solution
 */

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

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

function simplifyFraction(num: number, den: number): [number, number] {
  const g = gcd(num, den)
  return [num / g, den / g]
}

function formatCoef(c: number, first = false, showOne = false): string {
  if (c === 0) return ''
  if (c === 1 && !showOne) return first ? '' : '+ '
  if (c === -1 && !showOne) return first ? '-' : '- '
  if (c > 0) return first ? `${c}` : `+ ${c}`
  return first ? `${c}` : `- ${Math.abs(c)}`
}

function formatTerm(coef: number, variable: string, exp: number, first = false): string {
  if (coef === 0) return ''

  let term = ''
  if (exp === 0) {
    term = `${Math.abs(coef)}`
  } else if (exp === 1) {
    term = Math.abs(coef) === 1 ? variable : `${Math.abs(coef)}${variable}`
  } else {
    term = Math.abs(coef) === 1 ? `${variable}^${exp}` : `${Math.abs(coef)}${variable}^${exp}`
  }

  if (first) {
    return coef < 0 ? `-${term}` : term
  }
  return coef < 0 ? ` - ${term}` : ` + ${term}`
}

// Types
export interface GeneratedExercise {
  id: string
  category: string
  title: string
  difficulty: number
  statement: string
  hints: string[]
  solution: string
  answer: string
  params: Record<string, unknown>
}

export interface ExerciseGenerator {
  id: string
  category: string
  title: string
  description: string
  difficulty: number
  chapter: string
  generate: () => GeneratedExercise
}

// ============================================
// GÉNÉRATEURS PAR CHAPITRE
// ============================================

// --- DÉRIVATION ---
const derivationPolynome: ExerciseGenerator = {
  id: 'deriv-polynome',
  category: 'Dérivation',
  title: 'Dérivée d\'un polynôme',
  description: 'Calculer la dérivée d\'un polynôme de degré 3',
  difficulty: 1,
  chapter: 'derivation',
  generate: () => {
    const a = randNonZero(-5, 5)
    const b = randInt(-8, 8)
    const c = randInt(-10, 10)
    const d = randInt(-10, 10)

    const f = `${formatTerm(a, 'x', 3, true)}${formatTerm(b, 'x', 2)}${formatTerm(c, 'x', 1)}${formatTerm(d, '', 0)}`
    const fPrime = `${formatTerm(3*a, 'x', 2, true)}${formatTerm(2*b, 'x', 1)}${formatTerm(c, '', 0)}`

    return {
      id: `deriv-poly-${Date.now()}`,
      category: 'Dérivation',
      title: 'Dérivée d\'un polynôme',
      difficulty: 1,
      statement: `Calculer la dérivée de $f(x) = ${f}$.`,
      hints: [
        'Utilise la formule $(x^n)\' = nx^{n-1}$',
        'Dérive chaque terme séparément'
      ],
      solution: `On applique la formule $(x^n)' = nx^{n-1}$ à chaque terme :\n\n` +
        `$(${formatTerm(a, 'x', 3, true)})' = ${3*a}x^2$\n\n` +
        `$(${formatTerm(b, 'x', 2, true)})' = ${2*b}x$\n\n` +
        `$(${formatTerm(c, 'x', 1, true)})' = ${c}$\n\n` +
        `$(${d})' = 0$\n\n` +
        `Donc $f'(x) = ${fPrime}$`,
      answer: `$f'(x) = ${fPrime}$`,
      params: { a, b, c, d }
    }
  }
}

const derivationQuotient: ExerciseGenerator = {
  id: 'deriv-quotient',
  category: 'Dérivation',
  title: 'Dérivée d\'un quotient',
  description: 'Calculer la dérivée de 1/u(x)',
  difficulty: 2,
  chapter: 'derivation',
  generate: () => {
    const a = randNonZero(-4, 4)
    const b = randInt(-6, 6)

    const u = `${formatTerm(a, 'x', 1, true)}${formatTerm(b, '', 0)}`

    return {
      id: `deriv-quot-${Date.now()}`,
      category: 'Dérivation',
      title: 'Dérivée d\'un quotient',
      difficulty: 2,
      statement: `Calculer la dérivée de $f(x) = \\frac{1}{${u}}$.`,
      hints: [
        'Utilise la formule $(\\frac{1}{u})\' = -\\frac{u\'}{u^2}$',
        `Ici $u(x) = ${u}$, donc $u'(x) = ${a}$`
      ],
      solution: `On pose $u(x) = ${u}$, donc $u'(x) = ${a}$.\n\n` +
        `La formule $(\\frac{1}{u})' = -\\frac{u'}{u^2}$ donne :\n\n` +
        `$f'(x) = -\\frac{${a}}{(${u})^2} = \\frac{${-a}}{(${u})^2}$`,
      answer: `$f'(x) = \\frac{${-a}}{(${u})^2}$`,
      params: { a, b }
    }
  }
}

const derivationComposee: ExerciseGenerator = {
  id: 'deriv-composee',
  category: 'Dérivation',
  title: 'Dérivée d\'une fonction composée',
  description: 'Dériver (ax + b)^n',
  difficulty: 3,
  chapter: 'derivation',
  generate: () => {
    const a = randNonZero(-4, 4)
    const b = randInt(-6, 6)
    const n = randInt(2, 5)

    const u = `${formatTerm(a, 'x', 1, true)}${formatTerm(b, '', 0)}`

    return {
      id: `deriv-comp-${Date.now()}`,
      category: 'Dérivation',
      title: 'Dérivée de fonction composée',
      difficulty: 3,
      statement: `Calculer la dérivée de $f(x) = (${u})^{${n}}$.`,
      hints: [
        'Utilise la formule $(u^n)\' = n \\cdot u\' \\cdot u^{n-1}$',
        `Ici $u(x) = ${u}$ et $n = ${n}$`
      ],
      solution: `On pose $u(x) = ${u}$, donc $u'(x) = ${a}$.\n\n` +
        `La formule $(u^n)' = n \\cdot u' \\cdot u^{n-1}$ donne :\n\n` +
        `$f'(x) = ${n} \\times ${a} \\times (${u})^{${n-1}} = ${n*a}(${u})^{${n-1}}$`,
      answer: `$f'(x) = ${n*a}(${u})^{${n-1}}$`,
      params: { a, b, n }
    }
  }
}

// --- SUITES ---
const suiteArithmetique: ExerciseGenerator = {
  id: 'suite-arith',
  category: 'Suites',
  title: 'Suite arithmétique',
  description: 'Calculer les termes et la somme d\'une suite arithmétique',
  difficulty: 1,
  chapter: 'suites-definition',
  generate: () => {
    const u0 = randInt(-10, 20)
    const r = randNonZero(-5, 8)
    const n = randInt(5, 12)

    const un = u0 + n * r
    const somme = (n + 1) * (u0 + un) / 2

    return {
      id: `suite-arith-${Date.now()}`,
      category: 'Suites',
      title: 'Suite arithmétique',
      difficulty: 1,
      statement: `Soit $(u_n)$ une suite arithmétique de premier terme $u_0 = ${u0}$ et de raison $r = ${r}$.\n\n` +
        `1. Donner l'expression de $u_n$ en fonction de $n$.\n` +
        `2. Calculer $u_{${n}}$.\n` +
        `3. Calculer $S = u_0 + u_1 + \\cdots + u_{${n}}$.`,
      hints: [
        'Formule du terme général : $u_n = u_0 + n \\times r$',
        'Formule de la somme : $S = (\\text{nombre de termes}) \\times \\frac{\\text{premier} + \\text{dernier}}{2}$'
      ],
      solution: `**1.** $u_n = u_0 + nr = ${u0} + ${r}n = ${r}n ${u0 >= 0 ? '+' : '-'} ${Math.abs(u0)}$\n\n` +
        `**2.** $u_{${n}} = ${u0} + ${n} \\times ${r} = ${u0} + ${n*r} = ${un}$\n\n` +
        `**3.** Il y a ${n+1} termes (de $u_0$ à $u_{${n}}$).\n` +
        `$S = ${n+1} \\times \\frac{${u0} + ${un}}{2} = ${n+1} \\times \\frac{${u0+un}}{2} = ${n+1} \\times ${(u0+un)/2} = ${somme}$`,
      answer: `$u_n = ${r}n ${u0 >= 0 ? '+' : '-'} ${Math.abs(u0)}$, $u_{${n}} = ${un}$, $S = ${somme}$`,
      params: { u0, r, n }
    }
  }
}

const suiteGeometrique: ExerciseGenerator = {
  id: 'suite-geo',
  category: 'Suites',
  title: 'Suite géométrique',
  description: 'Calculer les termes d\'une suite géométrique',
  difficulty: 2,
  chapter: 'suites-definition',
  generate: () => {
    const u0 = randChoice([1, 2, 3, 4, 5, 8, 10])
    const q = randChoice([2, 3, 0.5, -2])
    const n = randInt(4, 8)

    const un = u0 * Math.pow(q, n)
    const somme = q === 1 ? u0 * (n + 1) : u0 * (1 - Math.pow(q, n + 1)) / (1 - q)

    return {
      id: `suite-geo-${Date.now()}`,
      category: 'Suites',
      title: 'Suite géométrique',
      difficulty: 2,
      statement: `Soit $(u_n)$ une suite géométrique de premier terme $u_0 = ${u0}$ et de raison $q = ${q}$.\n\n` +
        `1. Donner l'expression de $u_n$ en fonction de $n$.\n` +
        `2. Calculer $u_{${n}}$.`,
      hints: [
        'Formule du terme général : $u_n = u_0 \\times q^n$',
        `Ici $u_0 = ${u0}$ et $q = ${q}$`
      ],
      solution: `**1.** $u_n = u_0 \\times q^n = ${u0} \\times ${q}^n$\n\n` +
        `**2.** $u_{${n}} = ${u0} \\times ${q}^{${n}} = ${u0} \\times ${Math.pow(q, n)} = ${un}$`,
      answer: `$u_n = ${u0} \\times ${q}^n$, $u_{${n}} = ${un}$`,
      params: { u0, q, n }
    }
  }
}

// --- LIMITES ---
const limitePolynome: ExerciseGenerator = {
  id: 'limite-poly',
  category: 'Limites',
  title: 'Limite d\'un polynôme en l\'infini',
  description: 'Déterminer la limite d\'un polynôme quand x tend vers l\'infini',
  difficulty: 1,
  chapter: 'limites-fonctions',
  generate: () => {
    const a = randNonZero(-5, 5)
    const b = randInt(-8, 8)
    const c = randInt(-10, 10)
    const direction = randChoice(['+\\infty', '-\\infty'])

    const f = `${formatTerm(a, 'x', 3, true)}${formatTerm(b, 'x', 2)}${formatTerm(c, 'x', 1)}`

    let limite: string
    if (direction === '+\\infty') {
      limite = a > 0 ? '+\\infty' : '-\\infty'
    } else {
      limite = a > 0 ? '-\\infty' : '+\\infty'
    }

    return {
      id: `limite-poly-${Date.now()}`,
      category: 'Limites',
      title: 'Limite d\'un polynôme',
      difficulty: 1,
      statement: `Calculer $\\lim_{x \\to ${direction}} (${f})$.`,
      hints: [
        'La limite d\'un polynôme en l\'infini est celle de son terme de plus haut degré',
        `Le terme dominant est $${a}x^3$`
      ],
      solution: `Le terme de plus haut degré est $${a}x^3$.\n\n` +
        `Quand $x \\to ${direction}$, $x^3 \\to ${direction === '+\\infty' ? '+\\infty' : '-\\infty'}$.\n\n` +
        `Donc $${a}x^3 \\to ${a > 0 ? (direction === '+\\infty' ? '+\\infty' : '-\\infty') : (direction === '+\\infty' ? '-\\infty' : '+\\infty')}$.\n\n` +
        `Ainsi, $\\lim_{x \\to ${direction}} (${f}) = ${limite}$`,
      answer: `$${limite}$`,
      params: { a, b, c, direction }
    }
  }
}

const limiteQuotient: ExerciseGenerator = {
  id: 'limite-quot',
  category: 'Limites',
  title: 'Limite d\'un quotient',
  description: 'Calculer une limite avec forme indéterminée',
  difficulty: 2,
  chapter: 'limites-fonctions',
  generate: () => {
    const a = randNonZero(1, 4)
    const b = randInt(-5, 5)
    const c = randNonZero(1, 4)
    const d = randInt(-5, 5)

    const num = `${formatTerm(a, 'x', 2, true)}${formatTerm(b, 'x', 1)}`
    const den = `${formatTerm(c, 'x', 2, true)}${formatTerm(d, '', 0)}`

    const [limNum, limDen] = simplifyFraction(a, c)
    const limite = limDen === 1 ? `${limNum}` : `\\frac{${limNum}}{${limDen}}`

    return {
      id: `limite-quot-${Date.now()}`,
      category: 'Limites',
      title: 'Limite d\'un quotient',
      difficulty: 2,
      statement: `Calculer $\\lim_{x \\to +\\infty} \\frac{${num}}{${den}}$.`,
      hints: [
        'Forme indéterminée $\\frac{\\infty}{\\infty}$',
        'Factorise par le terme de plus haut degré au numérateur et au dénominateur'
      ],
      solution: `On a une forme indéterminée $\\frac{\\infty}{\\infty}$.\n\n` +
        `On factorise par $x^2$ :\n\n` +
        `$\\frac{${num}}{${den}} = \\frac{x^2(${a} + \\frac{${b}}{x})}{x^2(${c} + \\frac{${d}}{x^2})} = \\frac{${a} + \\frac{${b}}{x}}{${c} + \\frac{${d}}{x^2}}$\n\n` +
        `Quand $x \\to +\\infty$, $\\frac{${b}}{x} \\to 0$ et $\\frac{${d}}{x^2} \\to 0$.\n\n` +
        `Donc la limite est $\\frac{${a}}{${c}} = ${limite}$.`,
      answer: `$${limite}$`,
      params: { a, b, c, d }
    }
  }
}

// --- INTÉGRALES ---
const integralePolynome: ExerciseGenerator = {
  id: 'integrale-poly',
  category: 'Intégrales',
  title: 'Intégrale d\'un polynôme',
  description: 'Calculer l\'intégrale d\'un polynôme sur un intervalle',
  difficulty: 2,
  chapter: 'integrales',
  generate: () => {
    const a = randNonZero(-3, 3)
    const b = randInt(-4, 4)
    const c = randInt(-5, 5)
    const borneInf = randInt(-2, 2)
    const borneSup = borneInf + randInt(1, 4)

    const f = `${formatTerm(a, 'x', 2, true)}${formatTerm(b, 'x', 1)}${formatTerm(c, '', 0)}`

    // Primitive F(x) = (a/3)x^3 + (b/2)x^2 + cx
    const evalPrimitive = (x: number) => (a/3) * Math.pow(x, 3) + (b/2) * Math.pow(x, 2) + c * x
    const resultat = evalPrimitive(borneSup) - evalPrimitive(borneInf)

    // Simplification pour affichage
    const [resNum, resDen] = simplifyFraction(Math.round(resultat * 6), 6)
    const resultatStr = resDen === 1 ? `${resNum}` : `\\frac{${resNum}}{${resDen}}`

    return {
      id: `integrale-poly-${Date.now()}`,
      category: 'Intégrales',
      title: 'Intégrale d\'un polynôme',
      difficulty: 2,
      statement: `Calculer $\\int_{${borneInf}}^{${borneSup}} (${f}) \\, dx$.`,
      hints: [
        'Une primitive de $x^n$ est $\\frac{x^{n+1}}{n+1}$',
        'Applique la formule $\\int_a^b f = [F]_a^b = F(b) - F(a)$'
      ],
      solution: `Une primitive de $f(x) = ${f}$ est :\n\n` +
        `$F(x) = \\frac{${a}}{3}x^3 + \\frac{${b}}{2}x^2 + ${c}x$\n\n` +
        `$\\int_{${borneInf}}^{${borneSup}} f(x) \\, dx = F(${borneSup}) - F(${borneInf})$\n\n` +
        `$= \\left(\\frac{${a}}{3} \\times ${Math.pow(borneSup, 3)} + \\frac{${b}}{2} \\times ${Math.pow(borneSup, 2)} + ${c} \\times ${borneSup}\\right)$\n` +
        `$- \\left(\\frac{${a}}{3} \\times ${Math.pow(borneInf, 3)} + \\frac{${b}}{2} \\times ${Math.pow(borneInf, 2)} + ${c} \\times ${borneInf}\\right)$\n\n` +
        `$= ${resultatStr}$`,
      answer: `$${resultatStr}$`,
      params: { a, b, c, borneInf, borneSup }
    }
  }
}

// --- PROBABILITÉS ---
const probabiliteBinomiale: ExerciseGenerator = {
  id: 'proba-binom',
  category: 'Probabilités',
  title: 'Loi binomiale',
  description: 'Calculer une probabilité avec la loi binomiale',
  difficulty: 2,
  chapter: 'loi-binomiale',
  generate: () => {
    const n = randInt(5, 10)
    const pNum = randChoice([1, 1, 1, 2, 3])
    const pDen = randChoice([4, 5, 6, 10])
    const p = pNum / pDen
    const k = randInt(1, Math.min(4, n))

    // Calcul de C(n,k)
    const cnk = factorial(n) / (factorial(k) * factorial(n - k))

    // P(X = k) = C(n,k) * p^k * (1-p)^(n-k)
    const proba = cnk * Math.pow(p, k) * Math.pow(1 - p, n - k)

    function factorial(num: number): number {
      if (num <= 1) return 1
      return num * factorial(num - 1)
    }

    return {
      id: `proba-binom-${Date.now()}`,
      category: 'Probabilités',
      title: 'Loi binomiale',
      difficulty: 2,
      statement: `Une variable aléatoire $X$ suit la loi binomiale $\\mathcal{B}(${n}, \\frac{${pNum}}{${pDen}})$.\n\n` +
        `Calculer $P(X = ${k})$.`,
      hints: [
        `Formule : $P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}$`,
        `Calcule d'abord $\\binom{${n}}{${k}}$`
      ],
      solution: `$P(X = ${k}) = \\binom{${n}}{${k}} \\times \\left(\\frac{${pNum}}{${pDen}}\\right)^{${k}} \\times \\left(\\frac{${pDen - pNum}}{${pDen}}\\right)^{${n-k}}$\n\n` +
        `$\\binom{${n}}{${k}} = \\frac{${n}!}{${k}! \\times ${n-k}!} = ${cnk}$\n\n` +
        `$P(X = ${k}) = ${cnk} \\times \\frac{${Math.pow(pNum, k)}}{${Math.pow(pDen, k)}} \\times \\frac{${Math.pow(pDen - pNum, n-k)}}{${Math.pow(pDen, n-k)}}$\n\n` +
        `$P(X = ${k}) \\approx ${proba.toFixed(4)}$`,
      answer: `$P(X = ${k}) \\approx ${proba.toFixed(4)}$`,
      params: { n, p, k, pNum, pDen }
    }
  }
}

const probabiliteEsperance: ExerciseGenerator = {
  id: 'proba-esperance',
  category: 'Probabilités',
  title: 'Espérance et variance',
  description: 'Calculer l\'espérance et la variance d\'une loi binomiale',
  difficulty: 1,
  chapter: 'loi-binomiale',
  generate: () => {
    const n = randInt(10, 50)
    const pNum = randChoice([1, 2, 3, 4])
    const pDen = randChoice([5, 10])
    const p = pNum / pDen

    const esperance = n * p
    const variance = n * p * (1 - p)
    const ecartType = Math.sqrt(variance)

    return {
      id: `proba-esp-${Date.now()}`,
      category: 'Probabilités',
      title: 'Espérance et variance',
      difficulty: 1,
      statement: `$X$ suit la loi $\\mathcal{B}(${n}, ${p})$.\n\n` +
        `Calculer l'espérance $E(X)$, la variance $V(X)$ et l'écart-type $\\sigma(X)$.`,
      hints: [
        '$E(X) = np$',
        '$V(X) = np(1-p)$',
        '$\\sigma(X) = \\sqrt{V(X)}$'
      ],
      solution: `$E(X) = np = ${n} \\times ${p} = ${esperance}$\n\n` +
        `$V(X) = np(1-p) = ${n} \\times ${p} \\times ${1-p} = ${variance}$\n\n` +
        `$\\sigma(X) = \\sqrt{${variance}} \\approx ${ecartType.toFixed(2)}$`,
      answer: `$E(X) = ${esperance}$, $V(X) = ${variance}$, $\\sigma(X) \\approx ${ecartType.toFixed(2)}$`,
      params: { n, p }
    }
  }
}

// --- COMBINATOIRE ---
const combinatoireCoeffBinomial: ExerciseGenerator = {
  id: 'combi-coeff',
  category: 'Combinatoire',
  title: 'Coefficient binomial',
  description: 'Calculer un coefficient binomial',
  difficulty: 1,
  chapter: 'combinatoire',
  generate: () => {
    const n = randInt(6, 12)
    const k = randInt(2, Math.min(5, n - 1))

    let cnk = 1
    for (let i = 0; i < k; i++) {
      cnk = cnk * (n - i) / (i + 1)
    }
    cnk = Math.round(cnk)

    // Numérateur et dénominateur pour l'affichage
    let numParts: number[] = []
    for (let i = n; i > n - k; i--) {
      numParts.push(i)
    }

    return {
      id: `combi-coeff-${Date.now()}`,
      category: 'Combinatoire',
      title: 'Coefficient binomial',
      difficulty: 1,
      statement: `Calculer $\\binom{${n}}{${k}}$.`,
      hints: [
        `$\\binom{n}{k} = \\frac{n!}{k!(n-k)!}$`,
        `On peut simplifier : $\\binom{n}{k} = \\frac{n \\times (n-1) \\times \\cdots \\times (n-k+1)}{k!}$`
      ],
      solution: `$\\binom{${n}}{${k}} = \\frac{${n}!}{${k}! \\times ${n-k}!}$\n\n` +
        `$= \\frac{${numParts.join(' \\times ')}}{${k}!}$\n\n` +
        `$= \\frac{${numParts.reduce((a, b) => a * b, 1)}}{${factorial(k)}}$\n\n` +
        `$= ${cnk}$`,
      answer: `$\\binom{${n}}{${k}} = ${cnk}$`,
      params: { n, k }
    }

    function factorial(num: number): number {
      if (num <= 1) return 1
      return num * factorial(num - 1)
    }
  }
}

const combinatoireDenombrement: ExerciseGenerator = {
  id: 'combi-denom',
  category: 'Combinatoire',
  title: 'Problème de dénombrement',
  description: 'Compter le nombre de façons de choisir des éléments',
  difficulty: 2,
  chapter: 'combinatoire',
  generate: () => {
    const total = randInt(8, 15)
    const aChoisir = randInt(3, 6)

    let cnk = 1
    for (let i = 0; i < aChoisir; i++) {
      cnk = cnk * (total - i) / (i + 1)
    }
    cnk = Math.round(cnk)

    const contextes = [
      { objet: 'personnes', ensemble: 'un groupe', action: 'former une équipe de' },
      { objet: 'cartes', ensemble: 'un jeu de 32 cartes', action: 'tirer une main de' },
      { objet: 'bonbons', ensemble: 'un sachet', action: 'choisir' },
      { objet: 'livres', ensemble: 'une bibliothèque', action: 'sélectionner' }
    ]
    const ctx = randChoice(contextes)

    return {
      id: `combi-denom-${Date.now()}`,
      category: 'Combinatoire',
      title: 'Dénombrement',
      difficulty: 2,
      statement: `Dans ${ctx.ensemble} de ${total} ${ctx.objet}, de combien de façons peut-on ${ctx.action} ${aChoisir} ${ctx.objet} ?`,
      hints: [
        'L\'ordre ne compte pas (c\'est un sous-ensemble)',
        `On cherche le nombre de combinaisons de ${aChoisir} parmi ${total}`
      ],
      solution: `L'ordre de sélection n'a pas d'importance, donc on cherche le nombre de combinaisons.\n\n` +
        `$\\binom{${total}}{${aChoisir}} = \\frac{${total}!}{${aChoisir}! \\times ${total - aChoisir}!} = ${cnk}$\n\n` +
        `Il y a **${cnk}** façons de ${ctx.action} ${aChoisir} ${ctx.objet}.`,
      answer: `${cnk} façons`,
      params: { total, aChoisir }
    }
  }
}

// --- ÉQUATIONS DIFFÉRENTIELLES ---
const equaDiffPremierOrdre: ExerciseGenerator = {
  id: 'equadiff-1',
  category: 'Équations différentielles',
  title: 'Équation y\' = ay',
  description: 'Résoudre une équation différentielle du premier ordre',
  difficulty: 2,
  chapter: 'equations-differentielles',
  generate: () => {
    const a = randNonZero(-5, 5)
    const y0 = randNonZero(-6, 6)

    return {
      id: `equadiff1-${Date.now()}`,
      category: 'Équations différentielles',
      title: 'Équation y\' = ay',
      difficulty: 2,
      statement: `Résoudre l'équation différentielle $y' = ${a}y$ avec la condition initiale $y(0) = ${y0}$.`,
      hints: [
        `Les solutions de $y' = ay$ sont de la forme $y = Ce^{ax}$`,
        'Utilise la condition initiale pour trouver $C$'
      ],
      solution: `Les solutions de $y' = ${a}y$ sont $y(x) = Ce^{${a}x}$ où $C \\in \\mathbb{R}$.\n\n` +
        `Condition initiale : $y(0) = Ce^0 = C = ${y0}$.\n\n` +
        `Donc $C = ${y0}$.\n\n` +
        `La solution est $y(x) = ${y0}e^{${a}x}$.`,
      answer: `$y(x) = ${y0}e^{${a}x}$`,
      params: { a, y0 }
    }
  }
}

const equaDiffAvecSecondMembre: ExerciseGenerator = {
  id: 'equadiff-2',
  category: 'Équations différentielles',
  title: 'Équation y\' = ay + b',
  description: 'Résoudre avec second membre constant',
  difficulty: 3,
  chapter: 'equations-differentielles',
  generate: () => {
    const a = randNonZero(-4, 4)
    const b = randNonZero(-10, 10)
    const y0 = randInt(-5, 5)

    const solPart = -b / a
    const C = y0 - solPart

    return {
      id: `equadiff2-${Date.now()}`,
      category: 'Équations différentielles',
      title: 'Équation y\' = ay + b',
      difficulty: 3,
      statement: `Résoudre $y' = ${a}y ${b >= 0 ? '+' : '-'} ${Math.abs(b)}$ avec $y(0) = ${y0}$.`,
      hints: [
        `Solution particulière constante : $y_0 = -\\frac{b}{a}$`,
        `Solution générale : $y = Ce^{ax} + y_0$`
      ],
      solution: `**Solution particulière constante :**\n` +
        `Si $y$ est constante, $y' = 0$, donc $0 = ${a}y + ${b}$, soit $y = ${solPart}$.\n\n` +
        `**Solution générale :**\n` +
        `$y(x) = Ce^{${a}x} + ${solPart}$\n\n` +
        `**Condition initiale :**\n` +
        `$y(0) = C + ${solPart} = ${y0}$, donc $C = ${C}$.\n\n` +
        `**Solution :** $y(x) = ${C}e^{${a}x} ${solPart >= 0 ? '+' : '-'} ${Math.abs(solPart)}$`,
      answer: `$y(x) = ${C}e^{${a}x} ${solPart >= 0 ? '+' : '-'} ${Math.abs(solPart)}$`,
      params: { a, b, y0 }
    }
  }
}

// --- COMPLEXES ---
const complexeModule: ExerciseGenerator = {
  id: 'complexe-module',
  category: 'Nombres complexes',
  title: 'Module et argument',
  description: 'Calculer le module et l\'argument d\'un nombre complexe',
  difficulty: 2,
  chapter: 'complexes-introduction',
  generate: () => {
    const a = randInt(-5, 5)
    const b = randNonZero(-5, 5)

    const module = Math.sqrt(a * a + b * b)
    const moduleExact = Number.isInteger(module) ? `${module}` : `\\sqrt{${a*a + b*b}}`

    return {
      id: `complexe-mod-${Date.now()}`,
      category: 'Nombres complexes',
      title: 'Module et argument',
      difficulty: 2,
      statement: `Soit $z = ${a} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}i$.\n\nCalculer le module $|z|$.`,
      hints: [
        '$|z| = \\sqrt{a^2 + b^2}$ pour $z = a + bi$',
        `Ici $a = ${a}$ et $b = ${b}$`
      ],
      solution: `$|z| = \\sqrt{${a}^2 + ${b}^2} = \\sqrt{${a*a} + ${b*b}} = \\sqrt{${a*a + b*b}}$\n\n` +
        (Number.isInteger(module) ? `$|z| = ${module}$` : `$|z| = \\sqrt{${a*a + b*b}} \\approx ${module.toFixed(2)}$`),
      answer: `$|z| = ${moduleExact}$`,
      params: { a, b }
    }
  }
}

const complexeOperations: ExerciseGenerator = {
  id: 'complexe-ops',
  category: 'Nombres complexes',
  title: 'Opérations sur les complexes',
  description: 'Effectuer des opérations avec des nombres complexes',
  difficulty: 1,
  chapter: 'complexes-introduction',
  generate: () => {
    const a1 = randInt(-4, 4)
    const b1 = randNonZero(-4, 4)
    const a2 = randInt(-4, 4)
    const b2 = randNonZero(-4, 4)

    const sumA = a1 + a2
    const sumB = b1 + b2
    const prodA = a1 * a2 - b1 * b2
    const prodB = a1 * b2 + a2 * b1

    const z1 = `${a1} ${b1 >= 0 ? '+' : '-'} ${Math.abs(b1)}i`
    const z2 = `${a2} ${b2 >= 0 ? '+' : '-'} ${Math.abs(b2)}i`

    return {
      id: `complexe-ops-${Date.now()}`,
      category: 'Nombres complexes',
      title: 'Opérations',
      difficulty: 1,
      statement: `Soit $z_1 = ${z1}$ et $z_2 = ${z2}$.\n\nCalculer $z_1 + z_2$ et $z_1 \\times z_2$.`,
      hints: [
        'Pour la somme, additionne les parties réelles et imaginaires séparément',
        'Pour le produit, développe $(a_1 + b_1 i)(a_2 + b_2 i)$ et utilise $i^2 = -1$'
      ],
      solution: `**Somme :**\n` +
        `$z_1 + z_2 = (${a1} + ${a2}) + (${b1} + ${b2})i = ${sumA} ${sumB >= 0 ? '+' : '-'} ${Math.abs(sumB)}i$\n\n` +
        `**Produit :**\n` +
        `$z_1 \\times z_2 = (${a1})(${a2}) + (${a1})(${b2}i) + (${b1}i)(${a2}) + (${b1}i)(${b2}i)$\n` +
        `$= ${a1 * a2} + ${a1 * b2}i + ${b1 * a2}i + ${b1 * b2}i^2$\n` +
        `$= ${a1 * a2} + ${a1 * b2 + b1 * a2}i - ${b1 * b2}$\n` +
        `$= ${prodA} ${prodB >= 0 ? '+' : '-'} ${Math.abs(prodB)}i$`,
      answer: `$z_1 + z_2 = ${sumA} ${sumB >= 0 ? '+' : '-'} ${Math.abs(sumB)}i$, $z_1 z_2 = ${prodA} ${prodB >= 0 ? '+' : '-'} ${Math.abs(prodB)}i$`,
      params: { a1, b1, a2, b2 }
    }
  }
}

// --- EXPONENTIELLE ET LOGARITHME ---
const exponentielleEquation: ExerciseGenerator = {
  id: 'exp-equation',
  category: 'Exponentielle',
  title: 'Équation avec exponentielle',
  description: 'Résoudre une équation exponentielle',
  difficulty: 2,
  chapter: 'exponentielle',
  generate: () => {
    const a = randNonZero(1, 4)
    const b = randInt(-3, 3)
    const k = randChoice([1, 2, 3, 4, 5])

    // e^(ax+b) = k => ax + b = ln(k) => x = (ln(k) - b) / a
    const solution = (Math.log(k) - b) / a

    return {
      id: `exp-eq-${Date.now()}`,
      category: 'Exponentielle',
      title: 'Équation exponentielle',
      difficulty: 2,
      statement: `Résoudre $e^{${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}} = ${k}$.`,
      hints: [
        'Applique le logarithme népérien des deux côtés',
        '$\\ln(e^X) = X$'
      ],
      solution: `$e^{${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}} = ${k}$\n\n` +
        `En passant au logarithme :\n` +
        `$${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)} = \\ln(${k})$\n\n` +
        `$${a}x = \\ln(${k}) ${b >= 0 ? '-' : '+'} ${Math.abs(b)}$\n\n` +
        `$x = \\frac{\\ln(${k}) ${b >= 0 ? '-' : '+'} ${Math.abs(b)}}{${a}}$\n\n` +
        `$x \\approx ${solution.toFixed(3)}$`,
      answer: `$x = \\frac{\\ln(${k}) ${b >= 0 ? '-' : '+'} ${Math.abs(b)}}{${a}} \\approx ${solution.toFixed(3)}$`,
      params: { a, b, k }
    }
  }
}

const logarithmeEquation: ExerciseGenerator = {
  id: 'ln-equation',
  category: 'Logarithme',
  title: 'Équation avec logarithme',
  description: 'Résoudre une équation logarithmique',
  difficulty: 2,
  chapter: 'logarithme',
  generate: () => {
    const a = randNonZero(1, 3)
    const b = randInt(1, 5)
    const k = randInt(1, 4)

    // ln(ax + b) = k => ax + b = e^k => x = (e^k - b) / a
    const solution = (Math.exp(k) - b) / a

    return {
      id: `ln-eq-${Date.now()}`,
      category: 'Logarithme',
      title: 'Équation logarithmique',
      difficulty: 2,
      statement: `Résoudre $\\ln(${a}x + ${b}) = ${k}$.`,
      hints: [
        'Passe à l\'exponentielle : $\\ln(X) = k \\Leftrightarrow X = e^k$',
        'Vérifie que la solution est dans le domaine de définition'
      ],
      solution: `$\\ln(${a}x + ${b}) = ${k}$\n\n` +
        `En passant à l'exponentielle :\n` +
        `$${a}x + ${b} = e^{${k}}$\n\n` +
        `$${a}x = e^{${k}} - ${b}$\n\n` +
        `$x = \\frac{e^{${k}} - ${b}}{${a}}$\n\n` +
        `$x \\approx ${solution.toFixed(3)}$\n\n` +
        `**Vérification** : $${a} \\times ${solution.toFixed(3)} + ${b} \\approx ${a * solution + b} > 0$ ✓`,
      answer: `$x = \\frac{e^{${k}} - ${b}}{${a}} \\approx ${solution.toFixed(3)}$`,
      params: { a, b, k }
    }
  }
}

// --- TRIGONOMÉTRIE ---
const trigoEquation: ExerciseGenerator = {
  id: 'trigo-eq',
  category: 'Trigonométrie',
  title: 'Équation trigonométrique',
  description: 'Résoudre une équation avec cos ou sin',
  difficulty: 2,
  chapter: 'trigonometrie-bases',
  generate: () => {
    const valeurs = [
      { val: '0', cos: '1', sin: '0' },
      { val: '\\frac{\\pi}{6}', cos: '\\frac{\\sqrt{3}}{2}', sin: '\\frac{1}{2}' },
      { val: '\\frac{\\pi}{4}', cos: '\\frac{\\sqrt{2}}{2}', sin: '\\frac{\\sqrt{2}}{2}' },
      { val: '\\frac{\\pi}{3}', cos: '\\frac{1}{2}', sin: '\\frac{\\sqrt{3}}{2}' },
      { val: '\\frac{\\pi}{2}', cos: '0', sin: '1' },
    ]

    const v = randChoice(valeurs)
    const func = randChoice(['cos', 'sin'])
    const target = func === 'cos' ? v.cos : v.sin

    return {
      id: `trigo-eq-${Date.now()}`,
      category: 'Trigonométrie',
      title: 'Équation trigonométrique',
      difficulty: 2,
      statement: `Résoudre sur $[0, 2\\pi]$ : $\\${func}(x) = ${target}$.`,
      hints: [
        `Trouve les angles dont le ${func === 'cos' ? 'cosinus' : 'sinus'} vaut ${target}`,
        'Pense à la symétrie du cercle trigonométrique'
      ],
      solution: `On cherche $x \\in [0, 2\\pi]$ tel que $\\${func}(x) = ${target}$.\n\n` +
        `On sait que $\\${func}(${v.val}) = ${target}$.\n\n` +
        (func === 'cos'
          ? `Par symétrie du cosinus : $\\cos(-x) = \\cos(x)$, donc $\\cos(2\\pi - ${v.val}) = ${target}$.\n\n` +
            `**Solutions** : $x = ${v.val}$ ou $x = 2\\pi - ${v.val}$`
          : `Par symétrie du sinus : $\\sin(\\pi - x) = \\sin(x)$, donc $\\sin(\\pi - ${v.val}) = ${target}$.\n\n` +
            `**Solutions** : $x = ${v.val}$ ou $x = \\pi - ${v.val}$`
        ),
      answer: func === 'cos'
        ? `$x = ${v.val}$ ou $x = 2\\pi - ${v.val}$`
        : `$x = ${v.val}$ ou $x = \\pi - ${v.val}$`,
      params: { func, target }
    }
  }
}

// --- PRIMITIVES ---
const primitivePuissance: ExerciseGenerator = {
  id: 'primitive-puissance',
  category: 'Primitives',
  title: 'Primitive d\'une puissance',
  description: 'Trouver la primitive de x^n',
  difficulty: 1,
  chapter: 'primitives',
  generate: () => {
    const n = randChoice([2, 3, 4, 5, -1, -2, -3])
    const a = randNonZero(-4, 4)

    let f: string
    let F: string
    let solution: string

    if (n === -1) {
      f = `\\frac{${a}}{x}`
      F = `${a}\\ln|x|`
      solution = `La primitive de $\\frac{1}{x}$ est $\\ln|x|$.\n\nDonc une primitive de $\\frac{${a}}{x}$ est $${F} + C$.`
    } else if (n < 0) {
      f = `\\frac{${a}}{x^{${-n}}}`
      const newExp = n + 1
      const coef = a / (n + 1)
      const [num, den] = simplifyFraction(a, n + 1)
      F = newExp === -1 ? `\\frac{${num}}{${den}x}` : `\\frac{${num}}{${den}}x^{${newExp}}`
      solution = `On écrit $\\frac{${a}}{x^{${-n}}} = ${a}x^{${n}}$.\n\nUne primitive de $x^n$ est $\\frac{x^{n+1}}{n+1}$ pour $n \\neq -1$.\n\nDonc une primitive est $\\frac{${a}x^{${n+1}}}{${n+1}} = ${F} + C$.`
    } else {
      f = `${a}x^{${n}}`
      const [num, den] = simplifyFraction(a, n + 1)
      F = den === 1 ? `${num}x^{${n+1}}` : `\\frac{${num}}{${den}}x^{${n+1}}`
      solution = `Une primitive de $x^n$ est $\\frac{x^{n+1}}{n+1}$.\n\nDonc une primitive de $${f}$ est $\\frac{${a}x^{${n+1}}}{${n+1}} = ${F} + C$.`
    }

    return {
      id: `prim-puis-${Date.now()}`,
      category: 'Primitives',
      title: 'Primitive d\'une puissance',
      difficulty: 1,
      statement: `Déterminer une primitive de $f(x) = ${f}$.`,
      hints: [
        'Une primitive de $x^n$ est $\\frac{x^{n+1}}{n+1}$ pour $n \\neq -1$',
        'Une primitive de $\\frac{1}{x}$ est $\\ln|x|$'
      ],
      solution,
      answer: `$F(x) = ${F} + C$`,
      params: { n, a }
    }
  }
}

const primitiveExponentielle: ExerciseGenerator = {
  id: 'primitive-exp',
  category: 'Primitives',
  title: 'Primitive avec exponentielle',
  description: 'Trouver la primitive de e^(ax+b)',
  difficulty: 2,
  chapter: 'primitives',
  generate: () => {
    const a = randNonZero(-4, 4)
    const b = randInt(-5, 5)
    const k = randNonZero(-3, 3)

    const expo = b === 0 ? `${a}x` : `${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`
    const f = k === 1 ? `e^{${expo}}` : `${k}e^{${expo}}`

    const [num, den] = simplifyFraction(k, a)
    const coefStr = den === 1 ? `${num}` : `\\frac{${num}}{${den}}`
    const F = `${coefStr}e^{${expo}}`

    return {
      id: `prim-exp-${Date.now()}`,
      category: 'Primitives',
      title: 'Primitive exponentielle',
      difficulty: 2,
      statement: `Déterminer une primitive de $f(x) = ${f}$.`,
      hints: [
        'Une primitive de $e^{ax+b}$ est $\\frac{1}{a}e^{ax+b}$',
        `Ici $a = ${a}$`
      ],
      solution: `Une primitive de $e^{ax+b}$ est $\\frac{1}{a}e^{ax+b}$.\n\n` +
        `Ici, on a $e^{${expo}}$ avec $a = ${a}$.\n\n` +
        `Donc une primitive de $e^{${expo}}$ est $\\frac{1}{${a}}e^{${expo}}$.\n\n` +
        `Pour $f(x) = ${f}$, une primitive est $${k} \\times \\frac{1}{${a}}e^{${expo}} = ${F} + C$.`,
      answer: `$F(x) = ${F} + C$`,
      params: { a, b, k }
    }
  }
}

// --- CONTINUITÉ ---
const continuitePoint: ExerciseGenerator = {
  id: 'continuite-point',
  category: 'Continuité',
  title: 'Continuité en un point',
  description: 'Étudier la continuité d\'une fonction en un point',
  difficulty: 2,
  chapter: 'continuite',
  generate: () => {
    const a = randNonZero(-3, 3)
    const b = randInt(-5, 5)
    const x0 = randInt(-2, 2)

    // f(x) = (ax+b)/(x-x0) pour x ≠ x0, f(x0) = k
    // Limite en x0 = ∞ donc discontinuité
    const type = randChoice(['discontinue', 'prolongeable'])

    if (type === 'discontinue') {
      const c = randNonZero(-4, 4)
      const fDef = `f(x) = \\begin{cases} \\frac{${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}}{x ${x0 >= 0 ? '-' : '+'} ${Math.abs(x0)}} & \\text{si } x \\neq ${x0} \\\\ ${c} & \\text{si } x = ${x0} \\end{cases}`

      return {
        id: `cont-pt-${Date.now()}`,
        category: 'Continuité',
        title: 'Continuité en un point',
        difficulty: 2,
        statement: `Soit $${fDef}$.\n\nLa fonction $f$ est-elle continue en $x_0 = ${x0}$ ?`,
        hints: [
          'Une fonction est continue en $x_0$ si $\\lim_{x \\to x_0} f(x) = f(x_0)$',
          'Calcule la limite en $x_0$'
        ],
        solution: `Calculons $\\lim_{x \\to ${x0}} f(x)$.\n\n` +
          `Quand $x \\to ${x0}$, le numérateur $\\to ${a * x0 + b}$ et le dénominateur $\\to 0$.\n\n` +
          `Donc $\\lim_{x \\to ${x0}} f(x) = ${a * x0 + b !== 0 ? '\\pm\\infty' : '\\text{forme indéterminée}'}$.\n\n` +
          `Or $f(${x0}) = ${c}$ est fini.\n\n` +
          `Donc **$f$ n'est pas continue en $${x0}$** (la limite n'existe pas ou est infinie).`,
        answer: `$f$ n'est pas continue en $${x0}$`,
        params: { a, b, x0, c }
      }
    } else {
      // Cas prolongeable : f(x) = (x² - x0²)/(x - x0) = x + x0 pour x ≠ x0
      const fDef = `f(x) = \\frac{x^2 - ${x0*x0}}{x ${x0 >= 0 ? '-' : '+'} ${Math.abs(x0)}} \\text{ pour } x \\neq ${x0}`

      return {
        id: `cont-pt-${Date.now()}`,
        category: 'Continuité',
        title: 'Prolongement par continuité',
        difficulty: 2,
        statement: `Soit $${fDef}$.\n\nPeut-on prolonger $f$ par continuité en $${x0}$ ?`,
        hints: [
          'Factorise le numérateur avec $a^2 - b^2 = (a-b)(a+b)$',
          'Simplifie pour lever l\'indétermination'
        ],
        solution: `On factorise : $x^2 - ${x0*x0} = (x - ${x0})(x + ${x0})$.\n\n` +
          `Pour $x \\neq ${x0}$ :\n` +
          `$f(x) = \\frac{(x - ${x0})(x + ${x0})}{x - ${x0}} = x + ${x0}$\n\n` +
          `Donc $\\lim_{x \\to ${x0}} f(x) = ${x0} + ${x0} = ${2*x0}$.\n\n` +
          `On peut prolonger $f$ par continuité en posant $f(${x0}) = ${2*x0}$.`,
        answer: `Oui, $f(${x0}) = ${2*x0}$`,
        params: { a: 1, b: 0, x0, c: 0 }
      }
    }
  }
}

const continuiteIntervalle: ExerciseGenerator = {
  id: 'continuite-tvi',
  category: 'Continuité',
  title: 'Théorème des valeurs intermédiaires',
  description: 'Appliquer le TVI pour montrer l\'existence d\'une solution',
  difficulty: 3,
  chapter: 'continuite',
  generate: () => {
    const a = randNonZero(1, 3)
    const b = randInt(-4, 4)
    const c = randInt(-5, 5)

    // f(x) = ax³ + bx + c, chercher une racine
    const f = `${formatTerm(a, 'x', 3, true)}${formatTerm(b, 'x', 1)}${formatTerm(c, '', 0)}`

    const evalF = (x: number) => a * x * x * x + b * x + c

    // Trouver un intervalle où f change de signe
    let x1 = -3, x2 = 3
    while (evalF(x1) * evalF(x2) > 0 && x1 > -10) {
      x1--
      x2++
    }

    const f1 = evalF(x1)
    const f2 = evalF(x2)

    return {
      id: `cont-tvi-${Date.now()}`,
      category: 'Continuité',
      title: 'Théorème des valeurs intermédiaires',
      difficulty: 3,
      statement: `Soit $f(x) = ${f}$.\n\nMontrer que l'équation $f(x) = 0$ admet au moins une solution sur $[${x1}, ${x2}]$.`,
      hints: [
        '$f$ est une fonction polynomiale, donc continue sur $\\mathbb{R}$',
        'Calcule $f(${x1})$ et $f(${x2})$ puis applique le TVI'
      ],
      solution: `$f$ est une fonction polynomiale, donc **continue** sur $\\mathbb{R}$, en particulier sur $[${x1}, ${x2}]$.\n\n` +
        `Calculons :\n` +
        `$f(${x1}) = ${a} \\times (${x1})^3 + ${b} \\times (${x1}) + ${c} = ${f1}$\n` +
        `$f(${x2}) = ${a} \\times ${x2}^3 + ${b} \\times ${x2} + ${c} = ${f2}$\n\n` +
        `On a $f(${x1}) = ${f1} ${f1 < 0 ? '<' : '>'} 0$ et $f(${x2}) = ${f2} ${f2 < 0 ? '<' : '>'} 0$.\n\n` +
        `$0$ est compris entre $f(${x1})$ et $f(${x2})$.\n\n` +
        `D'après le **théorème des valeurs intermédiaires**, il existe $c \\in ]${x1}, ${x2}[$ tel que $f(c) = 0$.`,
      answer: `Le TVI garantit l'existence d'une solution dans $]${x1}, ${x2}[$`,
      params: { a, b, c, x1, x2 }
    }
  }
}

// --- CONVEXITÉ ---
const convexiteEtude: ExerciseGenerator = {
  id: 'convexite-etude',
  category: 'Convexité',
  title: 'Étude de convexité',
  description: 'Déterminer les intervalles de convexité et concavité',
  difficulty: 2,
  chapter: 'convexite',
  generate: () => {
    const a = randNonZero(-3, 3)
    const b = randInt(-4, 4)
    const c = randInt(-5, 5)
    const d = randInt(-5, 5)

    // f(x) = ax³ + bx² + cx + d
    // f'(x) = 3ax² + 2bx + c
    // f''(x) = 6ax + 2b
    // f''(x) = 0 <=> x = -b/(3a)

    const f = `${formatTerm(a, 'x', 3, true)}${formatTerm(b, 'x', 2)}${formatTerm(c, 'x', 1)}${formatTerm(d, '', 0)}`
    const fPrime = `${formatTerm(3*a, 'x', 2, true)}${formatTerm(2*b, 'x', 1)}${formatTerm(c, '', 0)}`
    const fSeconde = `${formatTerm(6*a, 'x', 1, true)}${formatTerm(2*b, '', 0)}`

    const [inflexNum, inflexDen] = simplifyFraction(-b, 3*a)
    const inflexStr = inflexDen === 1 ? `${inflexNum}` : `\\frac{${inflexNum}}{${inflexDen}}`
    const inflexVal = -b / (3*a)

    const convexe = a > 0 ? `]${inflexStr}, +\\infty[` : `]-\\infty, ${inflexStr}[`
    const concave = a > 0 ? `]-\\infty, ${inflexStr}[` : `]${inflexStr}, +\\infty[`

    return {
      id: `conv-etude-${Date.now()}`,
      category: 'Convexité',
      title: 'Étude de convexité',
      difficulty: 2,
      statement: `Soit $f(x) = ${f}$.\n\nDéterminer les intervalles de convexité et de concavité de $f$.`,
      hints: [
        'Calcule $f\'\'(x)$',
        '$f$ convexe $\\Leftrightarrow f\'\'(x) \\geq 0$',
        '$f$ concave $\\Leftrightarrow f\'\'(x) \\leq 0$'
      ],
      solution: `$f'(x) = ${fPrime}$\n\n` +
        `$f''(x) = ${fSeconde}$\n\n` +
        `$f''(x) = 0 \\Leftrightarrow ${6*a}x + ${2*b} = 0 \\Leftrightarrow x = ${inflexStr}$\n\n` +
        `**Signe de $f''(x)$** :\n` +
        `- Si $x < ${inflexStr}$ : $f''(x) ${a > 0 ? '<' : '>'} 0$\n` +
        `- Si $x > ${inflexStr}$ : $f''(x) ${a > 0 ? '>' : '<'} 0$\n\n` +
        `**Conclusion** :\n` +
        `- $f$ est **convexe** sur $${convexe}$\n` +
        `- $f$ est **concave** sur $${concave}$\n` +
        `- Point d'inflexion en $x = ${inflexStr}$`,
      answer: `Convexe sur $${convexe}$, concave sur $${concave}$`,
      params: { a, b, c, d }
    }
  }
}

const convexiteInegalite: ExerciseGenerator = {
  id: 'convexite-ineg',
  category: 'Convexité',
  title: 'Inégalité par convexité',
  description: 'Démontrer une inégalité grâce à la convexité',
  difficulty: 3,
  chapter: 'convexite',
  generate: () => {
    const type = randChoice(['exp', 'ln'])

    if (type === 'exp') {
      const a = randChoice([1, 2])
      const b = randChoice([1, 2])
      const sum = a + b

      return {
        id: `conv-ineg-${Date.now()}`,
        category: 'Convexité',
        title: 'Inégalité de convexité',
        difficulty: 3,
        statement: `Montrer que pour tous réels $x, y$ :\n$$\\frac{e^x + e^y}{2} \\geq e^{\\frac{x+y}{2}}$$`,
        hints: [
          'La fonction exponentielle est convexe',
          'Utilise l\'inégalité de Jensen/convexité'
        ],
        solution: `La fonction $f(t) = e^t$ est convexe sur $\\mathbb{R}$ car $f''(t) = e^t > 0$.\n\n` +
          `Par définition de la convexité, pour $\\lambda = \\frac{1}{2}$ :\n` +
          `$$f\\left(\\frac{x+y}{2}\\right) \\leq \\frac{f(x) + f(y)}{2}$$\n\n` +
          `C'est-à-dire :\n` +
          `$$e^{\\frac{x+y}{2}} \\leq \\frac{e^x + e^y}{2}$$\n\n` +
          `Ce qui démontre l'inégalité demandée.`,
        answer: `L'inégalité découle de la convexité de $e^x$`,
        params: {}
      }
    } else {
      return {
        id: `conv-ineg-${Date.now()}`,
        category: 'Convexité',
        title: 'Inégalité de convexité',
        difficulty: 3,
        statement: `Montrer que pour tous $x, y > 0$ :\n$$\\ln\\left(\\frac{x+y}{2}\\right) \\geq \\frac{\\ln x + \\ln y}{2}$$`,
        hints: [
          'La fonction $\\ln$ est concave sur $]0, +\\infty[$',
          'Pour une fonction concave, l\'inégalité de Jensen est inversée'
        ],
        solution: `La fonction $f(t) = \\ln(t)$ est concave sur $]0, +\\infty[$ car $f''(t) = -\\frac{1}{t^2} < 0$.\n\n` +
          `Pour une fonction **concave**, l'inégalité de Jensen s'inverse :\n` +
          `$$f\\left(\\frac{x+y}{2}\\right) \\geq \\frac{f(x) + f(y)}{2}$$\n\n` +
          `C'est-à-dire :\n` +
          `$$\\ln\\left(\\frac{x+y}{2}\\right) \\geq \\frac{\\ln x + \\ln y}{2}$$\n\n` +
          `Ce qui démontre l'inégalité demandée.\n\n` +
          `*Remarque* : Cela équivaut à $\\frac{x+y}{2} \\geq \\sqrt{xy}$ (inégalité arithmético-géométrique).`,
        answer: `L'inégalité découle de la concavité de $\\ln$`,
        params: {}
      }
    }
  }
}

// --- LOI NORMALE ---
const loiNormaleCalcul: ExerciseGenerator = {
  id: 'normale-calcul',
  category: 'Loi normale',
  title: 'Calcul de probabilité (loi normale)',
  description: 'Calculer une probabilité avec la loi normale centrée réduite',
  difficulty: 2,
  chapter: 'loi-normale',
  generate: () => {
    const a = randChoice([0.5, 1, 1.5, 2, 2.5])
    const type = randChoice(['inf', 'sup', 'intervalle'])

    // Valeurs approchées de Φ(x) pour certains x
    const phi: Record<number, number> = {
      0.5: 0.6915,
      1: 0.8413,
      1.5: 0.9332,
      2: 0.9772,
      2.5: 0.9938
    }

    if (type === 'inf') {
      return {
        id: `norm-calc-${Date.now()}`,
        category: 'Loi normale',
        title: 'Probabilité (loi normale)',
        difficulty: 2,
        statement: `Soit $Z$ une variable aléatoire suivant la loi normale centrée réduite $\\mathcal{N}(0,1)$.\n\nCalculer $P(Z \\leq ${a})$.`,
        hints: [
          'Utilise la table de la loi normale ou la calculatrice',
          '$P(Z \\leq a) = \\Phi(a)$ où $\\Phi$ est la fonction de répartition'
        ],
        solution: `$P(Z \\leq ${a}) = \\Phi(${a})$\n\n` +
          `D'après la table de la loi normale :\n` +
          `$\\Phi(${a}) \\approx ${phi[a]}$\n\n` +
          `Donc $P(Z \\leq ${a}) \\approx ${phi[a]}$.`,
        answer: `$P(Z \\leq ${a}) \\approx ${phi[a]}$`,
        params: { a }
      }
    } else if (type === 'sup') {
      return {
        id: `norm-calc-${Date.now()}`,
        category: 'Loi normale',
        title: 'Probabilité (loi normale)',
        difficulty: 2,
        statement: `Soit $Z \\sim \\mathcal{N}(0,1)$.\n\nCalculer $P(Z \\geq ${a})$.`,
        hints: [
          '$P(Z \\geq a) = 1 - P(Z < a) = 1 - \\Phi(a)$',
          'La loi normale est continue donc $P(Z \\geq a) = P(Z > a)$'
        ],
        solution: `$P(Z \\geq ${a}) = 1 - P(Z < ${a}) = 1 - \\Phi(${a})$\n\n` +
          `$= 1 - ${phi[a]} = ${(1 - phi[a]).toFixed(4)}$`,
        answer: `$P(Z \\geq ${a}) \\approx ${(1 - phi[a]).toFixed(4)}$`,
        params: { a }
      }
    } else {
      const b = a + randChoice([0.5, 1])
      return {
        id: `norm-calc-${Date.now()}`,
        category: 'Loi normale',
        title: 'Probabilité (loi normale)',
        difficulty: 2,
        statement: `Soit $Z \\sim \\mathcal{N}(0,1)$.\n\nCalculer $P(-${a} \\leq Z \\leq ${a})$.`,
        hints: [
          'Utilise la symétrie de la loi normale : $\\Phi(-a) = 1 - \\Phi(a)$',
          '$P(-a \\leq Z \\leq a) = 2\\Phi(a) - 1$'
        ],
        solution: `$P(-${a} \\leq Z \\leq ${a}) = \\Phi(${a}) - \\Phi(-${a})$\n\n` +
          `Par symétrie de la loi normale : $\\Phi(-${a}) = 1 - \\Phi(${a})$\n\n` +
          `Donc $P(-${a} \\leq Z \\leq ${a}) = \\Phi(${a}) - (1 - \\Phi(${a})) = 2\\Phi(${a}) - 1$\n\n` +
          `$= 2 \\times ${phi[a]} - 1 = ${(2 * phi[a] - 1).toFixed(4)}$`,
        answer: `$P(-${a} \\leq Z \\leq ${a}) \\approx ${(2 * phi[a] - 1).toFixed(4)}$`,
        params: { a }
      }
    }
  }
}

const loiNormaleNonCentree: ExerciseGenerator = {
  id: 'normale-generale',
  category: 'Loi normale',
  title: 'Loi normale générale',
  description: 'Centrer et réduire une variable normale',
  difficulty: 3,
  chapter: 'loi-normale',
  generate: () => {
    const mu = randInt(50, 150)
    const sigma = randChoice([5, 10, 15, 20])
    const x = mu + randChoice([-2, -1, 1, 2]) * sigma

    const z = (x - mu) / sigma
    const phi: Record<string, number> = { '-2': 0.0228, '-1': 0.1587, '1': 0.8413, '2': 0.9772 }

    return {
      id: `norm-gen-${Date.now()}`,
      category: 'Loi normale',
      title: 'Loi normale générale',
      difficulty: 3,
      statement: `Une variable $X$ suit la loi $\\mathcal{N}(${mu}, ${sigma}^2)$.\n\nCalculer $P(X \\leq ${x})$.`,
      hints: [
        'Centre et réduis : $Z = \\frac{X - \\mu}{\\sigma}$ suit $\\mathcal{N}(0,1)$',
        `Ici $\\mu = ${mu}$ et $\\sigma = ${sigma}$`
      ],
      solution: `On centre et réduit : $Z = \\frac{X - ${mu}}{${sigma}}$ suit $\\mathcal{N}(0,1)$.\n\n` +
        `$P(X \\leq ${x}) = P\\left(\\frac{X - ${mu}}{${sigma}} \\leq \\frac{${x} - ${mu}}{${sigma}}\\right)$\n\n` +
        `$= P\\left(Z \\leq \\frac{${x - mu}}{${sigma}}\\right) = P(Z \\leq ${z})$\n\n` +
        `$= \\Phi(${z}) \\approx ${phi[z.toString()]}$`,
      answer: `$P(X \\leq ${x}) \\approx ${phi[z.toString()]}$`,
      params: { mu, sigma, x }
    }
  }
}

// --- RÉCURRENCE ---
const recurrenceSomme: ExerciseGenerator = {
  id: 'recurrence-somme',
  category: 'Récurrence',
  title: 'Somme par récurrence',
  description: 'Démontrer une formule de somme par récurrence',
  difficulty: 2,
  chapter: 'recurrence',
  generate: () => {
    const type = randChoice(['carres', 'puissances2', 'arithmetique'])

    if (type === 'carres') {
      return {
        id: `rec-somme-${Date.now()}`,
        category: 'Récurrence',
        title: 'Somme des carrés',
        difficulty: 2,
        statement: `Démontrer par récurrence que pour tout $n \\geq 1$ :\n$$\\sum_{k=1}^{n} k^2 = \\frac{n(n+1)(2n+1)}{6}$$`,
        hints: [
          'Initialisation : vérifie pour $n = 1$',
          'Hérédité : suppose la propriété vraie au rang $n$, démontre-la au rang $n+1$'
        ],
        solution: `**Initialisation** ($n = 1$) :\n` +
          `$\\sum_{k=1}^{1} k^2 = 1$ et $\\frac{1 \\times 2 \\times 3}{6} = 1$ ✓\n\n` +
          `**Hérédité** : Supposons $P(n)$ vraie.\n` +
          `$\\sum_{k=1}^{n+1} k^2 = \\sum_{k=1}^{n} k^2 + (n+1)^2$\n\n` +
          `$= \\frac{n(n+1)(2n+1)}{6} + (n+1)^2$ (par hypothèse de récurrence)\n\n` +
          `$= \\frac{n(n+1)(2n+1) + 6(n+1)^2}{6}$\n\n` +
          `$= \\frac{(n+1)[n(2n+1) + 6(n+1)]}{6}$\n\n` +
          `$= \\frac{(n+1)(2n^2 + 7n + 6)}{6}$\n\n` +
          `$= \\frac{(n+1)(n+2)(2n+3)}{6}$\n\n` +
          `C'est bien la formule au rang $n+1$. ✓\n\n` +
          `**Conclusion** : Par récurrence, la propriété est vraie pour tout $n \\geq 1$.`,
        answer: `Démontré par récurrence`,
        params: {}
      }
    } else if (type === 'puissances2') {
      return {
        id: `rec-somme-${Date.now()}`,
        category: 'Récurrence',
        title: 'Somme des puissances de 2',
        difficulty: 2,
        statement: `Démontrer par récurrence que pour tout $n \\geq 0$ :\n$$\\sum_{k=0}^{n} 2^k = 2^{n+1} - 1$$`,
        hints: [
          'Initialisation : vérifie pour $n = 0$',
          'Hérédité : ajoute $2^{n+1}$ des deux côtés'
        ],
        solution: `**Initialisation** ($n = 0$) :\n` +
          `$\\sum_{k=0}^{0} 2^k = 2^0 = 1$ et $2^1 - 1 = 1$ ✓\n\n` +
          `**Hérédité** : Supposons la propriété vraie au rang $n$.\n` +
          `$\\sum_{k=0}^{n+1} 2^k = \\sum_{k=0}^{n} 2^k + 2^{n+1}$\n\n` +
          `$= (2^{n+1} - 1) + 2^{n+1}$ (par H.R.)\n\n` +
          `$= 2 \\times 2^{n+1} - 1 = 2^{n+2} - 1$ ✓\n\n` +
          `**Conclusion** : Par récurrence, la propriété est vraie pour tout $n \\geq 0$.`,
        answer: `Démontré par récurrence`,
        params: {}
      }
    } else {
      const r = randInt(2, 5)
      return {
        id: `rec-somme-${Date.now()}`,
        category: 'Récurrence',
        title: 'Somme arithmétique',
        difficulty: 2,
        statement: `Démontrer par récurrence que pour tout $n \\geq 1$ :\n$$\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}$$`,
        hints: [
          'Initialisation : vérifie pour $n = 1$',
          'Hérédité : ajoute $(n+1)$ des deux côtés'
        ],
        solution: `**Initialisation** ($n = 1$) :\n` +
          `$\\sum_{k=1}^{1} k = 1$ et $\\frac{1 \\times 2}{2} = 1$ ✓\n\n` +
          `**Hérédité** : Supposons la propriété vraie au rang $n$.\n` +
          `$\\sum_{k=1}^{n+1} k = \\sum_{k=1}^{n} k + (n+1)$\n\n` +
          `$= \\frac{n(n+1)}{2} + (n+1)$ (par H.R.)\n\n` +
          `$= \\frac{n(n+1) + 2(n+1)}{2} = \\frac{(n+1)(n+2)}{2}$ ✓\n\n` +
          `**Conclusion** : Par récurrence, la propriété est vraie pour tout $n \\geq 1$.`,
        answer: `Démontré par récurrence`,
        params: {}
      }
    }
  }
}

const recurrenceInegalite: ExerciseGenerator = {
  id: 'recurrence-ineg',
  category: 'Récurrence',
  title: 'Inégalité par récurrence',
  description: 'Démontrer une inégalité par récurrence',
  difficulty: 3,
  chapter: 'recurrence',
  generate: () => {
    const type = randChoice(['factorielle', 'exponentielle'])

    if (type === 'factorielle') {
      return {
        id: `rec-ineg-${Date.now()}`,
        category: 'Récurrence',
        title: 'Factorielle et puissance',
        difficulty: 3,
        statement: `Démontrer par récurrence que pour tout $n \\geq 4$ :\n$$n! > 2^n$$`,
        hints: [
          'Initialisation : vérifie pour $n = 4$',
          'Utilise que $(n+1)! = (n+1) \\times n!$'
        ],
        solution: `**Initialisation** ($n = 4$) :\n` +
          `$4! = 24$ et $2^4 = 16$. On a bien $24 > 16$ ✓\n\n` +
          `**Hérédité** : Supposons $n! > 2^n$ pour un $n \\geq 4$.\n` +
          `$(n+1)! = (n+1) \\times n!$\n\n` +
          `$> (n+1) \\times 2^n$ (par H.R.)\n\n` +
          `Or pour $n \\geq 4$, on a $n + 1 \\geq 5 > 2$, donc :\n` +
          `$(n+1) \\times 2^n > 2 \\times 2^n = 2^{n+1}$ ✓\n\n` +
          `**Conclusion** : Par récurrence, $n! > 2^n$ pour tout $n \\geq 4$.`,
        answer: `Démontré par récurrence`,
        params: {}
      }
    } else {
      return {
        id: `rec-ineg-${Date.now()}`,
        category: 'Récurrence',
        title: 'Croissance exponentielle',
        difficulty: 3,
        statement: `Démontrer par récurrence que pour tout $n \\geq 1$ :\n$$2^n > n$$`,
        hints: [
          'Initialisation : vérifie pour $n = 1$',
          'Utilise $2^{n+1} = 2 \\times 2^n$'
        ],
        solution: `**Initialisation** ($n = 1$) :\n` +
          `$2^1 = 2 > 1$ ✓\n\n` +
          `**Hérédité** : Supposons $2^n > n$ pour un $n \\geq 1$.\n` +
          `$2^{n+1} = 2 \\times 2^n > 2n$ (par H.R.)\n\n` +
          `Il suffit de montrer que $2n \\geq n + 1$, i.e. $n \\geq 1$.\n\n` +
          `C'est vrai par hypothèse, donc $2^{n+1} > 2n \\geq n + 1$ ✓\n\n` +
          `**Conclusion** : Par récurrence, $2^n > n$ pour tout $n \\geq 1$.`,
        answer: `Démontré par récurrence`,
        params: {}
      }
    }
  }
}

// --- ARITHMÉTIQUE ---
const arithmetiquePGCD: ExerciseGenerator = {
  id: 'arith-pgcd',
  category: 'Arithmétique',
  title: 'Calcul du PGCD',
  description: 'Calculer le PGCD avec l\'algorithme d\'Euclide',
  difficulty: 2,
  chapter: 'divisibilite',
  generate: () => {
    const a = randInt(50, 200)
    const b = randInt(20, a - 1)

    // Algorithme d'Euclide
    const steps: string[] = []
    let x = a, y = b
    while (y !== 0) {
      const q = Math.floor(x / y)
      const r = x % y
      steps.push(`$${x} = ${q} \\times ${y} + ${r}$`)
      x = y
      y = r
    }
    const pgcd = x

    return {
      id: `arith-pgcd-${Date.now()}`,
      category: 'Arithmétique',
      title: 'PGCD (Euclide)',
      difficulty: 2,
      statement: `Calculer $\\text{PGCD}(${a}, ${b})$ en utilisant l'algorithme d'Euclide.`,
      hints: [
        'Effectue des divisions euclidiennes successives',
        'Le PGCD est le dernier reste non nul'
      ],
      solution: `**Algorithme d'Euclide** :\n\n` +
        steps.join('\n\n') +
        `\n\nLe dernier reste non nul est **${pgcd}**.\n\n` +
        `Donc $\\text{PGCD}(${a}, ${b}) = ${pgcd}$.`,
      answer: `$\\text{PGCD}(${a}, ${b}) = ${pgcd}$`,
      params: { a, b }
    }
  }
}

const arithmetiqueCongruence: ExerciseGenerator = {
  id: 'arith-cong',
  category: 'Arithmétique',
  title: 'Calcul de congruence',
  description: 'Calculer le reste d\'une division',
  difficulty: 2,
  chapter: 'congruences',
  generate: () => {
    const base = randInt(2, 9)
    const exp = randInt(10, 30)
    const mod = randChoice([3, 7, 9, 11])

    // Calcul du reste de base^exp mod m
    let result = 1
    let currentBase = base % mod
    let e = exp
    while (e > 0) {
      if (e % 2 === 1) {
        result = (result * currentBase) % mod
      }
      currentBase = (currentBase * currentBase) % mod
      e = Math.floor(e / 2)
    }

    return {
      id: `arith-cong-${Date.now()}`,
      category: 'Arithmétique',
      title: 'Congruence',
      difficulty: 2,
      statement: `Quel est le reste de la division euclidienne de $${base}^{${exp}}$ par $${mod}$ ?`,
      hints: [
        'Trouve d\'abord la période des puissances modulo $' + mod + '$',
        'Utilise les propriétés des congruences'
      ],
      solution: `Calculons les puissances de $${base}$ modulo $${mod}$ :\n\n` +
        `$${base}^1 \\equiv ${base % mod} \\pmod{${mod}}$\n` +
        `$${base}^2 \\equiv ${(base * base) % mod} \\pmod{${mod}}$\n` +
        `$${base}^3 \\equiv ${(base * base * base) % mod} \\pmod{${mod}}$\n` +
        `...\n\n` +
        `En calculant (ou par exponentiation rapide) :\n` +
        `$${base}^{${exp}} \\equiv ${result} \\pmod{${mod}}$\n\n` +
        `Le reste est **${result}**.`,
      answer: `Le reste est $${result}$`,
      params: { base, exp, mod }
    }
  }
}

const arithmetiqueBezout: ExerciseGenerator = {
  id: 'arith-bezout',
  category: 'Arithmétique',
  title: 'Identité de Bézout',
  description: 'Trouver les coefficients de Bézout',
  difficulty: 3,
  chapter: 'bezout',
  generate: () => {
    // Choisir deux nombres premiers entre eux
    let a = randInt(15, 50)
    let b = randInt(10, a - 1)
    while (gcd(a, b) !== 1) {
      a = randInt(15, 50)
      b = randInt(10, a - 1)
    }

    // Algorithme d'Euclide étendu
    function extendedGcd(a: number, b: number): [number, number, number] {
      if (b === 0) return [a, 1, 0]
      const [g, x1, y1] = extendedGcd(b, a % b)
      return [g, y1, x1 - Math.floor(a / b) * y1]
    }

    const [, u, v] = extendedGcd(a, b)

    return {
      id: `arith-bezout-${Date.now()}`,
      category: 'Arithmétique',
      title: 'Coefficients de Bézout',
      difficulty: 3,
      statement: `Trouver des entiers $u$ et $v$ tels que $${a}u + ${b}v = 1$.`,
      hints: [
        'Vérifie d\'abord que $\\text{PGCD}(${a}, ${b}) = 1$',
        'Utilise l\'algorithme d\'Euclide étendu'
      ],
      solution: `Les nombres $${a}$ et $${b}$ sont premiers entre eux (PGCD = 1).\n\n` +
        `Par l'algorithme d'Euclide étendu, on trouve :\n` +
        `$u = ${u}$ et $v = ${v}$\n\n` +
        `**Vérification** : $${a} \\times (${u}) + ${b} \\times (${v}) = ${a * u} + ${b * v} = 1$ ✓`,
      answer: `$u = ${u}$, $v = ${v}$`,
      params: { a, b, u, v }
    }
  }
}

// --- MATRICES ---
const matriceOperations: ExerciseGenerator = {
  id: 'matrice-ops',
  category: 'Matrices',
  title: 'Opérations sur les matrices',
  description: 'Calculer un produit de matrices 2×2',
  difficulty: 2,
  chapter: 'matrices-operations',
  generate: () => {
    const a11 = randInt(-3, 3), a12 = randInt(-3, 3)
    const a21 = randInt(-3, 3), a22 = randInt(-3, 3)
    const b11 = randInt(-3, 3), b12 = randInt(-3, 3)
    const b21 = randInt(-3, 3), b22 = randInt(-3, 3)

    // Produit AB
    const c11 = a11 * b11 + a12 * b21
    const c12 = a11 * b12 + a12 * b22
    const c21 = a21 * b11 + a22 * b21
    const c22 = a21 * b12 + a22 * b22

    return {
      id: `mat-ops-${Date.now()}`,
      category: 'Matrices',
      title: 'Produit matriciel',
      difficulty: 2,
      statement: `Calculer $AB$ où :\n$$A = \\begin{pmatrix} ${a11} & ${a12} \\\\ ${a21} & ${a22} \\end{pmatrix} \\quad B = \\begin{pmatrix} ${b11} & ${b12} \\\\ ${b21} & ${b22} \\end{pmatrix}$$`,
      hints: [
        '$(AB)_{ij} = \\sum_k A_{ik} B_{kj}$',
        'Ligne de $A$ × Colonne de $B$'
      ],
      solution: `$AB = \\begin{pmatrix} ${a11} & ${a12} \\\\ ${a21} & ${a22} \\end{pmatrix} \\begin{pmatrix} ${b11} & ${b12} \\\\ ${b21} & ${b22} \\end{pmatrix}$\n\n` +
        `$(AB)_{11} = ${a11} \\times ${b11} + ${a12} \\times ${b21} = ${c11}$\n` +
        `$(AB)_{12} = ${a11} \\times ${b12} + ${a12} \\times ${b22} = ${c12}$\n` +
        `$(AB)_{21} = ${a21} \\times ${b11} + ${a22} \\times ${b21} = ${c21}$\n` +
        `$(AB)_{22} = ${a21} \\times ${b12} + ${a22} \\times ${b22} = ${c22}$\n\n` +
        `$$AB = \\begin{pmatrix} ${c11} & ${c12} \\\\ ${c21} & ${c22} \\end{pmatrix}$$`,
      answer: `$AB = \\begin{pmatrix} ${c11} & ${c12} \\\\ ${c21} & ${c22} \\end{pmatrix}$`,
      params: { a11, a12, a21, a22, b11, b12, b21, b22 }
    }
  }
}

const matriceDeterminant: ExerciseGenerator = {
  id: 'matrice-det',
  category: 'Matrices',
  title: 'Déterminant et inverse',
  description: 'Calculer le déterminant et l\'inverse d\'une matrice 2×2',
  difficulty: 2,
  chapter: 'matrices-operations',
  generate: () => {
    // Générer une matrice inversible
    let a = randInt(-4, 4), b = randInt(-4, 4)
    let c = randInt(-4, 4), d = randInt(-4, 4)
    let det = a * d - b * c
    while (det === 0) {
      a = randInt(-4, 4); b = randInt(-4, 4)
      c = randInt(-4, 4); d = randInt(-4, 4)
      det = a * d - b * c
    }

    return {
      id: `mat-det-${Date.now()}`,
      category: 'Matrices',
      title: 'Déterminant et inverse',
      difficulty: 2,
      statement: `Soit $A = \\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{pmatrix}$.\n\n1. Calculer $\\det(A)$.\n2. La matrice est-elle inversible ? Si oui, calculer $A^{-1}$.`,
      hints: [
        '$\\det(A) = ad - bc$',
        '$A^{-1} = \\frac{1}{\\det(A)} \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$'
      ],
      solution: `**1.** $\\det(A) = ${a} \\times ${d} - ${b} \\times ${c} = ${a*d} - ${b*c} = ${det}$\n\n` +
        `**2.** $\\det(A) = ${det} \\neq 0$, donc $A$ est **inversible**.\n\n` +
        `$A^{-1} = \\frac{1}{${det}} \\begin{pmatrix} ${d} & ${-b} \\\\ ${-c} & ${a} \\end{pmatrix}$\n\n` +
        (Math.abs(det) === 1
          ? `$A^{-1} = \\begin{pmatrix} ${d * (det > 0 ? 1 : -1)} & ${-b * (det > 0 ? 1 : -1)} \\\\ ${-c * (det > 0 ? 1 : -1)} & ${a * (det > 0 ? 1 : -1)} \\end{pmatrix}$`
          : `$A^{-1} = \\begin{pmatrix} \\frac{${d}}{${det}} & \\frac{${-b}}{${det}} \\\\ \\frac{${-c}}{${det}} & \\frac{${a}}{${det}} \\end{pmatrix}$`),
      answer: `$\\det(A) = ${det}$, $A^{-1} = \\frac{1}{${det}} \\begin{pmatrix} ${d} & ${-b} \\\\ ${-c} & ${a} \\end{pmatrix}$`,
      params: { a, b, c, d, det }
    }
  }
}

// --- GÉOMÉTRIE DANS L'ESPACE ---
const geometrieVecteurs: ExerciseGenerator = {
  id: 'geo-vecteurs',
  category: 'Géométrie',
  title: 'Calculs vectoriels dans l\'espace',
  description: 'Produit scalaire et norme dans l\'espace',
  difficulty: 2,
  chapter: 'vecteurs-espace',
  generate: () => {
    const ux = randInt(-4, 4), uy = randInt(-4, 4), uz = randInt(-4, 4)
    const vx = randInt(-4, 4), vy = randInt(-4, 4), vz = randInt(-4, 4)

    const prodScal = ux * vx + uy * vy + uz * vz
    const normeU = Math.sqrt(ux * ux + uy * uy + uz * uz)
    const normeV = Math.sqrt(vx * vx + vy * vy + vz * vz)

    return {
      id: `geo-vect-${Date.now()}`,
      category: 'Géométrie',
      title: 'Produit scalaire',
      difficulty: 2,
      statement: `Soient $\\vec{u} = \\begin{pmatrix} ${ux} \\\\ ${uy} \\\\ ${uz} \\end{pmatrix}$ et $\\vec{v} = \\begin{pmatrix} ${vx} \\\\ ${vy} \\\\ ${vz} \\end{pmatrix}$.\n\n1. Calculer $\\vec{u} \\cdot \\vec{v}$.\n2. Calculer $\\|\\vec{u}\\|$.`,
      hints: [
        '$\\vec{u} \\cdot \\vec{v} = x_u x_v + y_u y_v + z_u z_v$',
        '$\\|\\vec{u}\\| = \\sqrt{x^2 + y^2 + z^2}$'
      ],
      solution: `**1.** $\\vec{u} \\cdot \\vec{v} = ${ux} \\times ${vx} + ${uy} \\times ${vy} + ${uz} \\times ${vz}$\n` +
        `$= ${ux * vx} + ${uy * vy} + ${uz * vz} = ${prodScal}$\n\n` +
        `**2.** $\\|\\vec{u}\\| = \\sqrt{${ux}^2 + ${uy}^2 + ${uz}^2} = \\sqrt{${ux*ux + uy*uy + uz*uz}}$\n` +
        (Number.isInteger(normeU)
          ? `$= ${normeU}$`
          : `$\\approx ${normeU.toFixed(2)}$`),
      answer: `$\\vec{u} \\cdot \\vec{v} = ${prodScal}$, $\\|\\vec{u}\\| = \\sqrt{${ux*ux + uy*uy + uz*uz}}$`,
      params: { ux, uy, uz, vx, vy, vz }
    }
  }
}

const geometriePlanEquation: ExerciseGenerator = {
  id: 'geo-plan',
  category: 'Géométrie',
  title: 'Équation de plan',
  description: 'Trouver l\'équation d\'un plan',
  difficulty: 3,
  chapter: 'vecteurs-espace',
  generate: () => {
    const a = randNonZero(-4, 4), b = randNonZero(-4, 4), c = randNonZero(-4, 4)
    const x0 = randInt(-3, 3), y0 = randInt(-3, 3), z0 = randInt(-3, 3)
    const d = -(a * x0 + b * y0 + c * z0)

    return {
      id: `geo-plan-${Date.now()}`,
      category: 'Géométrie',
      title: 'Équation de plan',
      difficulty: 3,
      statement: `Déterminer une équation cartésienne du plan $\\mathcal{P}$ passant par $A(${x0}, ${y0}, ${z0})$ et de vecteur normal $\\vec{n} = \\begin{pmatrix} ${a} \\\\ ${b} \\\\ ${c} \\end{pmatrix}$.`,
      hints: [
        'L\'équation est de la forme $ax + by + cz + d = 0$',
        'Les coefficients $a, b, c$ sont les coordonnées du vecteur normal',
        'Trouve $d$ en utilisant les coordonnées du point $A$'
      ],
      solution: `L'équation du plan est $${a}x + ${b}y + ${c}z + d = 0$.\n\n` +
        `Le point $A(${x0}, ${y0}, ${z0})$ appartient au plan, donc :\n` +
        `$${a} \\times ${x0} + ${b} \\times ${y0} + ${c} \\times ${z0} + d = 0$\n` +
        `$${a * x0} + ${b * y0} + ${c * z0} + d = 0$\n` +
        `$${a * x0 + b * y0 + c * z0} + d = 0$\n` +
        `$d = ${d}$\n\n` +
        `**Équation du plan** : $${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}y ${c >= 0 ? '+' : '-'} ${Math.abs(c)}z ${d >= 0 ? '+' : '-'} ${Math.abs(d)} = 0$`,
      answer: `$${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}y ${c >= 0 ? '+' : '-'} ${Math.abs(c)}z ${d >= 0 ? '+' : '-'} ${Math.abs(d)} = 0$`,
      params: { a, b, c, d, x0, y0, z0 }
    }
  }
}

// ==================== DROITES ET PLANS ====================

const droiteParametrique: ExerciseGenerator = {
  id: 'droite-param',
  category: 'Droites et plans',
  title: 'Équation paramétrique de droite',
  description: 'Déterminer une représentation paramétrique d\'une droite',
  difficulty: 2,
  chapter: 'droites-plans-espace',
  generate: () => {
    const x1 = randInt(-3, 3), y1 = randInt(-3, 3), z1 = randInt(-3, 3)
    const x2 = randInt(-3, 3), y2 = randInt(-3, 3), z2 = randInt(-3, 3)
    // Vecteur directeur
    const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1

    // S'assurer que le vecteur n'est pas nul
    if (dx === 0 && dy === 0 && dz === 0) {
      return droiteParametrique.generate()
    }

    return {
      id: `droite-param-${Date.now()}`,
      category: 'Droites et plans',
      title: 'Équation paramétrique de droite',
      difficulty: 2,
      statement: `Déterminer une représentation paramétrique de la droite $(d)$ passant par $A(${x1}, ${y1}, ${z1})$ et $B(${x2}, ${y2}, ${z2})$.`,
      hints: [
        'Une droite passant par $A$ de vecteur directeur $\\vec{u}$ a pour équation $\\begin{cases} x = x_A + t \\cdot u_x \\\\ y = y_A + t \\cdot u_y \\\\ z = z_A + t \\cdot u_z \\end{cases}$',
        'Le vecteur directeur est $\\vec{AB} = (x_B - x_A, y_B - y_A, z_B - z_A)$',
      ],
      solution: `**Vecteur directeur** : $\\vec{AB} = (${x2} - ${x1}, ${y2} - ${y1}, ${z2} - ${z1}) = (${dx}, ${dy}, ${dz})$\n\n` +
        `**Représentation paramétrique** avec le point $A$ :\n` +
        `$$\\begin{cases} x = ${x1} ${dx >= 0 ? '+' : '-'} ${Math.abs(dx)}t \\\\ y = ${y1} ${dy >= 0 ? '+' : '-'} ${Math.abs(dy)}t \\\\ z = ${z1} ${dz >= 0 ? '+' : '-'} ${Math.abs(dz)}t \\end{cases}, \\quad t \\in \\mathbb{R}$$`,
      answer: `$\\begin{cases} x = ${x1} ${dx >= 0 ? '+' : '-'} ${Math.abs(dx)}t \\\\ y = ${y1} ${dy >= 0 ? '+' : '-'} ${Math.abs(dy)}t \\\\ z = ${z1} ${dz >= 0 ? '+' : '-'} ${Math.abs(dz)}t \\end{cases}$`,
      params: { x1, y1, z1, x2, y2, z2, dx, dy, dz }
    }
  }
}

const intersectionDroitePlan: ExerciseGenerator = {
  id: 'intersection-droite-plan',
  category: 'Droites et plans',
  title: 'Intersection droite et plan',
  description: 'Calculer l\'intersection d\'une droite et d\'un plan',
  difficulty: 3,
  chapter: 'droites-plans-espace',
  generate: () => {
    // Plan ax + by + cz + d = 0
    const a = randNonZero(-3, 3), b = randNonZero(-3, 3), c = randNonZero(-3, 3)
    const d = randInt(-5, 5)

    // Point de la droite et vecteur directeur
    const x0 = randInt(-2, 2), y0 = randInt(-2, 2), z0 = randInt(-2, 2)
    const ux = randNonZero(-2, 2), uy = randNonZero(-2, 2), uz = randNonZero(-2, 2)

    // Vérifier que la droite n'est pas parallèle au plan
    const dotProduct = a * ux + b * uy + c * uz
    if (dotProduct === 0) {
      return intersectionDroitePlan.generate()
    }

    // Calcul du paramètre t
    const numerator = -(a * x0 + b * y0 + c * z0 + d)

    // Pour avoir des valeurs entières, on choisit t simple
    const t = 1
    const xi = x0 + t * ux
    const yi = y0 + t * uy
    const zi = z0 + t * uz

    // Recalculer d pour que l'intersection tombe en t=1
    const newD = -(a * xi + b * yi + c * zi)

    return {
      id: `intersection-dp-${Date.now()}`,
      category: 'Droites et plans',
      title: 'Intersection droite et plan',
      difficulty: 3,
      statement: `Déterminer les coordonnées du point d'intersection de la droite $(d)$ et du plan $\\mathcal{P}$ :\n\n` +
        `$(d) : \\begin{cases} x = ${x0} + ${ux}t \\\\ y = ${y0} + ${uy}t \\\\ z = ${z0} + ${uz}t \\end{cases}$ et $\\mathcal{P} : ${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}y ${c >= 0 ? '+' : '-'} ${Math.abs(c)}z ${newD >= 0 ? '+' : '-'} ${Math.abs(newD)} = 0$`,
      hints: [
        'Substitue les expressions de $x$, $y$, $z$ de la droite dans l\'équation du plan',
        'Résous l\'équation en $t$',
        'Remplace $t$ dans les équations paramétriques pour trouver les coordonnées',
      ],
      solution: `On substitue dans l'équation du plan :\n` +
        `$${a}(${x0} + ${ux}t) ${b >= 0 ? '+' : '-'} ${Math.abs(b)}(${y0} + ${uy}t) ${c >= 0 ? '+' : '-'} ${Math.abs(c)}(${z0} + ${uz}t) ${newD >= 0 ? '+' : '-'} ${Math.abs(newD)} = 0$\n\n` +
        `Après développement et simplification, on trouve $t = 1$.\n\n` +
        `**Point d'intersection** : $I(${xi}, ${yi}, ${zi})$`,
      answer: `$I(${xi}, ${yi}, ${zi})$`,
      params: { a, b, c, d: newD, x0, y0, z0, ux, uy, uz, xi, yi, zi }
    }
  }
}

// ==================== LOGIQUE (Implication/Équivalence) ====================

const logiqueContraposee: ExerciseGenerator = {
  id: 'logique-contraposee',
  category: 'Logique',
  title: 'Contraposée d\'une implication',
  description: 'Énoncer la contraposée d\'une proposition',
  difficulty: 1,
  chapter: 'implication-equivalence',
  generate: () => {
    const propositions = [
      { p: 'n est pair', q: 'n² est pair', notP: 'n est impair', notQ: 'n² est impair' },
      { p: 'x > 2', q: 'x² > 4', notP: 'x ≤ 2', notQ: 'x² ≤ 4' },
      { p: 'f est dérivable', q: 'f est continue', notP: 'f n\'est pas dérivable', notQ: 'f n\'est pas continue' },
      { p: 'ABCD est un carré', q: 'ABCD est un rectangle', notP: 'ABCD n\'est pas un carré', notQ: 'ABCD n\'est pas un rectangle' },
      { p: 'x = 0', q: 'x² = 0', notP: 'x ≠ 0', notQ: 'x² ≠ 0' },
      { p: 'n est divisible par 6', q: 'n est divisible par 3', notP: 'n n\'est pas divisible par 6', notQ: 'n n\'est pas divisible par 3' },
    ]

    const prop = randChoice(propositions)

    return {
      id: `logique-contra-${Date.now()}`,
      category: 'Logique',
      title: 'Contraposée',
      difficulty: 1,
      statement: `Énoncer la contraposée de l'implication suivante :\n\n« Si ${prop.p}, alors ${prop.q} »`,
      hints: [
        'La contraposée de « P ⟹ Q » est « non Q ⟹ non P »',
        'On inverse et on nie les deux propositions',
      ],
      solution: `**Implication de départ** : ${prop.p} ⟹ ${prop.q}\n\n` +
        `**Contraposée** : non Q ⟹ non P\n\n` +
        `« Si ${prop.notQ}, alors ${prop.notP} »\n\n` +
        `*Rappel : Une implication et sa contraposée sont logiquement équivalentes.*`,
      answer: `« Si ${prop.notQ}, alors ${prop.notP} »`,
      params: { p: prop.p, q: prop.q }
    }
  }
}

const logiqueReciproque: ExerciseGenerator = {
  id: 'logique-reciproque',
  category: 'Logique',
  title: 'Réciproque et équivalence',
  description: 'Identifier réciproque et étudier l\'équivalence',
  difficulty: 2,
  chapter: 'implication-equivalence',
  generate: () => {
    const propositions = [
      { p: 'n² est pair', q: 'n est pair', equiv: true, explication: 'Un carré est pair si et seulement si le nombre est pair' },
      { p: 'x² = 4', q: 'x = 2', equiv: false, explication: 'Faux car $x = -2$ vérifie aussi $x² = 4$' },
      { p: 'x > 0 et y > 0', q: 'xy > 0', equiv: false, explication: 'Faux car $x < 0$ et $y < 0$ donne aussi $xy > 0$' },
      { p: 'ABCD est un losange à angles droits', q: 'ABCD est un carré', equiv: true, explication: 'C\'est la définition du carré' },
      { p: 'f\'(x) = 0', q: 'f admet un extremum en x', equiv: false, explication: 'Faux, par exemple $f(x) = x³$ en $x = 0$' },
      { p: 'ab = 0', q: 'a = 0 ou b = 0', equiv: true, explication: 'Propriété fondamentale du produit nul' },
    ]

    const prop = randChoice(propositions)

    return {
      id: `logique-recip-${Date.now()}`,
      category: 'Logique',
      title: 'Réciproque et équivalence',
      difficulty: 2,
      statement: `Soit l'implication : « Si ${prop.p}, alors ${prop.q} »\n\n` +
        `1. Énoncer la réciproque\n` +
        `2. L'implication et sa réciproque sont-elles toutes deux vraies ? (Y a-t-il équivalence ?)`,
      hints: [
        'La réciproque de « P ⟹ Q » est « Q ⟹ P »',
        'Il y a équivalence si les deux implications sont vraies',
        'Cherche un contre-exemple pour montrer qu\'une implication est fausse',
      ],
      solution: `**1. Réciproque** : « Si ${prop.q}, alors ${prop.p} »\n\n` +
        `**2. Équivalence** : ${prop.equiv ? 'Oui' : 'Non'}\n\n` +
        `${prop.explication}`,
      answer: prop.equiv ? 'Oui, il y a équivalence' : 'Non, pas d\'équivalence',
      params: { p: prop.p, q: prop.q, equiv: prop.equiv }
    }
  }
}

// ==================== CHAÎNES DE MARKOV ====================

const markovMatriceTransition: ExerciseGenerator = {
  id: 'markov-transition',
  category: 'Chaînes de Markov',
  title: 'Matrice de transition',
  description: 'Calculer une puissance de matrice de transition',
  difficulty: 3,
  chapter: 'chaines-markov',
  generate: () => {
    // Matrice 2x2 simple avec fractions simples
    const choices = [
      { a: 0.8, b: 0.2, c: 0.3, d: 0.7, aF: '0.8', bF: '0.2', cF: '0.3', dF: '0.7' },
      { a: 0.6, b: 0.4, c: 0.5, d: 0.5, aF: '0.6', bF: '0.4', cF: '0.5', dF: '0.5' },
      { a: 0.9, b: 0.1, c: 0.2, d: 0.8, aF: '0.9', bF: '0.1', cF: '0.2', dF: '0.8' },
      { a: 0.7, b: 0.3, c: 0.4, d: 0.6, aF: '0.7', bF: '0.3', cF: '0.4', dF: '0.6' },
    ]

    const m = randChoice(choices)

    // Calcul de P²
    const p2_a = m.a * m.a + m.b * m.c
    const p2_b = m.a * m.b + m.b * m.d
    const p2_c = m.c * m.a + m.d * m.c
    const p2_d = m.c * m.b + m.d * m.d

    return {
      id: `markov-trans-${Date.now()}`,
      category: 'Chaînes de Markov',
      title: 'Puissance de matrice',
      difficulty: 3,
      statement: `Soit la matrice de transition $P = \\begin{pmatrix} ${m.aF} & ${m.bF} \\\\ ${m.cF} & ${m.dF} \\end{pmatrix}$.\n\n` +
        `Calculer $P^2$ et interpréter les coefficients.`,
      hints: [
        'Pour multiplier deux matrices 2×2, utilise la formule $(AB)_{ij} = \\sum_k A_{ik} B_{kj}$',
        'Chaque coefficient $(P^2)_{ij}$ représente la probabilité d\'aller de l\'état $i$ à l\'état $j$ en 2 étapes',
      ],
      solution: `$P^2 = P \\times P = \\begin{pmatrix} ${m.aF} & ${m.bF} \\\\ ${m.cF} & ${m.dF} \\end{pmatrix} \\times \\begin{pmatrix} ${m.aF} & ${m.bF} \\\\ ${m.cF} & ${m.dF} \\end{pmatrix}$\n\n` +
        `$P^2 = \\begin{pmatrix} ${p2_a.toFixed(2)} & ${p2_b.toFixed(2)} \\\\ ${p2_c.toFixed(2)} & ${p2_d.toFixed(2)} \\end{pmatrix}$\n\n` +
        `**Interprétation** : $(P^2)_{ij}$ est la probabilité de passer de l'état $i$ à l'état $j$ en exactement 2 étapes.`,
      answer: `$P^2 = \\begin{pmatrix} ${p2_a.toFixed(2)} & ${p2_b.toFixed(2)} \\\\ ${p2_c.toFixed(2)} & ${p2_d.toFixed(2)} \\end{pmatrix}$`,
      params: { m, p2_a, p2_b, p2_c, p2_d }
    }
  }
}

const markovEtatStable: ExerciseGenerator = {
  id: 'markov-stable',
  category: 'Chaînes de Markov',
  title: 'État stable',
  description: 'Déterminer l\'état stable d\'une chaîne de Markov',
  difficulty: 4,
  chapter: 'chaines-markov',
  generate: () => {
    // Matrice avec état stable simple
    // Pour a=1-p et b=p en haut, c=q et d=1-q en bas
    // État stable : (q/(p+q), p/(p+q))
    const p = randChoice([0.2, 0.3, 0.4, 0.5])
    const q = randChoice([0.2, 0.3, 0.4, 0.5])

    const pi1 = q / (p + q)
    const pi2 = p / (p + q)

    return {
      id: `markov-stable-${Date.now()}`,
      category: 'Chaînes de Markov',
      title: 'État stable',
      difficulty: 4,
      statement: `Soit la matrice de transition $P = \\begin{pmatrix} ${(1-p).toFixed(1)} & ${p.toFixed(1)} \\\\ ${q.toFixed(1)} & ${(1-q).toFixed(1)} \\end{pmatrix}$.\n\n` +
        `Déterminer le vecteur d'état stable $\\pi = (\\pi_1, \\pi_2)$.`,
      hints: [
        'L\'état stable vérifie $\\pi P = \\pi$ et $\\pi_1 + \\pi_2 = 1$',
        'Écris le système d\'équations et résous',
        'On obtient $\\pi_1 = \\frac{q}{p+q}$ et $\\pi_2 = \\frac{p}{p+q}$',
      ],
      solution: `On cherche $\\pi = (\\pi_1, \\pi_2)$ tel que $\\pi P = \\pi$ et $\\pi_1 + \\pi_2 = 1$.\n\n` +
        `Le système donne :\n` +
        `$\\begin{cases} ${(1-p).toFixed(1)} \\pi_1 + ${q.toFixed(1)} \\pi_2 = \\pi_1 \\\\ ${p.toFixed(1)} \\pi_1 + ${(1-q).toFixed(1)} \\pi_2 = \\pi_2 \\\\ \\pi_1 + \\pi_2 = 1 \\end{cases}$\n\n` +
        `Après simplification : $${p.toFixed(1)} \\pi_1 = ${q.toFixed(1)} \\pi_2$\n\n` +
        `Avec $\\pi_1 + \\pi_2 = 1$ :\n` +
        `$\\pi_1 = \\frac{${q.toFixed(1)}}{${(p+q).toFixed(1)}} = ${pi1.toFixed(3)}$\n` +
        `$\\pi_2 = \\frac{${p.toFixed(1)}}{${(p+q).toFixed(1)}} = ${pi2.toFixed(3)}$`,
      answer: `$\\pi = (${pi1.toFixed(3)}, ${pi2.toFixed(3)})$`,
      params: { p, q, pi1, pi2 }
    }
  }
}

// ==================== GRAPHES ====================

const grapheDegre: ExerciseGenerator = {
  id: 'graphe-degre',
  category: 'Graphes',
  title: 'Degré des sommets',
  description: 'Calculer le degré des sommets d\'un graphe',
  difficulty: 1,
  chapter: 'graphes-introduction',
  generate: () => {
    // Générer un graphe simple avec 4-5 sommets
    const n = randChoice([4, 5])
    const sommets = ['A', 'B', 'C', 'D', 'E'].slice(0, n)

    // Générer des arêtes aléatoirement
    const aretes: [string, string][] = []
    const degres: Record<string, number> = {}
    sommets.forEach(s => degres[s] = 0)

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.random() > 0.4) { // 60% de chance d'avoir une arête
          aretes.push([sommets[i], sommets[j]])
          degres[sommets[i]]++
          degres[sommets[j]]++
        }
      }
    }

    // S'assurer qu'on a au moins quelques arêtes
    if (aretes.length < 3) {
      return grapheDegre.generate()
    }

    const aretesStr = aretes.map(([a, b]) => `${a}${b}`).join(', ')
    const totalDegres = Object.values(degres).reduce((a, b) => a + b, 0)

    return {
      id: `graphe-degre-${Date.now()}`,
      category: 'Graphes',
      title: 'Degré des sommets',
      difficulty: 1,
      statement: `Soit le graphe $G$ d'ensemble de sommets $\\{${sommets.join(', ')}\\}$ et d'arêtes $\\{${aretesStr}\\}$.\n\n` +
        `1. Donner le degré de chaque sommet.\n` +
        `2. Vérifier la relation entre la somme des degrés et le nombre d'arêtes.`,
      hints: [
        'Le degré d\'un sommet est le nombre d\'arêtes incidentes à ce sommet',
        'La somme des degrés vaut 2 fois le nombre d\'arêtes',
      ],
      solution: `**1. Degrés** :\n${sommets.map(s => `- $d(${s}) = ${degres[s]}$`).join('\n')}\n\n` +
        `**2. Vérification** :\n` +
        `Somme des degrés = ${totalDegres}\n` +
        `Nombre d'arêtes = ${aretes.length}\n` +
        `On vérifie : $${totalDegres} = 2 \\times ${aretes.length}$ ✓`,
      answer: sommets.map(s => `$d(${s}) = ${degres[s]}$`).join(', '),
      params: { sommets, aretes, degres }
    }
  }
}

const grapheEulerien: ExerciseGenerator = {
  id: 'graphe-eulerien',
  category: 'Graphes',
  title: 'Graphe eulérien',
  description: 'Déterminer si un graphe est eulérien',
  difficulty: 2,
  chapter: 'graphes-introduction',
  generate: () => {
    // Cas prédéfinis pour garantir la cohérence
    const cases = [
      {
        sommets: ['A', 'B', 'C', 'D'],
        aretes: ['AB', 'BC', 'CD', 'DA', 'AC'],
        degres: { A: 3, B: 2, C: 3, D: 2 },
        eulerien: false,
        semiEulerien: true,
        raison: 'Le graphe a exactement 2 sommets de degré impair (A et C), donc il est semi-eulérien (chaîne eulérienne de A à C).'
      },
      {
        sommets: ['A', 'B', 'C', 'D'],
        aretes: ['AB', 'BC', 'CD', 'DA', 'AC', 'BD'],
        degres: { A: 3, B: 3, C: 3, D: 3 },
        eulerien: false,
        semiEulerien: false,
        raison: 'Le graphe a 4 sommets de degré impair, donc il n\'est ni eulérien ni semi-eulérien.'
      },
      {
        sommets: ['A', 'B', 'C', 'D'],
        aretes: ['AB', 'BC', 'CD', 'DA'],
        degres: { A: 2, B: 2, C: 2, D: 2 },
        eulerien: true,
        semiEulerien: true,
        raison: 'Tous les sommets sont de degré pair, donc le graphe est eulérien (cycle eulérien).'
      },
    ]

    const c = randChoice(cases)
    const sommetImpairs = Object.entries(c.degres).filter(([_, d]) => d % 2 === 1).map(([s, _]) => s)

    return {
      id: `graphe-euler-${Date.now()}`,
      category: 'Graphes',
      title: 'Graphe eulérien',
      difficulty: 2,
      statement: `Soit le graphe $G$ de sommets $\\{${c.sommets.join(', ')}\\}$ et d'arêtes $\\{${c.aretes.join(', ')}\\}$.\n\n` +
        `Le graphe est-il eulérien ? Semi-eulérien ?`,
      hints: [
        'Un graphe connexe est eulérien si tous ses sommets sont de degré pair',
        'Un graphe connexe est semi-eulérien s\'il a exactement 2 sommets de degré impair',
        'Calcule d\'abord le degré de chaque sommet',
      ],
      solution: `**Degrés** : ${c.sommets.map(s => `$d(${s}) = ${(c.degres as Record<string, number>)[s]}$`).join(', ')}\n\n` +
        `**Sommets de degré impair** : ${sommetImpairs.length === 0 ? 'aucun' : sommetImpairs.join(', ')} (${sommetImpairs.length} sommet(s))\n\n` +
        `**Conclusion** : ${c.raison}`,
      answer: c.eulerien ? 'Eulérien' : (c.semiEulerien ? 'Semi-eulérien' : 'Ni eulérien ni semi-eulérien'),
      params: c
    }
  }
}

const grapheColoration: ExerciseGenerator = {
  id: 'graphe-coloration',
  category: 'Graphes',
  title: 'Coloration de graphe',
  description: 'Trouver le nombre chromatique',
  difficulty: 3,
  chapter: 'graphes-parcours',
  generate: () => {
    const cases = [
      {
        nom: 'cycle à 4 sommets (C₄)',
        sommets: ['A', 'B', 'C', 'D'],
        aretes: ['AB', 'BC', 'CD', 'DA'],
        chi: 2,
        coloration: { A: 1, B: 2, C: 1, D: 2 },
        explication: 'C\'est un cycle pair, donc $\\chi(G) = 2$.'
      },
      {
        nom: 'cycle à 5 sommets (C₅)',
        sommets: ['A', 'B', 'C', 'D', 'E'],
        aretes: ['AB', 'BC', 'CD', 'DE', 'EA'],
        chi: 3,
        coloration: { A: 1, B: 2, C: 1, D: 2, E: 3 },
        explication: 'C\'est un cycle impair, donc $\\chi(G) = 3$.'
      },
      {
        nom: 'graphe complet K₄',
        sommets: ['A', 'B', 'C', 'D'],
        aretes: ['AB', 'AC', 'AD', 'BC', 'BD', 'CD'],
        chi: 4,
        coloration: { A: 1, B: 2, C: 3, D: 4 },
        explication: 'C\'est un graphe complet à 4 sommets, donc $\\chi(K_4) = 4$.'
      },
    ]

    const c = randChoice(cases)
    const couleurs = ['rouge', 'bleu', 'vert', 'jaune']

    return {
      id: `graphe-color-${Date.now()}`,
      category: 'Graphes',
      title: 'Coloration de graphe',
      difficulty: 3,
      statement: `Soit $G$ le ${c.nom} avec sommets $\\{${c.sommets.join(', ')}\\}$ et arêtes $\\{${c.aretes.join(', ')}\\}$.\n\n` +
        `Déterminer le nombre chromatique $\\chi(G)$ et donner une coloration optimale.`,
      hints: [
        'Le nombre chromatique est le plus petit nombre de couleurs nécessaires',
        'Deux sommets adjacents doivent avoir des couleurs différentes',
        'Pour un cycle pair : $\\chi = 2$, pour un cycle impair : $\\chi = 3$',
      ],
      solution: `${c.explication}\n\n` +
        `**Nombre chromatique** : $\\chi(G) = ${c.chi}$\n\n` +
        `**Coloration** :\n${c.sommets.map(s => `- ${s} : ${couleurs[(c.coloration as Record<string, number>)[s] - 1]}`).join('\n')}`,
      answer: `$\\chi(G) = ${c.chi}$`,
      params: c
    }
  }
}

const grapheDijkstra: ExerciseGenerator = {
  id: 'graphe-dijkstra',
  category: 'Graphes',
  title: 'Plus court chemin (Dijkstra)',
  description: 'Appliquer l\'algorithme de Dijkstra',
  difficulty: 4,
  chapter: 'graphes-parcours',
  generate: () => {
    // Graphe simple avec poids pour Dijkstra
    const cases = [
      {
        sommets: ['A', 'B', 'C', 'D'],
        aretes: [
          { de: 'A', vers: 'B', poids: 4 },
          { de: 'A', vers: 'C', poids: 2 },
          { de: 'B', vers: 'C', poids: 1 },
          { de: 'B', vers: 'D', poids: 5 },
          { de: 'C', vers: 'D', poids: 8 },
        ],
        depart: 'A',
        arrivee: 'D',
        distances: { A: 0, B: 3, C: 2, D: 8 },
        chemin: ['A', 'C', 'B', 'D'],
        longueur: 8
      },
      {
        sommets: ['A', 'B', 'C', 'D'],
        aretes: [
          { de: 'A', vers: 'B', poids: 1 },
          { de: 'A', vers: 'C', poids: 4 },
          { de: 'B', vers: 'C', poids: 2 },
          { de: 'B', vers: 'D', poids: 6 },
          { de: 'C', vers: 'D', poids: 3 },
        ],
        depart: 'A',
        arrivee: 'D',
        distances: { A: 0, B: 1, C: 3, D: 6 },
        chemin: ['A', 'B', 'C', 'D'],
        longueur: 6
      },
    ]

    const c = randChoice(cases)
    const aretesStr = c.aretes.map(a => `${a.de}${a.vers}(${a.poids})`).join(', ')

    return {
      id: `graphe-dijkstra-${Date.now()}`,
      category: 'Graphes',
      title: 'Algorithme de Dijkstra',
      difficulty: 4,
      statement: `Soit le graphe pondéré $G$ avec sommets $\\{${c.sommets.join(', ')}\\}$ et arêtes pondérées $\\{${aretesStr}\\}$.\n\n` +
        `Appliquer l'algorithme de Dijkstra pour trouver le plus court chemin de ${c.depart} à ${c.arrivee}.`,
      hints: [
        'Initialise les distances : 0 pour le départ, +∞ pour les autres',
        'À chaque étape, choisis le sommet non visité de plus petite distance',
        'Mets à jour les distances des voisins si un chemin plus court est trouvé',
      ],
      solution: `**Algorithme de Dijkstra** :\n\n` +
        `Distances finales depuis ${c.depart} :\n` +
        `${c.sommets.map(s => `- $d(${s}) = ${(c.distances as Record<string, number>)[s]}$`).join('\n')}\n\n` +
        `**Plus court chemin** de ${c.depart} à ${c.arrivee} : ${c.chemin.join(' → ')}\n\n` +
        `**Longueur** : ${c.longueur}`,
      answer: `Chemin : ${c.chemin.join(' → ')}, Longueur : ${c.longueur}`,
      params: c
    }
  }
}

// Liste de tous les générateurs
export const generators: ExerciseGenerator[] = [
  // Dérivation
  derivationPolynome,
  derivationQuotient,
  derivationComposee,
  // Suites
  suiteArithmetique,
  suiteGeometrique,
  // Limites
  limitePolynome,
  limiteQuotient,
  // Intégrales
  integralePolynome,
  // Probabilités
  probabiliteBinomiale,
  probabiliteEsperance,
  // Combinatoire
  combinatoireCoeffBinomial,
  combinatoireDenombrement,
  // Équations différentielles
  equaDiffPremierOrdre,
  equaDiffAvecSecondMembre,
  // Complexes
  complexeModule,
  complexeOperations,
  // Exponentielle / Logarithme
  exponentielleEquation,
  logarithmeEquation,
  // Trigonométrie
  trigoEquation,
  // Primitives
  primitivePuissance,
  primitiveExponentielle,
  // Continuité
  continuitePoint,
  continuiteIntervalle,
  // Convexité
  convexiteEtude,
  convexiteInegalite,
  // Loi normale
  loiNormaleCalcul,
  loiNormaleNonCentree,
  // Récurrence
  recurrenceSomme,
  recurrenceInegalite,
  // Arithmétique
  arithmetiquePGCD,
  arithmetiqueCongruence,
  arithmetiqueBezout,
  // Matrices
  matriceOperations,
  matriceDeterminant,
  // Géométrie dans l'espace
  geometrieVecteurs,
  geometriePlanEquation,
  // Droites et plans
  droiteParametrique,
  intersectionDroitePlan,
  // Logique
  logiqueContraposee,
  logiqueReciproque,
  // Chaînes de Markov
  markovMatriceTransition,
  markovEtatStable,
  // Graphes
  grapheDegre,
  grapheEulerien,
  grapheColoration,
  grapheDijkstra,
]

// Grouper par chapitre
export const generatorsByChapter = generators.reduce((acc, gen) => {
  if (!acc[gen.chapter]) {
    acc[gen.chapter] = []
  }
  acc[gen.chapter].push(gen)
  return acc
}, {} as Record<string, ExerciseGenerator[]>)

// Grouper par catégorie
export const generatorsByCategory = generators.reduce((acc, gen) => {
  if (!acc[gen.category]) {
    acc[gen.category] = []
  }
  acc[gen.category].push(gen)
  return acc
}, {} as Record<string, ExerciseGenerator[]>)
