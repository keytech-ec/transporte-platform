// Lista de ciudades principales de Ecuador
export const ecuadorLocations = [
  // Costa
  'Guayaquil',
  'Manta',
  'Machala',
  'Portoviejo',
  'Esmeraldas',
  'Quevedo',
  'Milagro',
  'Santo Domingo',
  'Babahoyo',
  'Salinas',
  'Playas',
  'Atacames',
  'Montañita',
  'Puerto López',

  // Sierra
  'Quito',
  'Cuenca',
  'Ambato',
  'Riobamba',
  'Loja',
  'Ibarra',
  'Latacunga',
  'Tulcán',
  'Otavalo',
  'Guaranda',
  'Azogues',
  'Cañar',
  'Macas',
  'Zamora',
  'Cariamanga',
  'Catamayo',

  // Oriente
  'Tena',
  'Puyo',
  'Nueva Loja (Lago Agrio)',
  'Francisco de Orellana (Coca)',
  'Sucúa',
  'Gualaquiza',

  // Galápagos
  'Puerto Ayora',
  'Puerto Baquerizo Moreno',
  'Puerto Villamil',
];

// Exportar también como array de objetos con value y label para el combobox
export const locationOptions = ecuadorLocations.map(city => ({
  value: city,
  label: city,
}));
