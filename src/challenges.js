export const classificationItems = [
  [1, "F\u00e9mur", "appendicular", "femur", "Es el hueso del muslo: conecta la cadera con la rodilla y transmite grandes cargas."],
  [2, "Estern\u00f3n", "axial", "esternon", "Ocupa la l\u00ednea media anterior del t\u00f3rax y se articula con las costillas mediante cart\u00edlagos."],
  [3, "Esc\u00e1pula", "appendicular", "escapula", "Es un hueso plano y triangular de la cintura escapular que orienta los movimientos del hombro."],
  [4, "V\u00e9rtebra lumbar", "axial", "vertebra-lumbar", "Forma parte de la columna vertebral y soporta buena parte del peso del tronco."],
  [5, "H\u00famero", "appendicular", "humero", "Es el hueso del brazo y une funcionalmente el hombro con el codo."],
  [6, "Costilla", "axial", "costilla", "Integra la caja tor\u00e1cica, protege los \u00f3rganos del t\u00f3rax y se relaciona con la columna."],
  [7, "Mand\u00edbula", "axial", "mandibula", "Es el hueso m\u00f3vil de la cara que forma la parte inferior de la cavidad oral."],
  [8, "Tibia", "appendicular", "tibia", "Es el principal hueso de carga de la pierna entre la rodilla y el tobillo."],
  [9, "Clav\u00edcula", "appendicular", "clavicula", "Es el puntal curvo de la cintura escapular que conecta el miembro superior con el t\u00f3rax."],
  [10, "Sacro", "axial", "sacro", "Resulta de la fusi\u00f3n de cinco v\u00e9rtebras y transmite el peso de la columna hacia la pelvis."],
  [11, "Radio", "appendicular", "radio", "Se ubica en el lado lateral del antebrazo, alineado con el pulgar, y participa en pronaci\u00f3n y supinaci\u00f3n."],
  [12, "Occipital", "axial", "occipital", "Forma la regi\u00f3n posterior e inferior del cr\u00e1neo y rodea el foramen magno."],
];

export const regionSets = [
  ["A", "H\u00famero, radio, ulna, carpos, metacarpos y falanges"],
  ["B", "F\u00e9mur, patela, tibia, f\u00edbula, tarsos, metatarsos y falanges"],
  ["C", "Estern\u00f3n y costillas"],
  ["D", "Esc\u00e1pula y clav\u00edcula"],
  ["E", "Huesos que protegen el enc\u00e9falo"],
  ["F", "V\u00e9rtebras, sacro y c\u00f3ccix"],
  ["G", "Huesos coxales"],
];

export const regions = [
  ["Cr\u00e1neo", "E"],
  ["T\u00f3rax", "C"],
  ["Columna vertebral", "F"],
  ["Cintura escapular", "D"],
  ["Miembro superior", "A"],
  ["Cintura p\u00e9lvica", "G"],
  ["Miembro inferior", "B"],
];

export const movementCases = [
  {
    id: "lanzamiento",
    title: "Lanzamiento por encima de la cabeza",
    image: "lanzamiento-sobre-cabeza",
    prompt: "Selecciona estructuras clave del miembro superior y la cintura escapular.",
    options: ["H\u00famero", "Radio", "Ulna", "Esc\u00e1pula", "Clav\u00edcula", "Tibia", "Estern\u00f3n"],
    answers: ["H\u00famero", "Radio", "Ulna", "Esc\u00e1pula", "Clav\u00edcula"],
    minimum: 4,
  },
  {
    id: "salto",
    title: "Salto y aterrizaje",
    image: "salto-aterrizaje",
    prompt: "Selecciona huesos que reciben, transmiten o estabilizan la carga del miembro inferior.",
    options: ["F\u00e9mur", "Patela", "Tibia", "F\u00edbula", "Radio", "Clav\u00edcula", "Occipital"],
    answers: ["F\u00e9mur", "Patela", "Tibia", "F\u00edbula"],
    minimum: 3,
  },
  {
    id: "proteccion",
    title: "Golpe en el t\u00f3rax",
    image: "proteccion-torax",
    prompt: "Selecciona las estructuras \u00f3seas que protegen los \u00f3rganos tor\u00e1cicos.",
    options: ["Estern\u00f3n", "Costillas", "Carpos", "F\u00edbula", "Esc\u00e1pula"],
    answers: ["Estern\u00f3n", "Costillas"],
    minimum: 2,
  },
  {
    id: "postura",
    title: "Postura del tronco",
    image: "postura-tronco",
    prompt: "Selecciona estructuras del eje corporal relevantes para sostener y alinear el tronco.",
    options: ["V\u00e9rtebras", "Sacro", "Costillas", "Metacarpos", "F\u00e9mur", "Radio"],
    answers: ["V\u00e9rtebras", "Sacro", "Costillas"],
    minimum: 2,
  },
];

export const movementBoneImages = {
  "H\u00famero": "humero",
  Radio: "radio",
  Ulna: "ulna",
  "Esc\u00e1pula": "escapula",
  "Clav\u00edcula": "clavicula",
  Tibia: "tibia",
  "Estern\u00f3n": "esternon",
  "F\u00e9mur": "femur",
  Patela: "patela",
  "F\u00edbula": "fibula",
  Occipital: "occipital",
  Costillas: "costilla",
  Carpos: "carpos",
  "V\u00e9rtebras": "vertebra-lumbar",
  Sacro: "sacro",
  Metacarpos: "metacarpos",
};

export const mysteries = [
  {
    clue: "Soy largo, estoy en el muslo, soporto grandes cargas y conecto la cadera con la rodilla.",
    answer: ["femur"],
    system: "appendicular",
  },
  {
    clue: "Soy plano, estoy en el t\u00f3rax y me uno con las costillas mediante cart\u00edlago.",
    answer: ["esternon"],
    system: "axial",
  },
  {
    clue: "Soy parte de la cintura escapular y participo ampliamente en los movimientos del hombro.",
    answer: ["escapula", "omoplato"],
    system: "appendicular",
  },
  {
    clue: "Formo parte de la columna y mi foramen contribuye a proteger la m\u00e9dula espinal.",
    answer: ["vertebra"],
    system: "axial",
  },
  {
    clue: "Formo la regi\u00f3n posterior e inferior del cr\u00e1neo y rodeo el foramen magno.",
    answer: ["occipital"],
    system: "axial",
  },
];

export const challengeMeta = [
  {
    title: "Separaci\u00f3n de sistemas",
    short: "Axial o apendicular",
    description: "Clasifica doce huesos y recupera el primer c\u00f3digo.",
    specimen: "A/P",
  },
  {
    title: "Cartograf\u00eda corporal",
    short: "Regiones \u00f3seas",
    description: "Relaciona cada regi\u00f3n con su conjunto anat\u00f3mico.",
    specimen: "REG",
  },
  {
    title: "Carga y movimiento",
    short: "Anatom\u00eda funcional",
    description: "Conecta acciones deportivas con las estructuras implicadas.",
    specimen: "MOV",
  },
  {
    title: "Identificaci\u00f3n ciega",
    short: "Huesos misteriosos",
    description: "Interpreta pistas de ubicaci\u00f3n, forma y funci\u00f3n.",
    specimen: "ID",
  },
  {
    title: "Protocolo de salida",
    short: "Caso deportivo",
    description: "Integra el conocimiento en el an\u00e1lisis de un salto vertical.",
    specimen: "FIN",
  },
];
