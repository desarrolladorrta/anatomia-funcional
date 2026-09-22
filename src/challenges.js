export const classificationItems = [
  [1, "F\u00e9mur", "appendicular"],
  [2, "Estern\u00f3n", "axial"],
  [3, "Esc\u00e1pula", "appendicular"],
  [4, "V\u00e9rtebra lumbar", "axial"],
  [5, "H\u00famero", "appendicular"],
  [6, "Costilla", "axial"],
  [7, "Mand\u00edbula", "axial"],
  [8, "Tibia", "appendicular"],
  [9, "Clav\u00edcula", "appendicular"],
  [10, "Sacro", "axial"],
  [11, "Radio", "appendicular"],
  [12, "Occipital", "axial"],
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
    prompt: "Selecciona estructuras clave del miembro superior y la cintura escapular.",
    options: ["H\u00famero", "Radio", "Ulna", "Esc\u00e1pula", "Clav\u00edcula", "Tibia", "Estern\u00f3n"],
    answers: ["H\u00famero", "Radio", "Ulna", "Esc\u00e1pula", "Clav\u00edcula"],
    minimum: 4,
  },
  {
    id: "salto",
    title: "Salto y aterrizaje",
    prompt: "Selecciona huesos que reciben, transmiten o estabilizan la carga del miembro inferior.",
    options: ["F\u00e9mur", "Patela", "Tibia", "F\u00edbula", "Radio", "Clav\u00edcula", "Occipital"],
    answers: ["F\u00e9mur", "Patela", "Tibia", "F\u00edbula"],
    minimum: 3,
  },
  {
    id: "proteccion",
    title: "Golpe en el torax",
    prompt: "Selecciona las estructuras oseas que protegen los organos toracicos.",
    options: ["Estern\u00f3n", "Costillas", "Carpos", "F\u00edbula", "Esc\u00e1pula"],
    answers: ["Estern\u00f3n", "Costillas"],
    minimum: 2,
  },
  {
    id: "postura",
    title: "Postura del tronco",
    prompt: "Selecciona estructuras del eje corporal relevantes para sostener y alinear el tronco.",
    options: ["V\u00e9rtebras", "Sacro", "Costillas", "Metacarpos", "F\u00e9mur", "Radio"],
    answers: ["V\u00e9rtebras", "Sacro", "Costillas"],
    minimum: 2,
  },
];

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
