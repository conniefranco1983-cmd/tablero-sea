// Límites de caracteres por tipo de campo. El atributo `maxLength` frena la
// captura en el cliente y es la única defensa real: el informe se guarda como un
// blob JSON, así que Postgres no impone un `varchar(n)` por campo.
export const MAX = {
  nombre: 150,      // nombres, apellidos, cargo, institución, entidad, enlace, partida
  textoLinea: 255,  // campos descriptivos de una sola línea
  correo: 254,      // máximo del estándar (RFC 5321)
  url: 2048,        // convención de facto para ligas
  descripcion: 800,  // textareas con tope ya establecido
  evaluacion: 2000,  // textareas descriptivas de la evaluación (bloque J)
  textoLibre: 2500,  // textareas de texto libre extenso
} as const;
