import type { Estado } from '../types';

export const ESTADOS: Estado[] = [
  { id: 'AGS',  nombre: 'Aguascalientes',    abrev: 'Ags.',  titular: 'Lic. María Fernanda Lomelí Cervantes', correo: 'sesea@aguascalientes.gob.mx', tieneCRSF: true, tieneCS: true },
  { id: 'BC',   nombre: 'Baja California',   abrev: 'B.C.', titular: 'Lic. Carlos Eduardo Morán Figueroa',  correo: 'sesea@bajacalifornia.gob.mx', tieneCRSF: true, tieneCS: true },
  { id: 'BCS',  nombre: 'Baja California Sur', abrev: 'B.C.S.', titular: 'Lic. Rosa Isela Velázquez Soto', correo: 'sesea@bcs.gob.mx', tieneCRSF: false, tieneCS: true },
  { id: 'CAM',  nombre: 'Campeche',           abrev: 'Camp.', titular: 'Dr. Gustavo Adrián Pérez Maldonado', correo: 'sesea@campeche.gob.mx', tieneCRSF: false, tieneCS: true },
  { id: 'CHIS', nombre: 'Chiapas',            abrev: 'Chis.', titular: 'Mtra. Lucía del Carmen Ruiz Ortega', correo: 'sesea@chiapas.gob.mx', tieneCRSF: false, tieneCS: true },
  { id: 'CHIH', nombre: 'Chihuahua',          abrev: 'Chih.', titular: 'Lic. Rodrigo Mendoza Alvarado',      correo: 'sesea@chihuahua.gob.mx', tieneCRSF: false, tieneCS: true },
  { id: 'CDMX', nombre: 'Ciudad de México',   abrev: 'CDMX', titular: 'Mtra. Alejandra Nava Contreras',     correo: 'sesea@cdmx.gob.mx', tieneCRSF: true, tieneCS: true },
  { id: 'COAH', nombre: 'Coahuila',           abrev: 'Coah.', titular: 'Dr. Sergio Antonio Blanco Rivera',  correo: 'sesea@coahuila.gob.mx', tieneCRSF: false, tieneCS: true },
  { id: 'COL',  nombre: 'Colima',             abrev: 'Col.',  titular: 'Lic. Patricia Montoya Guzmán',      correo: 'sesea@colima.gob.mx', tieneCRSF: false, tieneCS: true },
  { id: 'DUR',  nombre: 'Durango',            abrev: 'Dgo.', titular: 'Lic. Eduardo Ramírez Saucedo',      correo: 'sesea@durango.gob.mx', tieneCRSF: true, tieneCS: true },
  { id: 'MEX',  nombre: 'Estado de México',   abrev: 'Méx.', titular: 'Mtra. Sandra Patricia Torres Reyes', correo: 'sesea@edomex.gob.mx', tieneCRSF: true, tieneCS: true },
  { id: 'GTO',  nombre: 'Guanajuato',         abrev: 'Gto.',  titular: 'Lic. Juan Pablo Herrera Acosta',   correo: 'sesea@guanajuato.gob.mx', tieneCRSF: true, tieneCS: true },
  { id: 'GRO',  nombre: 'Guerrero',           abrev: 'Gro.', titular: 'Lic. Beatriz Elena Suárez Pineda',  correo: 'sesea@guerrero.gob.mx', tieneCRSF: true, tieneCS: true },
  { id: 'HID',  nombre: 'Hidalgo',            abrev: 'Hgo.', titular: 'Dr. Miguel Ángel Espinoza Bernal',  correo: 'sesea@hidalgo.gob.mx', tieneCRSF: false, tieneCS: true },
  { id: 'JAL',  nombre: 'Jalisco',            abrev: 'Jal.',  titular: 'Mtra. Claudia Inés Vega Fuentes',  correo: 'sesea@jalisco.gob.mx', tieneCRSF: true, tieneCS: true },
  { id: 'MICH', nombre: 'Michoacán',          abrev: 'Mich.', titular: 'Lic. Arturo Villegas Cárdenas',    correo: 'sesea@michoacan.gob.mx', tieneCRSF: false, tieneCS: true },
  { id: 'MOR',  nombre: 'Morelos',            abrev: 'Mor.', titular: 'Mtra. Irene Castellanos Medina',    correo: 'sesea@morelos.gob.mx', tieneCRSF: true, tieneCS: true },
  { id: 'NAY',  nombre: 'Nayarit',            abrev: 'Nay.', titular: 'Lic. Roberto Cruz Jiménez',        correo: 'sesea@nayarit.gob.mx', tieneCRSF: true, tieneCS: true },
  { id: 'NL',   nombre: 'Nuevo León',         abrev: 'N.L.', titular: 'Dr. Jorge Luis Garza Treviño',     correo: 'sesea@nuevoleon.gob.mx', tieneCRSF: false, tieneCS: true },
  { id: 'OAX',  nombre: 'Oaxaca',             abrev: 'Oax.', titular: 'Mtra. Carmen Alejandra López Vidal', correo: 'sesea@oaxaca.gob.mx', tieneCRSF: true, tieneCS: true },
  { id: 'PUE',  nombre: 'Puebla',             abrev: 'Pue.', titular: 'Lic. Francisco Morales Aguilar',   correo: 'sesea@puebla.gob.mx', tieneCRSF: false, tieneCS: true },
  { id: 'QRO',  nombre: 'Querétaro',          abrev: 'Qro.', titular: 'Mtra. Valeria Sandoval Ibáñez',    correo: 'sesea@queretaro.gob.mx', tieneCRSF: false, tieneCS: true },
  { id: 'QROO', nombre: 'Quintana Roo',       abrev: 'Q.Roo.', titular: 'Lic. Daniel Ávila Peraza',      correo: 'sesea@quintanaroo.gob.mx', tieneCRSF: false, tieneCS: true },
  { id: 'SLP',  nombre: 'San Luis Potosí',    abrev: 'S.L.P.', titular: 'Mtra. Laura Verónica Nieto Bernal', correo: 'sesea@slp.gob.mx', tieneCRSF: true, tieneCS: true },
  { id: 'SIN',  nombre: 'Sinaloa',            abrev: 'Sin.',  titular: 'Lic. Héctor Manuel Castro Burgos', correo: 'sesea@sinaloa.gob.mx', tieneCRSF: false, tieneCS: true },
  { id: 'SON',  nombre: 'Sonora',             abrev: 'Son.', titular: 'Dr. Ernesto Valenzuela Ramos',     correo: 'sesea@sonora.gob.mx', tieneCRSF: false, tieneCS: true },
  { id: 'TAB',  nombre: 'Tabasco',            abrev: 'Tab.', titular: 'Mtra. Gloria Esperanza Rojas Méndez', correo: 'sesea@tabasco.gob.mx', tieneCRSF: false, tieneCS: false },
  { id: 'TAMPS', nombre: 'Tamaulipas',        abrev: 'Tamps.', titular: 'Lic. Ramón Flores de la Garza', correo: 'sesea@tamaulipas.gob.mx', tieneCRSF: false, tieneCS: true },
  { id: 'TLAX', nombre: 'Tlaxcala',           abrev: 'Tlax.', titular: 'Mtra. Gabriela Ximena Torres Luna', correo: 'sesea@tlaxcala.gob.mx', tieneCRSF: false, tieneCS: false },
  { id: 'VER',  nombre: 'Veracruz',           abrev: 'Ver.', titular: 'Dr. Alfredo Hernández Gutiérrez',  correo: 'sesea@veracruz.gob.mx', tieneCRSF: true, tieneCS: true },
  { id: 'YUC',  nombre: 'Yucatán',            abrev: 'Yuc.', titular: 'Mtra. Ángela Cetina Góngora',      correo: 'sesea@yucatan.gob.mx', tieneCRSF: false, tieneCS: true },
  { id: 'ZAC',  nombre: 'Zacatecas',          abrev: 'Zac.', titular: 'Lic. Jesús Alejandro Delgado Díaz', correo: 'sesea@zacatecas.gob.mx', tieneCRSF: false, tieneCS: true },
];

export function getEstado(id: string): Estado | undefined {
  return ESTADOS.find(e => e.id === id);
}
