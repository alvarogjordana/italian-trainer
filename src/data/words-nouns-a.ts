import type { NonVerbEntry } from "@/lib/types";

export const nounsA: NonVerbEntry[] = [
  // food & drink
  { id: "n-a-001", italian: "pane", spanish: "pan", english: "bread", type: "noun", gender: "m", plural: "pani", notes: null, exampleIt: "Compro il pane fresco ogni mattina.", exampleEs: "Compro el pan fresco cada mañana.", tags: ["food"], cefr: "A1" },
  { id: "n-a-002", italian: "acqua", spanish: "agua", english: "water", type: "noun", gender: "f", plural: "acque", notes: null, exampleIt: "Vorrei un bicchiere d'acqua.", exampleEs: "Quisiera un vaso de agua.", tags: ["food"], cefr: "A1" },
  { id: "n-a-003", italian: "latte", spanish: "leche", english: "milk", type: "noun", gender: "m", plural: "latti", notes: null, exampleIt: "Bevo il latte a colazione.", exampleEs: "Bebo leche en el desayuno.", tags: ["food"], cefr: "A1" },
  { id: "n-a-004", italian: "vino", spanish: "vino", english: "wine", type: "noun", gender: "m", plural: "vini", notes: null, exampleIt: "Preferisco il vino rosso.", exampleEs: "Prefiero el vino tinto.", tags: ["food"], cefr: "A1" },
  { id: "n-a-005", italian: "mela", spanish: "manzana", english: "apple", type: "noun", gender: "f", plural: "mele", notes: null, exampleIt: "Mangio una mela ogni giorno.", exampleEs: "Como una manzana cada día.", tags: ["food"], cefr: "A1" },
  { id: "n-a-006", italian: "formaggio", spanish: "queso", english: "cheese", type: "noun", gender: "m", plural: "formaggi", notes: null, exampleIt: "Questo formaggio è molto buono.", exampleEs: "Este queso está muy bueno.", tags: ["food"], cefr: "A1" },
  { id: "n-a-007", italian: "carne", spanish: "carne", english: "meat", type: "noun", gender: "f", plural: "carni", notes: null, exampleIt: "Non mangio molta carne.", exampleEs: "No como mucha carne.", tags: ["food"], cefr: "A1" },
  { id: "n-a-008", italian: "uovo", spanish: "huevo", english: "egg", type: "noun", gender: "m", plural: "uova", notes: "Plurale irregolare: femminile 'le uova'.", exampleIt: "Ho comprato una dozzina di uova.", exampleEs: "He comprado una docena de huevos.", tags: ["food"], cefr: "A1" },
  { id: "n-a-009", italian: "zucchero", spanish: "azúcar", english: "sugar", type: "noun", gender: "m", plural: "zuccheri", notes: null, exampleIt: "Prendi lo zucchero nel caffè?", exampleEs: "¿Tomas azúcar en el café?", tags: ["food"], cefr: "A2" },
  { id: "n-a-010", italian: "verdura", spanish: "verdura", english: "vegetable", type: "noun", gender: "f", plural: "verdure", notes: null, exampleIt: "Mangia più verdura!", exampleEs: "¡Come más verdura!", tags: ["food"], cefr: "A2" },

  // kitchen / table
  { id: "n-a-011", italian: "cucchiaio", spanish: "cuchara", english: "spoon", type: "noun", gender: "m", plural: "cucchiai", notes: null, exampleIt: "Mi passi un cucchiaio, per favore?", exampleEs: "¿Me pasas una cuchara, por favor?", tags: ["home"], cefr: "A1" },
  { id: "n-a-012", italian: "coltello", spanish: "cuchillo", english: "knife", type: "noun", gender: "m", plural: "coltelli", notes: null, exampleIt: "Il coltello è molto affilato.", exampleEs: "El cuchillo está muy afilado.", tags: ["home"], cefr: "A1" },
  { id: "n-a-013", italian: "forchetta", spanish: "tenedor", english: "fork", type: "noun", gender: "f", plural: "forchette", notes: null, exampleIt: "Manca una forchetta sulla tavola.", exampleEs: "Falta un tenedor en la mesa.", tags: ["home"], cefr: "A1" },
  { id: "n-a-014", italian: "bicchiere", spanish: "vaso", english: "glass", type: "noun", gender: "m", plural: "bicchieri", notes: null, exampleIt: "Ho rotto un bicchiere.", exampleEs: "He roto un vaso.", tags: ["home"], cefr: "A1" },
  { id: "n-a-015", italian: "piatto", spanish: "plato", english: "plate", type: "noun", gender: "m", plural: "piatti", notes: null, exampleIt: "Metti i piatti nella lavastoviglie.", exampleEs: "Pon los platos en el lavavajillas.", tags: ["home"], cefr: "A1" },
  { id: "n-a-016", italian: "tazza", spanish: "taza", english: "cup", type: "noun", gender: "f", plural: "tazze", notes: null, exampleIt: "Bevo una tazza di tè.", exampleEs: "Bebo una taza de té.", tags: ["home"], cefr: "A1" },
  { id: "n-a-017", italian: "pentola", spanish: "olla", english: "pot", type: "noun", gender: "f", plural: "pentole", notes: null, exampleIt: "L'acqua bolle nella pentola.", exampleEs: "El agua hierve en la olla.", tags: ["home"], cefr: "A2" },
  { id: "n-a-018", italian: "bottiglia", spanish: "botella", english: "bottle", type: "noun", gender: "f", plural: "bottiglie", notes: null, exampleIt: "Apri la bottiglia di vino.", exampleEs: "Abre la botella de vino.", tags: ["home"], cefr: "A1" },

  // home & furniture
  { id: "n-a-019", italian: "casa", spanish: "casa", english: "house", type: "noun", gender: "f", plural: "case", notes: null, exampleIt: "La mia casa è vicino al parco.", exampleEs: "Mi casa está cerca del parque.", tags: ["home"], cefr: "A1" },
  { id: "n-a-020", italian: "tavolo", spanish: "mesa", english: "table", type: "noun", gender: "m", plural: "tavoli", notes: null, exampleIt: "Il libro è sul tavolo.", exampleEs: "El libro está sobre la mesa.", tags: ["home"], cefr: "A1" },
  { id: "n-a-021", italian: "sedia", spanish: "silla", english: "chair", type: "noun", gender: "f", plural: "sedie", notes: null, exampleIt: "Siediti su questa sedia.", exampleEs: "Siéntate en esta silla.", tags: ["home"], cefr: "A1" },
  { id: "n-a-022", italian: "letto", spanish: "cama", english: "bed", type: "noun", gender: "m", plural: "letti", notes: null, exampleIt: "Vado a letto presto stasera.", exampleEs: "Me voy a la cama temprano esta noche.", tags: ["home"], cefr: "A1" },
  { id: "n-a-023", italian: "porta", spanish: "puerta", english: "door", type: "noun", gender: "f", plural: "porte", notes: null, exampleIt: "Chiudi la porta, per favore.", exampleEs: "Cierra la puerta, por favor.", tags: ["home"], cefr: "A1" },
  { id: "n-a-024", italian: "finestra", spanish: "ventana", english: "window", type: "noun", gender: "f", plural: "finestre", notes: null, exampleIt: "Apri la finestra, fa caldo.", exampleEs: "Abre la ventana, hace calor.", tags: ["home"], cefr: "A1" },
  { id: "n-a-025", italian: "chiave", spanish: "llave", english: "key", type: "noun", gender: "f", plural: "chiavi", notes: null, exampleIt: "Ho perso le chiavi di casa.", exampleEs: "He perdido las llaves de casa.", tags: ["home"], cefr: "A1" },
  { id: "n-a-026", italian: "camera", spanish: "habitación", english: "room", type: "noun", gender: "f", plural: "camere", notes: null, exampleIt: "La mia camera è al secondo piano.", exampleEs: "Mi habitación está en el segundo piso.", tags: ["home"], cefr: "A1" },
  { id: "n-a-027", italian: "armadio", spanish: "armario", english: "wardrobe", type: "noun", gender: "m", plural: "armadi", notes: null, exampleIt: "Metti i vestiti nell'armadio.", exampleEs: "Pon la ropa en el armario.", tags: ["home"], cefr: "A2" },

  // clothing
  { id: "n-a-028", italian: "camicia", spanish: "camisa", english: "shirt", type: "noun", gender: "f", plural: "camicie", notes: null, exampleIt: "Porta una camicia bianca.", exampleEs: "Lleva una camisa blanca.", tags: ["clothing"], cefr: "A1" },
  { id: "n-a-029", italian: "pantaloni", spanish: "pantalones", english: "trousers", type: "noun", gender: "m", plural: "pantaloni", notes: "Usato di solito al plurale.", exampleIt: "Questi pantaloni sono troppo lunghi.", exampleEs: "Estos pantalones son demasiado largos.", tags: ["clothing"], cefr: "A1" },
  { id: "n-a-030", italian: "scarpa", spanish: "zapato", english: "shoe", type: "noun", gender: "f", plural: "scarpe", notes: null, exampleIt: "Ho comprato delle scarpe nuove.", exampleEs: "He comprado unos zapatos nuevos.", tags: ["clothing"], cefr: "A1" },
  { id: "n-a-031", italian: "vestito", spanish: "vestido", english: "dress", type: "noun", gender: "m", plural: "vestiti", notes: null, exampleIt: "Indossa un vestito elegante.", exampleEs: "Lleva un vestido elegante.", tags: ["clothing"], cefr: "A1" },
  { id: "n-a-032", italian: "cappello", spanish: "sombrero", english: "hat", type: "noun", gender: "m", plural: "cappelli", notes: null, exampleIt: "Mette il cappello quando fa freddo.", exampleEs: "Se pone el sombrero cuando hace frío.", tags: ["clothing"], cefr: "A2" },
  { id: "n-a-033", italian: "giacca", spanish: "chaqueta", english: "jacket", type: "noun", gender: "f", plural: "giacche", notes: null, exampleIt: "Prendi la giacca, fa freddo.", exampleEs: "Coge la chaqueta, hace frío.", tags: ["clothing"], cefr: "A2" },
  { id: "n-a-034", italian: "gonna", spanish: "falda", english: "skirt", type: "noun", gender: "f", plural: "gonne", notes: null, exampleIt: "La gonna è troppo corta.", exampleEs: "La falda es demasiado corta.", tags: ["clothing"], cefr: "A2" },
  { id: "n-a-035", italian: "calza", spanish: "calcetín", english: "sock", type: "noun", gender: "f", plural: "calze", notes: null, exampleIt: "Non trovo l'altra calza.", exampleEs: "No encuentro el otro calcetín.", tags: ["clothing"], cefr: "A2" },

  // body parts
  { id: "n-a-036", italian: "mano", spanish: "mano", english: "hand", type: "noun", gender: "f", plural: "mani", notes: "Femminile con plurale irregolare 'le mani'.", exampleIt: "Lavati le mani prima di mangiare.", exampleEs: "Lávate las manos antes de comer.", tags: ["body"], cefr: "A1" },
  { id: "n-a-037", italian: "occhio", spanish: "ojo", english: "eye", type: "noun", gender: "m", plural: "occhi", notes: null, exampleIt: "Ha gli occhi azzurri.", exampleEs: "Tiene los ojos azules.", tags: ["body"], cefr: "A1" },
  { id: "n-a-038", italian: "braccio", spanish: "brazo", english: "arm", type: "noun", gender: "m", plural: "braccia", notes: "Plurale femminile irregolare 'le braccia'.", exampleIt: "Mi fa male il braccio destro.", exampleEs: "Me duele el brazo derecho.", tags: ["body"], cefr: "A2" },
  { id: "n-a-039", italian: "gamba", spanish: "pierna", english: "leg", type: "noun", gender: "f", plural: "gambe", notes: null, exampleIt: "Si è rotto una gamba.", exampleEs: "Se ha roto una pierna.", tags: ["body"], cefr: "A1" },
  { id: "n-a-040", italian: "piede", spanish: "pie", english: "foot", type: "noun", gender: "m", plural: "piedi", notes: null, exampleIt: "Vado a scuola a piedi.", exampleEs: "Voy a la escuela a pie.", tags: ["body"], cefr: "A1" },
  { id: "n-a-041", italian: "testa", spanish: "cabeza", english: "head", type: "noun", gender: "f", plural: "teste", notes: null, exampleIt: "Ho mal di testa.", exampleEs: "Tengo dolor de cabeza.", tags: ["body"], cefr: "A1" },
  { id: "n-a-042", italian: "bocca", spanish: "boca", english: "mouth", type: "noun", gender: "f", plural: "bocche", notes: null, exampleIt: "Apri la bocca, per favore.", exampleEs: "Abre la boca, por favor.", tags: ["body"], cefr: "A1" },
  { id: "n-a-043", italian: "dito", spanish: "dedo", english: "finger", type: "noun", gender: "m", plural: "dita", notes: "Plurale femminile irregolare 'le dita'.", exampleIt: "Mi sono tagliato un dito.", exampleEs: "Me he cortado un dedo.", tags: ["body"], cefr: "A2" },

  // health / medicine
  { id: "n-a-044", italian: "medico", spanish: "médico", english: "doctor", type: "noun", gender: "m", plural: "medici", notes: null, exampleIt: "Devo andare dal medico domani.", exampleEs: "Tengo que ir al médico mañana.", tags: ["health", "people"], cefr: "A1" },
  { id: "n-a-045", italian: "medicina", spanish: "medicina", english: "medicine", type: "noun", gender: "f", plural: "medicine", notes: null, exampleIt: "Prendi la medicina dopo i pasti.", exampleEs: "Toma la medicina después de las comidas.", tags: ["health"], cefr: "A2" },
  { id: "n-a-046", italian: "ospedale", spanish: "hospital", english: "hospital", type: "noun", gender: "m", plural: "ospedali", notes: null, exampleIt: "L'ospedale è lontano dal centro.", exampleEs: "El hospital está lejos del centro.", tags: ["health"], cefr: "A2" },
  { id: "n-a-047", italian: "febbre", spanish: "fiebre", english: "fever", type: "noun", gender: "f", plural: "febbri", notes: null, exampleIt: "Il bambino ha la febbre alta.", exampleEs: "El niño tiene fiebre alta.", tags: ["health"], cefr: "A2" },
  { id: "n-a-048", italian: "salute", spanish: "salud", english: "health", type: "noun", gender: "f", plural: "saluti", notes: null, exampleIt: "La salute è la cosa più importante.", exampleEs: "La salud es lo más importante.", tags: ["health"], cefr: "B1" },
  { id: "n-a-049", italian: "dolore", spanish: "dolor", english: "pain", type: "noun", gender: "m", plural: "dolori", notes: null, exampleIt: "Sento un forte dolore alla schiena.", exampleEs: "Siento un fuerte dolor en la espalda.", tags: ["health"], cefr: "B1" },

  // family & people
  { id: "n-a-050", italian: "madre", spanish: "madre", english: "mother", type: "noun", gender: "f", plural: "madri", notes: null, exampleIt: "Mia madre cucina benissimo.", exampleEs: "Mi madre cocina muy bien.", tags: ["family", "people"], cefr: "A1" },
  { id: "n-a-051", italian: "padre", spanish: "padre", english: "father", type: "noun", gender: "m", plural: "padri", notes: null, exampleIt: "Mio padre lavora in banca.", exampleEs: "Mi padre trabaja en un banco.", tags: ["family", "people"], cefr: "A1" },
  { id: "n-a-052", italian: "figlio", spanish: "hijo", english: "son", type: "noun", gender: "m", plural: "figli", notes: null, exampleIt: "Hanno due figli piccoli.", exampleEs: "Tienen dos hijos pequeños.", tags: ["family", "people"], cefr: "A1" },
  { id: "n-a-053", italian: "sorella", spanish: "hermana", english: "sister", type: "noun", gender: "f", plural: "sorelle", notes: null, exampleIt: "Mia sorella studia medicina.", exampleEs: "Mi hermana estudia medicina.", tags: ["family", "people"], cefr: "A1" },
  { id: "n-a-054", italian: "uomo", spanish: "hombre", english: "man", type: "noun", gender: "m", plural: "uomini", notes: "Plurale irregolare 'gli uomini'.", exampleIt: "Quell'uomo è molto gentile.", exampleEs: "Ese hombre es muy amable.", tags: ["people"], cefr: "A1" },
  { id: "n-a-055", italian: "donna", spanish: "mujer", english: "woman", type: "noun", gender: "f", plural: "donne", notes: null, exampleIt: "È una donna molto intelligente.", exampleEs: "Es una mujer muy inteligente.", tags: ["people"], cefr: "A1" },
];
