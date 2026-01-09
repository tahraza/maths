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
  params: Record<string, number | string>
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
