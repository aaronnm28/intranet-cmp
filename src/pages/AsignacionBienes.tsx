import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ── Data ──────────────────────────────────────────────────────────────────────
type FlujoStatus = 'done' | 'active' | 'pending' | 'rejected'
interface FlujoStep { paso: number; label: string; actor: string; status: FlujoStatus; fecha: string; firmante: string; cargo: string }
interface Solicitud {
  n: string; bien: string; tipo: string; fecha: string; fechaEntrega: string
  areaEncargada: string; estado: string; estadoCls: string
  colaborador: string; dni: string; puesto: string; subArea: string; motivo: string
  observacion?: string; flujo: FlujoStep[]
}

const SOLICITUDES: Record<string, Solicitud> = {
  'SOL-2026-001': {
    n:'SOL-2026-001', bien:'Laptop HP EliteBook 840', tipo:'Cómputo',
    fecha:'10/03/2026', fechaEntrega:'—', areaEncargada:'TI', estado:'Pendiente', estadoCls:'b-red',
    colaborador:'Aaron Samuel Nuñez Muñoz', dni:'77434028', puesto:'Analista de Sistemas', subArea:'UN. DE TI',
    motivo:'Reposición de equipo de cómputo por falla técnica del equipo anterior.',
    flujo:[
      {paso:1,label:'Administración — Registro de solicitud',actor:'Administración',status:'done',fecha:'10/03/2026',firmante:'A. Chafloque',cargo:'Anali J. Chafloque Cordova — Asistente Administrativo'},
      {paso:2,label:'UN. DE TI — Validación y entrega del bien',actor:'UN. DE TI',status:'active',fecha:'—',firmante:'',cargo:'Jesús Luman Marcos Aragon — Jefe de TI'},
      {paso:3,label:'Administración — Entrega del bien al colaborador',actor:'Administración',status:'pending',fecha:'—',firmante:'',cargo:'Guissela Palacios Alvarez — Jefa de Administración'},
      {paso:4,label:'Colaborador — Conformidad de recepción',actor:'Colaborador',status:'pending',fecha:'—',firmante:'',cargo:'Aaron Samuel Nuñez Muñoz'},
    ],
  },
  'SOL-2026-002': {
    n:'SOL-2026-002', bien:'Silla ergonómica', tipo:'Mobiliario',
    fecha:'08/03/2026', fechaEntrega:'13/03/2026', areaEncargada:'Administración', estado:'Aprobado', estadoCls:'b-green',
    colaborador:'Carlos Pérez Ramos', dni:'45231089', puesto:'Analista Contable', subArea:'Contabilidad',
    motivo:'Necesidad de silla ergonómica por indicación médica documentada.',
    flujo:[
      {paso:1,label:'Administración — Registro de solicitud',actor:'Administración',status:'done',fecha:'08/03/2026',firmante:'A. Chafloque',cargo:'Anali J. Chafloque Cordova — Asistente Administrativo'},
      {paso:2,label:'Administración — Validación y entrega del bien',actor:'Administración',status:'done',fecha:'10/03/2026',firmante:'G. Palacios',cargo:'Guissela Palacios Alvarez — Jefa de Administración'},
      {paso:3,label:'Administración — Entrega del bien al colaborador',actor:'Administración',status:'done',fecha:'12/03/2026',firmante:'G. Palacios',cargo:'Guissela Palacios Alvarez — Jefa de Administración'},
      {paso:4,label:'Colaborador — Conformidad de recepción',actor:'Colaborador',status:'done',fecha:'12/03/2026',firmante:'Carlos Pérez Ramos',cargo:'Analista Contable — UN. DE CONTA'},
    ],
  },
  'SOL-2026-003': {
    n:'SOL-2026-003', bien:'Teléfono IP', tipo:'Comunicaciones',
    fecha:'05/03/2026', fechaEntrega:'—', areaEncargada:'Comunicaciones', estado:'Observado', estadoCls:'b-yellow',
    colaborador:'María Torres Huamán', dni:'32187654', puesto:'Especialista GDTH', subArea:'UN. DE GDTH',
    motivo:'Reposición de teléfono IP dañado por falla eléctrica.',
    observacion:'El área de Comunicaciones solicita especificación técnica del modelo requerido. Adjuntar ficha técnica del equipo.',
    flujo:[
      {paso:1,label:'Administración — Registro de solicitud',actor:'Administración',status:'done',fecha:'05/03/2026',firmante:'A. Chafloque',cargo:'Anali J. Chafloque Cordova — Asistente Administrativo'},
      {paso:2,label:'Comunicaciones — Validación del bien',actor:'Comunicaciones',status:'rejected',fecha:'07/03/2026',firmante:'Observado',cargo:'Área Comunicaciones — Imagen Institucional'},
      {paso:3,label:'Administración — Entrega del bien al colaborador',actor:'Administración',status:'pending',fecha:'—',firmante:'',cargo:'Guissela Palacios Alvarez — Jefa de Administración'},
      {paso:4,label:'Colaborador — Conformidad de recepción',actor:'Colaborador',status:'pending',fecha:'—',firmante:'',cargo:'María Torres Huamán — Especialista GDTH'},
    ],
  },
}

const COLABS: Record<string, { nombre:string; apellido:string; puesto:string; subarea:string; consejo:string; initials:string; relacionLaboral:string }> = {
  '77434028': {nombre:'Aaron Samuel',      apellido:'Nuñez Muñoz',          puesto:'Analista de TI',                        subarea:'UN. DE TI',             consejo:'Consejo Nacional',initials:'AN',relacionLaboral:'Planilla'},
  '72224207': {nombre:'Julieth Zenina',    apellido:'Carbajal Garro',        puesto:'Jefa de GDTH',                          subarea:'UN. DE GDTH',           consejo:'Consejo Nacional',initials:'JC',relacionLaboral:'Planilla'},
  '46521663': {nombre:'Jesús Luman',       apellido:'Marcos Aragon',         puesto:'Jefe de TI',                            subarea:'UN. DE TI',             consejo:'Consejo Nacional',initials:'JM',relacionLaboral:'Planilla'},
  '45103078': {nombre:'Nataly',            apellido:'De Rutte Vergara',      puesto:'Jefa de Planificación',                 subarea:'UN. DE PLANIFICACION',  consejo:'Consejo Nacional',initials:'ND',relacionLaboral:'Planilla'},
  '71926735': {nombre:'Marino Eduardo',    apellido:'Espinoza Vega',         puesto:'Jefa de Planificación',                 subarea:'UN. DE PLANIFICACION',  consejo:'Consejo Nacional',initials:'ME',relacionLaboral:'Planilla'},
  '71489337': {nombre:'Ariana Sarita',     apellido:'Alvines Zapata',        puesto:'Trabajadora Social',                    subarea:'UN. DE GDTH',           consejo:'Consejo Nacional',initials:'AA',relacionLaboral:'Planilla'},
  '45438744': {nombre:'Hamer',             apellido:'Chonlon Escudero',      puesto:'Analista de Planilla y Compensaciones', subarea:'UN. DE GDTH',           consejo:'Consejo Nacional',initials:'HC',relacionLaboral:'Planilla'},
  '40555090': {nombre:'Guissela Del Rocio',apellido:'Palacios Alvarez',      puesto:'Jefa de Administración',                subarea:'UN. DE ADM',            consejo:'Consejo Nacional',initials:'GP',relacionLaboral:'Planilla'},
  '48277741': {nombre:'Anali Jasmin',      apellido:'Chafloque Cordova',     puesto:'Asistente Administrativo',              subarea:'UN. DE ADM',            consejo:'Consejo Nacional',initials:'AC',relacionLaboral:'Planilla'},
  '47272523': {nombre:'Edwin Jesus',       apellido:'Chozo Santisteban',     puesto:'Contador General',                      subarea:'UN. DE CONTA',          consejo:'Consejo Nacional',initials:'EC',relacionLaboral:'Planilla'},
  '72651020': {nombre:'Maria del Rosario', apellido:'Rojas Gutierrez',       puesto:'Sub Contadora',                         subarea:'UN. DE CONTA',          consejo:'Consejo Nacional',initials:'MR',relacionLaboral:'Planilla'},
  '40812969': {nombre:'Santiago Masaichi', apellido:'Hayashi Delgado',       puesto:'Jefe de Patrimonio',                    subarea:'UN. DE PATR',           consejo:'Consejo Nacional',initials:'SH',relacionLaboral:'Planilla'},
  '10609810': {nombre:'David Augusto',     apellido:'Cadillo Alfaro',        puesto:'Analista de Activos Muebles',           subarea:'UN. DE PATR',           consejo:'Consejo Nacional',initials:'DC',relacionLaboral:'Planilla'},
  '43422937': {nombre:'David Leoncio',     apellido:'Salazar Ttito',         puesto:'Supervisor de Activos Muebles',         subarea:'UN. DE PATR',           consejo:'Consejo Nacional',initials:'DS',relacionLaboral:'Planilla'},
  '46832226': {nombre:'Percy Antonio',     apellido:'Calderón Quispe',       puesto:'Locador de Servicios',                  subarea:'UN. DE TI',             consejo:'Consejo Nacional',initials:'PC',relacionLaboral:'Locador de Servicios'},
}

const BIENES_DISP = [
  // ── CÓMPUTO ───────────────────────────────────────────────────────────────
  {id:'111025',icon:'💻',title:'Laptop — HP EliteBook 840',sub:'ID: 111025 · QR: CMP-038395 · Condición: Nuevo',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038395',marca:'HP',modelo:'EliteBook 840',estado:'Bueno',condicion:'Nuevo',area:'UN. DE TI',serie:'HP-00-2025-111025'},
  {id:'111033',icon:'💻',title:'Laptop — Dell Latitude 5540',sub:'ID: 111033 · QR: CMP-038404 · Condición: Nuevo',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038404',marca:'Dell',modelo:'Latitude 5540',estado:'Bueno',condicion:'Nuevo',area:'UN. DE TI',serie:'DELL-00-2025-111033'},
  {id:'111034',icon:'💻',title:'Laptop — Lenovo ThinkPad E14',sub:'ID: 111034 · QR: CMP-038405 · Condición: En Uso',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038405',marca:'Lenovo',modelo:'ThinkPad E14',estado:'Bueno',condicion:'En Uso',area:'UN. DE TI',serie:'LEN-00-2024-111034'},
  {id:'111035',icon:'🖥',title:'All In One — HP ProOne 440',sub:'ID: 111035 · QR: CMP-038406 · Condición: Nuevo',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038406',marca:'HP',modelo:'ProOne 440 G9',estado:'Bueno',condicion:'Nuevo',area:'UN. DE TI',serie:'HP-00-2025-111035'},
  {id:'111036',icon:'🖥',title:'All In One — Lenovo IdeaCentre AIO 3',sub:'ID: 111036 · QR: CMP-038407 · Condición: En Uso',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038407',marca:'Lenovo',modelo:'IdeaCentre AIO 3',estado:'Bueno',condicion:'En Uso',area:'UN. DE ADM',serie:'LEN-00-2024-111036'},
  {id:'111037',icon:'🖨',title:'Impresora — HP LaserJet M110w',sub:'ID: 111037 · QR: CMP-038408 · Condición: Nuevo',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038408',marca:'HP',modelo:'LaserJet M110w',estado:'Bueno',condicion:'Nuevo',area:'UN. DE ADM',serie:'HP-00-2025-111037'},
  {id:'111027',icon:'🖨',title:'Impresora Multifuncional — Epson L3150',sub:'ID: 111027 · QR: CMP-038397 · Condición: En Uso',badge:'b-yellow',badgeTxt:'En revisión',qr:'CMP-038397',marca:'Epson',modelo:'L3150',estado:'Regular',condicion:'En Uso',area:'UN. DE TI',serie:'EPS-00-2023-111027'},
  {id:'111038',icon:'🖨',title:'Impresora de Etiquetas — Brother QL-820NWB',sub:'ID: 111038 · QR: CMP-038409 · Condición: Nuevo',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038409',marca:'Brother',modelo:'QL-820NWB',estado:'Bueno',condicion:'Nuevo',area:'UN. DE PATR',serie:'BRO-00-2025-111038'},
  {id:'111039',icon:'🖨',title:'Escáner — HP ScanJet Pro 2500',sub:'ID: 111039 · QR: CMP-038410 · Condición: Nuevo',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038410',marca:'HP',modelo:'ScanJet Pro 2500',estado:'Bueno',condicion:'Nuevo',area:'UN. DE ADM',serie:'HP-00-2025-111039'},
  {id:'111040',icon:'📡',title:'Router — Cisco RV340W',sub:'ID: 111040 · QR: CMP-038411 · Condición: En Uso',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038411',marca:'Cisco',modelo:'RV340W',estado:'Bueno',condicion:'En Uso',area:'UN. DE TI',serie:'CIS-00-2024-111040'},
  {id:'111041',icon:'🔌',title:'Switch para Red — TP-Link TL-SG1024',sub:'ID: 111041 · QR: CMP-038412 · Condición: Nuevo',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038412',marca:'TP-Link',modelo:'TL-SG1024',estado:'Bueno',condicion:'Nuevo',area:'UN. DE TI',serie:'TPL-00-2025-111041'},
  {id:'111042',icon:'🔋',title:'Acumulador de Energía — UPS APC 600VA',sub:'ID: 111042 · QR: CMP-038413 · Condición: Nuevo',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038413',marca:'APC',modelo:'BX600CI-LM',estado:'Bueno',condicion:'Nuevo',area:'UN. DE TI',serie:'APC-00-2025-111042'},
  {id:'111029',icon:'📱',title:'Tablet — Samsung Galaxy Tab S7',sub:'ID: 111029 · QR: CMP-038399 · Condición: Nuevo',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038399',marca:'Samsung',modelo:'Galaxy Tab S7',estado:'Bueno',condicion:'Nuevo',area:'UN. DE TI',serie:'SAM-00-2025-111029'},
  {id:'111043',icon:'📱',title:'Tablet — iPad 10ª Generación',sub:'ID: 111043 · QR: CMP-038414 · Condición: Nuevo',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038414',marca:'Apple',modelo:'iPad A2696',estado:'Bueno',condicion:'Nuevo',area:'UN. DE TI',serie:'APL-00-2025-111043'},
  // ── COMUNICACIONES ────────────────────────────────────────────────────────
  {id:'111026',icon:'🖥',title:'Monitor — Samsung 27" S27A',sub:'ID: 111026 · QR: CMP-038396 · Condición: En Uso',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038396',marca:'Samsung',modelo:'27" S27A800',estado:'Bueno',condicion:'En Uso',area:'UN. DE TI',serie:'SAM-00-2024-111026'},
  {id:'111044',icon:'🖥',title:'Monitor — LG 27" 27UK850',sub:'ID: 111044 · QR: CMP-038415 · Condición: Nuevo',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038415',marca:'LG',modelo:'27UK850',estado:'Bueno',condicion:'Nuevo',area:'UN. DE TI',serie:'LG-00-2025-111044'},
  {id:'111028',icon:'📽',title:'Proyector Multimedia — Epson EB-X51',sub:'ID: 111028 · QR: CMP-038398 · Condición: En Uso',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038398',marca:'Epson',modelo:'EB-X51',estado:'Bueno',condicion:'En Uso',area:'UN. DE TI',serie:'EPS-00-2024-111028'},
  {id:'111045',icon:'📷',title:'Cámara Fotográfica — Canon EOS 90D',sub:'ID: 111045 · QR: CMP-038416 · Condición: Nuevo',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038416',marca:'Canon',modelo:'EOS 90D',estado:'Bueno',condicion:'Nuevo',area:'IMAGEN INSTITUCIONAL',serie:'CAN-00-2025-111045'},
  {id:'111046',icon:'📷',title:'Cámara de Videoconferencia — Logitech BRIO 4K',sub:'ID: 111046 · QR: CMP-038417 · Condición: Nuevo',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038417',marca:'Logitech',modelo:'BRIO 4K',estado:'Bueno',condicion:'Nuevo',area:'UN. DE TI',serie:'LOG-00-2025-111046'},
  {id:'111047',icon:'🎙',title:'Micrófono Inalámbrico de Solapa — Rode RodeLink',sub:'ID: 111047 · QR: CMP-038418 · Condición: En Uso',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038418',marca:'Rode',modelo:'RodeLink Filmmaker',estado:'Bueno',condicion:'En Uso',area:'IMAGEN INSTITUCIONAL',serie:'ROD-00-2024-111047'},
  {id:'111048',icon:'🔊',title:'Amplificador de Audio y Sonido — Yamaha MG10XU',sub:'ID: 111048 · QR: CMP-038419 · Condición: Nuevo',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038419',marca:'Yamaha',modelo:'MG10XU',estado:'Bueno',condicion:'Nuevo',area:'IMAGEN INSTITUCIONAL',serie:'YAM-00-2025-111048'},
  // ── MUEBLES Y MOBILIARIO ──────────────────────────────────────────────────
  {id:'111049',icon:'🪑',title:'Silla Giratoria Ergonómica — Marca HighBack',sub:'ID: 111049 · QR: CMP-038420 · Condición: Nuevo',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038420',marca:'HighBack',modelo:'HB-2025-EXEC',estado:'Bueno',condicion:'Nuevo',area:'UN. DE ADM',serie:'HBK-00-2025-111049'},
  {id:'111050',icon:'🪑',title:'Silla Plegable — Polipropileno reforzado',sub:'ID: 111050 · QR: CMP-038421 · Condición: Bueno',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038421',marca:'Genérica',modelo:'PF-FOLD-2024',estado:'Bueno',condicion:'En Uso',area:'UN. DE ADM',serie:'GEN-00-2024-111050'},
  {id:'111051',icon:'🗄',title:'Escritorio de Melamina — 1.50m L-Shape',sub:'ID: 111051 · QR: CMP-038422 · Condición: Nuevo',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038422',marca:'Madeform',modelo:'DESK-L150',estado:'Bueno',condicion:'Nuevo',area:'UN. DE ADM',serie:'MAD-00-2025-111051'},
  {id:'111052',icon:'🗄',title:'Escritorio — 1.20m recto melamina',sub:'ID: 111052 · QR: CMP-038423 · Condición: Bueno',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038423',marca:'Madeform',modelo:'DESK-R120',estado:'Bueno',condicion:'En Uso',area:'UN. DE ADM',serie:'MAD-00-2024-111052'},
  {id:'111053',icon:'🗂',title:'Archivador 4 Cajones — Metálico gris',sub:'ID: 111053 · QR: CMP-038424 · Condición: Nuevo',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038424',marca:'Acero Perú',modelo:'AC-4C-2025',estado:'Bueno',condicion:'Nuevo',area:'UN. DE ADM',serie:'ACP-00-2025-111053'},
  {id:'111054',icon:'🚿',title:'Extintor PQS 6kg — Certificado INDECI',sub:'ID: 111054 · QR: CMP-038425 · Condición: Nuevo',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038425',marca:'Cía. Extintores',modelo:'PQS-6KG',estado:'Bueno',condicion:'Nuevo',area:'UN. DE ADM',serie:'EXT-00-2025-111054'},
  {id:'111055',icon:'📺',title:'Televisor — Samsung 55" Crystal UHD',sub:'ID: 111055 · QR: CMP-038426 · Condición: Nuevo',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038426',marca:'Samsung',modelo:'55" TU8000',estado:'Bueno',condicion:'Nuevo',area:'UN. DE ADM',serie:'SAM-00-2025-111055'},
  {id:'111056',icon:'🔲',title:'Pizarra Acrílica — 1.20x0.90m con marco aluminio',sub:'ID: 111056 · QR: CMP-038427 · Condición: Nuevo',badge:'b-green',badgeTxt:'Disponible',qr:'CMP-038427',marca:'Genérica',modelo:'PZ-120X90',estado:'Bueno',condicion:'Nuevo',area:'UN. DE ADM',serie:'GEN-00-2025-111056'},
]

const ACCS_DISP = [
  {id:'26_ACC_000001',nombre:'Teclado Inalámbrico',marca:'Logitech',area:'UN. DE TI',estado:'b-green',estadoTxt:'Bueno',disp:'b-green',dispTxt:'Disponible'},
  {id:'26_ACC_000002',nombre:'Mouse Inalámbrico',marca:'Logitech',area:'UN. DE TI',estado:'b-green',estadoTxt:'Bueno',disp:'b-green',dispTxt:'Disponible'},
  {id:'26_ACC_000003',nombre:'Hub USB 4 puertos',marca:'Anker',area:'ADMINISTRACION',estado:'b-green',estadoTxt:'Bueno',disp:'b-green',dispTxt:'Disponible'},
  {id:'26_ACC_000004',nombre:'Webcam HD 1080p',marca:'Logitech',area:'UN. DE TI',estado:'b-green',estadoTxt:'Bueno',disp:'b-green',dispTxt:'Disponible'},
  {id:'26_ACC_000005',nombre:'Auriculares con micrófono',marca:'Sony',area:'UN. DE GDTH',estado:'b-yellow',estadoTxt:'Regular',disp:'b-yellow',dispTxt:'En revisión'},
  {id:'26_ACC_000009',nombre:'Lector de Código de Barras',marca:'Honeywell',area:'UN. DE PATR',estado:'b-green',estadoTxt:'Bueno',disp:'b-green',dispTxt:'Disponible'},
  {id:'26_ACC_000010',nombre:'Trípode para Cámara Fotográfica',marca:'Manfrotto',area:'IMAGEN INSTITUCIONAL',estado:'b-green',estadoTxt:'Bueno',disp:'b-green',dispTxt:'Disponible'},
  {id:'26_ACC_000011',nombre:'Micrófono de Solapa',marca:'Rode',area:'IMAGEN INSTITUCIONAL',estado:'b-green',estadoTxt:'Bueno',disp:'b-green',dispTxt:'Disponible'},
  {id:'26_ACC_000012',nombre:'Access Point Wireless',marca:'TP-Link',area:'UN. DE TI',estado:'b-green',estadoTxt:'Bueno',disp:'b-green',dispTxt:'Disponible'},
  {id:'26_ACC_000013',nombre:'Splitter HDMI 4 puertos',marca:'Genérica',area:'UN. DE TI',estado:'b-green',estadoTxt:'Bueno',disp:'b-green',dispTxt:'Disponible'},
  {id:'26_ACC_000014',nombre:'Cajonera Rodable 3 cajones',marca:'Madeform',area:'UN. DE ADM',estado:'b-green',estadoTxt:'Bueno',disp:'b-green',dispTxt:'Disponible'},
  {id:'26_ACC_000015',nombre:'Rack para Proyector',marca:'Genérica',area:'IMAGEN INSTITUCIONAL',estado:'b-yellow',estadoTxt:'Regular',disp:'b-yellow',dispTxt:'En revisión'},
]

const BIENES_ASIG = [
  {id:'111030',icon:'💻',title:'Laptop — Dell Latitude 5420',sub:'ID: 111030 · QR: CMP-038401 · Condición: En Uso',qr:'CMP-038401',marca:'Dell',modelo:'Latitude 5420',estado:'En Uso',condicion:'Bueno',area:'UN. DE TI',serie:'DELL-00-2024-111030'},
  {id:'111031',icon:'🖥️',title:'Monitor — LG 24" 24MK430H',sub:'ID: 111031 · QR: CMP-038402 · Condición: En Uso',qr:'CMP-038402',marca:'LG',modelo:'24MK430H',estado:'En Uso',condicion:'Bueno',area:'UN. DE TI',serie:'LG-00-2023-111031'},
  {id:'111032',icon:'📱',title:'Teléfono IP — Fanvil X4U',sub:'ID: 111032 · QR: CMP-038403 · Condición: Bueno',qr:'CMP-038403',marca:'Fanvil',modelo:'X4U',estado:'Bueno',condicion:'Bueno',area:'UN. DE TI',serie:'FAN-00-2024-111032'},
]
const ACCS_ASIG = [
  {id:'26_ACC_000006',nombre:'Teclado HP K1500',marca:'HP',area:'SEC. DE ADMINISTRACION',subarea:'UN. DE TI',estado:'b-green',estadoTxt:'Bueno'},
  {id:'26_ACC_000007',nombre:'Mouse Logitech M185',marca:'Logitech',area:'SEC. DE ADMINISTRACION',subarea:'UN. DE TI',estado:'b-green',estadoTxt:'Bueno'},
  {id:'26_ACC_000008',nombre:'Auriculares Jabra',marca:'Jabra',area:'SEC. DE ADMINISTRACION',subarea:'UN. DE TI',estado:'b-yellow',estadoTxt:'Regular'},
]
const REASI_ROWS = [
  {id:'111030',desc:'Laptop Dell Latitude 5420',tipo:'Bien',qr:'CMP-038401',estado:'Asignado'},
  {id:'111031',desc:'Monitor LG 24" 24MK430H',tipo:'Bien',qr:'CMP-038402',estado:'Asignado'},
  {id:'111032',desc:'Teléfono IP Fanvil X4U',tipo:'Bien',qr:'CMP-038403',estado:'Asignado'},
  {id:'26_ACC_000006',desc:'Teclado HP K1500',tipo:'Accesorio',qr:'26_ACC_000006',estado:'Asignado'},
  {id:'26_ACC_000007',desc:'Mouse Logitech M185',tipo:'Accesorio',qr:'26_ACC_000007',estado:'Asignado'},
  {id:'26_ACC_000008',desc:'Auriculares Jabra',tipo:'Accesorio',qr:'26_ACC_000008',estado:'Asignado'},
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function stepIcon(s: FlujoStatus) { return s==='done'?'✔':s==='active'?'⏳':s==='rejected'?'✕':'○' }
function stepCls(s: FlujoStatus)  { return s==='done'?'done':s==='active'?'cur':s==='rejected'?'cur':'pend' }

// ── Toast simple ──────────────────────────────────────────────────────────────
function useToast() {
  const [msg,setMsg] = useState('')
  const [vis,setVis] = useState(false)
  const show = (m:string) => { setMsg(m); setVis(true); setTimeout(()=>setVis(false),2500) }
  const el = vis ? <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'#1E1B4B',color:'white',padding:'10px 20px',borderRadius:8,fontSize:13,fontWeight:500,zIndex:9999,boxShadow:'0 4px 16px rgba(0,0,0,.25)',whiteSpace:'nowrap'}}>{msg}</div> : null
  return {show,el}
}

// ── Component ─────────────────────────────────────────────────────────────────
export function AsignacionBienes() {
  const toast = useToast()

  // main tabs
  const [tab, setTab] = useState<'mis'|'pendientes'|'historial'>('mis')

  // modals
  const [showNueva,       setShowNueva]       = useState(false)
  const [showDetalle,     setShowDetalle]     = useState(false)
  const [showConformidad, setShowConformidad] = useState(false)
  const [showDisp,        setShowDisp]        = useState(false)
  const [showReporte,     setShowReporte]     = useState(false)

  // detalle
  const [detSol, setDetSol] = useState<Solicitud|null>(null)
  const [detFirmas, setDetFirmas] = useState<Record<number,string>>({})

  // nueva solicitud modal
  const [nsTab,      setNsTab]      = useState<'bienes'|'accesorios'|'disponibles'|'asignaciones'|'reasignaciones'>('bienes')
  const [nsDni,      setNsDni]      = useState('')
  const [nsColab,    setNsColab]    = useState<typeof COLABS[string]|null>(null)
  const [nsDniErr,   setNsDniErr]   = useState(false)
  const [nsTipoBien, setNsTipoBien] = useState('')
  const [nsBienNom,  setNsBienNom]  = useState('')
  const [nsBienJust, setNsBienJust] = useState('')
  // disponibles sub-tab
  const [nsdTab,     setNsdTab]     = useState<'bienes'|'accs'>('bienes')
  const [nsdDetalle, setNsdDetalle] = useState<typeof BIENES_DISP[0]|null>(null)
  const [selBienes,  setSelBienes]  = useState<Set<string>>(new Set())
  const [selAccs,    setSelAccs]    = useState<Set<string>>(new Set())
  // accesorios form fields
  const [nsAccNom,   setNsAccNom]   = useState('')
  const [nsTipoAcc,  setNsTipoAcc]  = useState('')
  const [nsAccJust,  setNsAccJust]  = useState('')
  // detalle obs
  const [detObsTexts, setDetObsTexts] = useState<Record<number,string>>({})
  const [detShowObs,  setDetShowObs]  = useState<Record<number,boolean>>({})
  // email firma flow
  const [emailFirmaState, setEmailFirmaState] = useState<Record<number,{correoEnviado:boolean;confirmado:boolean;firmante:string;docAdjunto?:string;confNum?:string}>>({})
  const [showCorreoModal, setShowCorreoModal] = useState(false)
  const [confCounter,     setConfCounter]     = useState(1)
  const [pendingConfData, setPendingConfData] = useState<{num:string;nombre:string;puesto:string;correo:string}|null>(null)
  // detalle tab (bienes / accesorios)
  const [detTab,      setDetTab]      = useState<'bienes'|'accesorios'>('bienes')
  // asignaciones sub-tab
  const [nsaTab,     setNsaTab]     = useState<'bienes'|'accs'>('bienes')
  const [nsaDetalle, setNsaDetalle] = useState<typeof BIENES_ASIG[0]|null>(null)
  // reasignaciones
  const [reasigSel,  setReasigSel]  = useState<typeof REASI_ROWS[0]|null>(null)

  // configuración de reasignación modal
  const [showReasignacion, setShowReasignacion] = useState(false)
  const [reasigTab,        setReasigTab]        = useState<'reasignar'|'quitar'>('reasignar')
  const [reasigMotivo,     setReasigMotivo]     = useState('')
  const [reasigNuevoBien,  setReasigNuevoBien]  = useState('')
  const [reasigNuevoEst,   setReasigNuevoEst]   = useState('disponible')
  const [reasigMantFecha,  setReasigMantFecha]  = useState('')
  const [reasigMantResp,   setReasigMantResp]   = useState('')
  const [reasigDniDest,    setReasigDniDest]    = useState('')
  const [reasigObs,        setReasigObs]        = useState<Record<number,string>>({})
  const [reasigShowObs,    setReasigShowObs]    = useState<Record<number,boolean>>({})
  const [quitarMotivo,     setQuitarMotivo]     = useState('')
  const [quitarEstFinal,   setQuitarEstFinal]   = useState('disponible')
  const [quitarNotas,      setQuitarNotas]      = useState('')
  const [quitarObs,        setQuitarObs]        = useState<Record<number,string>>({})
  const [quitarShowObs,    setQuitarShowObs]    = useState<Record<number,boolean>>({})

  function openReasignacion() {
    setReasigTab('reasignar')
    setReasigMotivo(''); setReasigNuevoBien(''); setReasigNuevoEst('disponible')
    setReasigMantFecha(''); setReasigMantResp(''); setReasigDniDest('')
    setReasigObs({}); setReasigShowObs({})
    setQuitarMotivo(''); setQuitarEstFinal('disponible'); setQuitarNotas('')
    setQuitarObs({}); setQuitarShowObs({})
    setShowReasignacion(true)
  }

  // disponibilidad modal
  const [dispTab, setDispTab] = useState<'bienes'|'accs'>('bienes')

  // solicitudes desde supabase
  const [solicitudesDB, setSolicitudesDB] = useState<Array<{id:string;numero:string;bien_nombre:string;tipo:string;fecha_solicitud:string;estado:string;colaborador:string;area_encargada:string}>>([])

  useEffect(() => {
    supabase
      .from('solicitudes_asignacion')
      .select('id,numero,bien_nombre,tipo,fecha_solicitud,estado,colaborador,area_encargada')
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data && data.length > 0) setSolicitudesDB(data) })
  }, [])

  // flujo info
  const flujoAreaMap: Record<string,string> = { computo:'UN. DE TI', mobiliario:'Administración', comunicaciones:'Comunicaciones' }

  async function buscarColab() {
    const dni = nsDni.trim()
    // primero mock local
    const mock = COLABS[dni]
    if (mock) { setNsColab(mock); setNsDniErr(false); return }
    // luego Supabase
    const { data } = await supabase.from('colaboradores').select('*').eq('dni', dni).maybeSingle()
    if (data) {
      setNsColab({ nombre: data.nombres, apellido: data.apellidos, puesto: data.puesto ?? '—', subarea: data.area ?? '—', consejo: 'Consejo Nacional', initials: (data.nombres[0] + data.apellidos[0]).toUpperCase(), relacionLaboral: 'Planilla' })
      setNsDniErr(false)
    } else {
      setNsColab(null); setNsDniErr(true)
    }
  }

  function toggleBien(id:string) {
    setSelBienes(prev => { const s=new Set(prev); s.has(id)?s.delete(id):s.add(id); return s })
  }
  function toggleAcc(id:string) {
    setSelAccs(prev => { const s=new Set(prev); s.has(id)?s.delete(id):s.add(id); return s })
  }

  function openDetalle(id:string) {
    const d = SOLICITUDES[id]
    if (d) { setDetSol(d); setDetFirmas({}); setDetObsTexts({}); setDetShowObs({}); setDetTab('bienes'); setShowDetalle(true); return }
    // Construir desde registro DB
    const dbRec = solicitudesDB.find(s => s.numero === id)
    if (dbRec) {
      const estCls = dbRec.estado==='Aprobado'?'b-green':dbRec.estado==='Observado'||dbRec.estado==='Observación'?'b-yellow':'b-red'
      const sol: Solicitud = {
        n: dbRec.numero, bien: dbRec.bien_nombre, tipo: dbRec.tipo,
        fecha: dbRec.fecha_solicitud??'—', fechaEntrega:'—', areaEncargada: dbRec.area_encargada,
        estado: dbRec.estado, estadoCls: estCls,
        colaborador: dbRec.colaborador, dni:'—', puesto:'—', subArea:'—', motivo:'—',
        flujo:[
          {paso:1,label:'Administración — Registro de solicitud',actor:'Administración',status:'done',fecha:dbRec.fecha_solicitud??'—',firmante:'A. Chafloque',cargo:'Anali J. Chafloque Cordova — Asistente Administrativo'},
          {paso:2,label:`${dbRec.area_encargada} — Validación y entrega del bien`,actor:dbRec.area_encargada,status:dbRec.estado==='Aprobado'?'done':'active',fecha:'—',firmante:'',cargo:`Responsable ${dbRec.area_encargada}`},
          {paso:3,label:'Administración — Entrega del bien al colaborador',actor:'Administración',status:'pending',fecha:'—',firmante:'',cargo:'Guissela Palacios Alvarez — Jefa de Administración'},
          {paso:4,label:'Colaborador — Conformidad de recepción',actor:'Colaborador',status:'pending',fecha:'—',firmante:'',cargo:dbRec.colaborador},
        ],
      }
      setDetSol(sol); setDetFirmas({}); setDetObsTexts({}); setDetShowObs({}); setDetTab('bienes'); setShowDetalle(true)
    }
  }

  function registrarFirma(paso:number) {
    const val = detFirmas[paso]
    if (!val?.trim()) { toast.show('Escribe tu firma antes de registrar'); return }
    toast.show(`Firma registrada en Paso ${paso}`)
  }

  // ── Derived values for detalle modal ──────────────────────────────────────
  const detPartes   = detSol ? detSol.bien.split(' + ') : []
  const detBienItem = detPartes[0]?.trim() ?? ''
  const detAccItem  = detPartes.length > 1 ? detPartes.slice(1).join(' + ').trim() : null
  const detFlujoAcc: FlujoStep[] = detSol ? [
    {paso:1,label:'Administración — Registro del accesorio',actor:'Administración',status:'done',fecha:detSol.fecha,firmante:'A. Chafloque',cargo:'Anali J. Chafloque Cordova — Asistente Administrativo'},
    {paso:2,label:'Administración — Validación y entrega del accesorio',actor:'Administración',status:detSol.estado==='Aprobado'?'done':'active',fecha:detSol.estado==='Aprobado'?detSol.fecha:'—',firmante:detSol.estado==='Aprobado'?'G. Palacios':'',cargo:'Guissela Palacios Alvarez — Jefa de Administración'},
    {paso:3,label:'Administración — Entrega al colaborador',actor:'Administración',status:'pending',fecha:'—',firmante:'',cargo:'Guissela Palacios Alvarez — Jefa de Administración'},
    {paso:4,label:'Colaborador — Conformidad de recepción',actor:'Colaborador',status:'pending',fecha:'—',firmante:'',cargo:detSol?.colaborador??''},
  ] : []

  function renderFlujoBlocks(flujo: FlujoStep[], offset: number) {
    return (<>
      <div className="stepper" style={{marginBottom:16}}>
        {flujo.map((s,i) => (
          <>{i>0&&<div key={`c${offset+i}`} className={`step-conn${flujo[i-1].status==='done'?' done':''}`}/>}
          <div key={`s${offset+i}`} className="step">
            <div className={`step-circ ${stepCls(s.status)}`} style={s.status==='rejected'?{background:'#FEE2E2',borderColor:'#EF4444',color:'#EF4444'}:{}}>{stepIcon(s.status)}</div>
            <span className={`step-lbl ${stepCls(s.status)}`} style={{fontSize:10,textAlign:'center',maxWidth:58}}>{'Registro\nValidación\nEntrega\nConformidad'.split('\n')[i]}</span>
          </div></>
        ))}
      </div>
      <div className="section-title-sm">FLUJO DE APROBACIÓN</div>
      {flujo.map((s,i) => {
        const k = offset + i
        return (
          <div key={k} className="flow-step-block">
            <div className={`flow-step-hdr ${s.status==='done'?'done':s.status==='active'?'active':s.status==='rejected'?'rejected':'pending'}`}>
              <div className="text-sm fw-600">{s.status==='done'?'✅':s.status==='active'?'⏳':s.status==='rejected'?'❌':'🔒'} Paso {s.paso}: {s.label}</div>
              <span className="text-xs text-gray">{s.fecha}</span>
            </div>
            {s.status==='done' && (
              <div className="flow-step-body">
                <div style={{display:'flex',gap:24,flexWrap:'wrap',alignItems:'flex-end'}}>
                  <div><div className="firma-label" style={{textAlign:'left',marginBottom:4}}>Firmado por</div><div className="firma-box">{s.firmante}</div><div className="firma-label">{s.cargo}</div></div>
                  <div className="inv-field"><div className="lbl">Fecha</div><div className="val">{s.fecha}</div></div>
                </div>
                <div style={{marginTop:8}}><button className="btn btn-outline btn-xs" onClick={() => setDetShowObs(p=>({...p,[k]:!p[k]}))}>+ Observación</button></div>
                {detShowObs[k] && (<div style={{marginTop:8,background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:6,padding:'10px 12px'}}>
                  <div style={{fontSize:11,fontWeight:600,color:'#92400E',marginBottom:6}}>Registrar observación en este paso</div>
                  <textarea className="form-control" style={{fontSize:12,minHeight:60}} placeholder="Escribe la observación..."
                    value={detObsTexts[k]||''} onChange={e=>setDetObsTexts(p=>({...p,[k]:e.target.value}))} />
                  <button className="btn btn-sm" style={{marginTop:6,background:'#D97706',color:'white',border:'none',borderRadius:5,padding:'4px 12px',fontSize:12,cursor:'pointer'}}
                    onClick={() => { toast.show('Observación registrada'); setDetShowObs(p=>({...p,[k]:false})) }}>Guardar observación</button>
                </div>)}
              </div>
            )}
            {s.status==='active' && (
              <div className="flow-step-body">
                <div className="form-group" style={{marginBottom:8}}>
                  <label className="form-label" style={{fontSize:11}}>Firma digital — {s.cargo}</label>
                  <input type="text" className="form-control" placeholder="Escribe aquí tu firma..."
                    style={{fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:14,color:'#1E1B4B'}}
                    value={detFirmas[k]||''} onChange={e => setDetFirmas(p=>({...p,[k]:e.target.value}))} />
                </div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                  <button className="btn btn-primary btn-sm" onClick={() => registrarFirma(k)}>✔ Registrar firma</button>
                  {s.paso === 3 && (
                    emailFirmaState[k]?.correoEnviado
                      ? <span className="badge b-green" style={{fontSize:11}}>✅ {emailFirmaState[k]!.confNum} — enviado</span>
                      : <button className="btn btn-sm" style={{background:'#0EA5E9',color:'white',border:'none',borderRadius:6,padding:'4px 12px',fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',gap:4}}
                          onClick={() => {
                            const num = `CONF_2026_${String(confCounter).padStart(5,'0')}`
                            setConfCounter(c => c + 1)
                            const dni = detSol?.dni ?? ''
                            const colab = COLABS[dni]
                            const nombreColab = colab ? `${colab.nombre} ${colab.apellido}` : (detSol?.colaborador ?? '—')
                            const puestoColab = colab?.puesto ?? '—'
                            // Derivar email: primerNombre.primerApellido@cmp.org.pe (sin tildes)
                            const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
                            const palabras = nombreColab.split(' ')
                            const correoColab = `${norm(palabras[0])}.${norm(palabras[palabras.length >= 4 ? 2 : palabras.length >= 2 ? 1 : 0])}@cmp.org.pe`
                            setEmailFirmaState(p => ({...p,[k]:{correoEnviado:true,confirmado:false,firmante:'',confNum:num}}))
                            setPendingConfData({num, nombre:nombreColab, puesto:puestoColab, correo:correoColab})
                            setShowCorreoModal(true)
                          }}>
                          📧 Enviar correo para firma
                        </button>
                  )}
                  <button className="btn btn-outline btn-xs" onClick={() => setDetShowObs(p=>({...p,[k]:!p[k]}))}>+ Observación</button>
                </div>
                {detShowObs[k] && (<div style={{marginTop:8,background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:6,padding:'10px 12px'}}>
                  <textarea className="form-control" style={{fontSize:12,minHeight:60}} placeholder="Escribe la observación..."
                    value={detObsTexts[k]||''} onChange={e=>setDetObsTexts(p=>({...p,[k]:e.target.value}))} />
                  <button className="btn btn-sm" style={{marginTop:6,background:'#D97706',color:'white',border:'none',borderRadius:5,padding:'4px 12px',fontSize:12,cursor:'pointer'}}
                    onClick={() => { toast.show('Observación registrada'); setDetShowObs(p=>({...p,[k]:false})) }}>Guardar observación</button>
                </div>)}
              </div>
            )}
            {s.status==='rejected' && (
              <div className="flow-step-body">
                <div className="banner" style={{background:'#FEF2F2',color:'#991B1B',border:'1px solid #FCA5A5',fontSize:12}}>
                  ❌ Observado por {s.actor} el {s.fecha}.<br/>{detSol?.observacion||'Requiere subsanación antes de continuar.'}
                </div>
                <div style={{marginTop:8}}><button className="btn btn-outline btn-xs" onClick={() => setDetShowObs(p=>({...p,[k]:!p[k]}))}>+ Observación</button></div>
                {detShowObs[k] && (<div style={{marginTop:8,background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:6,padding:'10px 12px'}}>
                  <textarea className="form-control" style={{fontSize:12,minHeight:60}} placeholder="Escribe la observación..."
                    value={detObsTexts[k]||''} onChange={e=>setDetObsTexts(p=>({...p,[k]:e.target.value}))} />
                  <button className="btn btn-sm" style={{marginTop:6,background:'#D97706',color:'white',border:'none',borderRadius:5,padding:'4px 12px',fontSize:12,cursor:'pointer'}}
                    onClick={() => { toast.show('Observación registrada'); setDetShowObs(p=>({...p,[k]:false})) }}>Guardar observación</button>
                </div>)}
              </div>
            )}
            {s.status==='pending' && (() => {
              const correoDelPasoAnterior = emailFirmaState[k-1]
              const esPaso4 = s.paso === 4
              const yaConfirmado = emailFirmaState[k]?.confirmado
              if (esPaso4 && yaConfirmado) {
                const ef = emailFirmaState[k]!
                const colabPuesto = COLABS[detSol?.dni ?? '']?.puesto ?? s.cargo
                return (
                  <div className="flow-step-body">
                    <div style={{display:'flex',gap:24,flexWrap:'wrap',alignItems:'flex-end',marginBottom:8}}>
                      <div>
                        <div className="firma-label" style={{textAlign:'left',marginBottom:4,color:'#15803D',fontWeight:700,fontSize:10}}>COLABORADOR — FIRMA POR CORREO</div>
                        <div className="firma-box" style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#1E1B4B'}}>{ef.firmante}</div>
                        <div className="firma-label">{colabPuesto}</div>
                      </div>
                      <div className="inv-field">
                        <div className="lbl">Fecha de confirmación</div>
                        <div className="val">{new Date().toLocaleDateString('es-PE')}</div>
                      </div>
                      {ef.confNum && (
                        <div className="inv-field">
                          <div className="lbl">N° Conformidad</div>
                          <div className="val fw-600" style={{color:'#6B21A8'}}>{ef.confNum}</div>
                        </div>
                      )}
                    </div>
                    {ef.docAdjunto && (
                      <div style={{background:'#F0FDF4',border:'1px solid #86EFAC',borderRadius:6,padding:'10px 14px',fontSize:11,display:'flex',alignItems:'center',gap:10}}>
                        <span style={{fontSize:20}}>📄</span>
                        <div>
                          <div style={{fontWeight:700,color:'#15803D',marginBottom:2}}>Documento firmado</div>
                          <div style={{color:'#1E1B4B',fontWeight:600}}>{ef.docAdjunto}</div>
                          <div style={{color:'#6B7280',marginTop:2}}>Firmado en bloque: FIRMAS DEL ACTA › COLABORADOR - FIRMA POR CORREO</div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              }
              if (esPaso4 && correoDelPasoAnterior?.correoEnviado) {
                return (
                  <div className="flow-step-body">
                    <div style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:6,padding:'10px 12px',marginBottom:8}}>
                      <div style={{fontSize:12,fontWeight:600,color:'#1D4ED8',marginBottom:4}}>📧 Esperando confirmación del colaborador</div>
                      <div style={{fontSize:11,color:'#374151'}}>Se envió un correo con enlace de confirmación. El paso se habilitará automáticamente al confirmar.</div>
                    </div>
                    <button className="btn btn-sm" style={{background:'#6B21A8',color:'white',border:'none',borderRadius:6,padding:'5px 14px',fontSize:12,cursor:'pointer'}}
                      onClick={() => {
                        const dni = detSol?.dni ?? ''
                        const colab = COLABS[dni]
                        const nombreColab = colab ? `${colab.nombre} ${colab.apellido}` : (detSol?.colaborador ?? 'Colaborador')
                        setEmailFirmaState(p => ({
                          ...p,
                          [k]: {
                            ...p[k],
                            correoEnviado: true,
                            confirmado: true,
                            firmante: nombreColab,
                            docAdjunto: 'ACTA DE ENTREGA Y DEVOLUCIÓN DE BIENES — ENTREGA',
                          }
                        }))
                        toast.show('✅ Colaborador confirmó vía correo — firma registrada')
                      }}>
                      📲 Simular: Colaborador confirma desde correo
                    </button>
                    <button className="btn btn-outline btn-xs" style={{marginTop:6,marginLeft:8}} onClick={() => setDetShowObs(p=>({...p,[k]:!p[k]}))}>+ Observación</button>
                    {detShowObs[k] && (<div style={{marginTop:8,background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:6,padding:'10px 12px'}}>
                      <textarea className="form-control" style={{fontSize:12,minHeight:60}} placeholder="Escribe la observación..."
                        value={detObsTexts[k]||''} onChange={e=>setDetObsTexts(p=>({...p,[k]:e.target.value}))} />
                      <button className="btn btn-sm" style={{marginTop:6,background:'#D97706',color:'white',border:'none',borderRadius:5,padding:'4px 12px',fontSize:12,cursor:'pointer'}}
                        onClick={() => { toast.show('Observación registrada'); setDetShowObs(p=>({...p,[k]:false})) }}>Guardar observación</button>
                    </div>)}
                  </div>
                )
              }
              return (
                <div className="flow-step-body">
                  <p className="text-xs text-gray" style={{fontStyle:'italic'}}>🔒 Pendiente — se habilitará al completar el paso anterior.</p>
                  <button className="btn btn-outline btn-xs" style={{marginTop:6}} onClick={() => setDetShowObs(p=>({...p,[k]:!p[k]}))}>+ Observación</button>
                  {detShowObs[k] && (<div style={{marginTop:8,background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:6,padding:'10px 12px'}}>
                    <textarea className="form-control" style={{fontSize:12,minHeight:60}} placeholder="Escribe la observación..."
                      value={detObsTexts[k]||''} onChange={e=>setDetObsTexts(p=>({...p,[k]:e.target.value}))} />
                    <button className="btn btn-sm" style={{marginTop:6,background:'#D97706',color:'white',border:'none',borderRadius:5,padding:'4px 12px',fontSize:12,cursor:'pointer'}}
                      onClick={() => { toast.show('Observación registrada'); setDetShowObs(p=>({...p,[k]:false})) }}>Guardar observación</button>
                  </div>)}
                </div>
              )
            })()}
          </div>
        )
      })}
      <div style={{marginTop:16}}>
        <div className="section-title-sm">FIRMAS DEL PROCESO</div>
        <div style={{display:'grid',gridTemplateColumns:`repeat(${Math.min(flujo.length,4)},1fr)`,gap:10,marginTop:8}}>
          {flujo.map((s,i) => (
            <div key={`f${offset+i}`}>
              <div style={{fontSize:10,color:'#6B7280',marginBottom:4,fontWeight:600}}>{s.label.split('—')[0].trim()}</div>
              <div className="aprob-cell"><div className="aprob-zona">
                {s.status==='done'
                  ? <><span style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#1E1B4B',fontSize:13}}>{s.firmante}</span><div style={{fontSize:10,color:'#6B7280',marginTop:2}}>{s.cargo}</div><div style={{fontSize:10,color:'#6B7280'}}>{s.fecha}</div></>
                  : s.status==='active'
                    ? <><span style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#991B1B',fontSize:13}}>Pendiente</span><div style={{fontSize:10,color:'#9CA3AF',marginTop:2}}>—</div></>
                    : <><span style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#6B7280',fontSize:13}}>En espera</span><div style={{fontSize:10,color:'#9CA3AF',marginTop:2}}>—</div></>
                }
              </div></div>
            </div>
          ))}
        </div>
      </div>
    </>)
  }

  async function enviarSolicitud() {
    if (!nsColab) { toast.show('Busca un colaborador primero'); return }
    const tieneBien = nsBienNom.trim() || selBienes.size > 0
    const tieneAcc  = nsAccNom.trim()
    if (!tieneBien && !tieneAcc) { toast.show('Agrega al menos un bien o accesorio a la solicitud'); return }
    // Generar número correlativo
    const { count } = await supabase.from('solicitudes_asignacion').select('*', { count: 'exact', head: true })
    const num = `SOL-${new Date().getFullYear()}-${String((count ?? 0) + 1).padStart(3, '0')}`
    const bienLabel = nsBienNom || (selBienes.size > 0 ? [...selBienes].join(', ') : '')
    const accLabel  = nsAccNom.trim()
    const bienNombreCombinado = [bienLabel, accLabel].filter(Boolean).join(' + ')
    const tipoSol = tieneBien && tieneAcc ? 'Bienes y Accesorios' : tieneBien ? (nsTipoBien || 'computo') : 'Accesorio'
    const payload = {
      numero: num,
      colaborador_dni: nsDni.trim(),
      colaborador: `${nsColab.nombre} ${nsColab.apellido}`,
      bien_nombre: bienNombreCombinado,
      tipo: tipoSol,
      area_encargada: flujoAreaMap[nsTipoBien] ?? 'Administración',
      puesto: nsColab.puesto,
      sub_area: nsColab.subarea,
      motivo: nsBienJust,
      estado: 'En revisión',
    }
    const { data: newRec, error } = await supabase.from('solicitudes_asignacion').insert(payload).select().single()
    if (error) {
      toast.show(`Error: ${error.message}`)
      return
    }
    if (newRec) {
      setSolicitudesDB(prev => [{ id: newRec.id, numero: newRec.numero, bien_nombre: newRec.bien_nombre, tipo: newRec.tipo, fecha_solicitud: newRec.fecha_solicitud ?? new Date().toLocaleDateString('es-PE'), estado: newRec.estado, colaborador: newRec.colaborador, area_encargada: newRec.area_encargada }, ...prev])
    }
    toast.show(`✓ Solicitud ${num} enviada correctamente`)
    setShowNueva(false)
    setNsDni(''); setNsColab(null); setNsBienNom(''); setNsBienJust(''); setNsTipoBien('')
    setNsAccNom(''); setNsTipoAcc(''); setNsAccJust('')
    setSelBienes(new Set()); setSelAccs(new Set())
  }

  function generarPDF() {
    const w = window.open('','_blank','width=820,height:920')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Reporte Asignaciones CMP</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:12px;margin:0;background:#525659;display:flex;flex-direction:column;align-items:center;padding:20px 0}
      .toolbar{background:#3d3d3d;color:white;width:794px;display:flex;align-items:center;justify-content:space-between;padding:8px 16px;border-radius:4px 4px 0 0;font-size:13px;font-weight:500;margin-top:20px;box-sizing:border-box}
      .toolbar button{background:#6B21A8;color:white;border:none;border-radius:4px;padding:5px 12px;font-size:12px;cursor:pointer}
      .pdf{background:white;width:794px;min-height:1123px;padding:40px 48px;box-shadow:0 4px 20px rgba(0,0,0,.4);margin-bottom:16px;box-sizing:border-box}
      h2{font-size:18px;font-weight:700;color:#1E1B4B;margin:0 0 4px}
      .sub{font-size:11px;color:#6B7280;margin-bottom:20px;padding-bottom:12px;border-bottom:1.5px solid #E5E7EB}
      table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:16px}
      th,td{border:1px solid #D1D5DB;padding:6px 8px;text-align:left}
      th{background:#F3F4F6;font-weight:600}
      .logo-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
      .logo{font-weight:900;font-size:18px;color:#4A1272;border:2px solid #4A1272;border-radius:6px;padding:4px 10px}
      .org{font-size:10px;color:#6B7280;text-align:right}
      .aprob-zona{min-height:44px;display:flex;flex-direction:column;justify-content:center;padding:4px 6px;border:1px solid #E5E7EB;border-radius:5px}
      .f-done{font-family:Georgia,serif;font-style:italic;color:#1E1B4B;font-size:12px}
      .f-pend{font-family:Georgia,serif;font-style:italic;color:#991B1B;font-size:12px}
      .f-wait{font-family:Georgia,serif;font-style:italic;color:#6B7280;font-size:12px}
      .f-meta{font-size:10px;color:#6B7280;margin-top:1px}
      @media print{body{background:white;padding:0}.toolbar{display:none}.pdf{box-shadow:none;padding:20mm}}
    </style></head><body>
    <div class="toolbar"><span>📄 Reporte de Asignaciones — Intranet CMP</span><button onclick="window.print()">🖨 Imprimir / Guardar PDF</button></div>
    <div class="pdf">
      <div class="logo-row"><span class="logo">CMP</span><div class="org">Colegio Médico del Perú<br>Consejo Nacional</div></div>
      <h2>Reporte de Asignaciones</h2>
      <div class="sub">Colaborador: Aaron Samuel Nuñez Muñoz · DNI: 77434028 · Área: UN. DE TI<br>Generado el ${new Date().toLocaleDateString('es-PE',{day:'2-digit',month:'2-digit',year:'numeric'})} · Sistema Intranet CMP</div>
      <p style="font-size:12px;font-weight:600;color:#374151;margin-bottom:8px">📦 Bienes Asignados</p>
      <table>
        <thead><tr><th>ID</th><th>Descripción</th><th>QR</th><th>Condición</th><th>Custodio Responsable</th><th>Colaborador</th></tr></thead>
        <tbody>
          <tr><td>111030</td><td>Laptop Dell Latitude 5420</td><td>CMP-038401</td><td>Bueno</td>
            <td><div class="aprob-zona"><span class="f-done">G. Palacios</span><div class="f-meta">Jefa UN. Administración</div><div class="f-meta">28/03/2026</div></div></td>
            <td><div class="aprob-zona"><span class="f-done">Aaron N.</span><div class="f-meta">Analista de Sistemas — UN. DE TI</div><div class="f-meta">28/03/2026</div></div></td>
          </tr>
          <tr><td>111031</td><td>Monitor LG 24" 24MK430H</td><td>CMP-038402</td><td>Bueno</td>
            <td><div class="aprob-zona"><span class="f-done">G. Palacios</span><div class="f-meta">Jefa UN. Administración</div><div class="f-meta">28/03/2026</div></div></td>
            <td><div class="aprob-zona"><span class="f-done">Aaron N.</span><div class="f-meta">Analista de Sistemas — UN. DE TI</div><div class="f-meta">28/03/2026</div></div></td>
          </tr>
          <tr><td>111032</td><td>Teléfono IP Fanvil X4U</td><td>CMP-038403</td><td>Bueno</td>
            <td><div class="aprob-zona"><span class="f-done">G. Palacios</span><div class="f-meta">Jefa UN. Administración</div><div class="f-meta">28/03/2026</div></div></td>
            <td><div class="aprob-zona"><span class="f-pend">Pendiente</span><div class="f-meta">—</div></div></td>
          </tr>
        </tbody>
      </table>
      <p style="font-size:12px;font-weight:600;color:#374151;margin:16px 0 8px">🔌 Accesorios Asignados</p>
      <table>
        <thead><tr><th>ID</th><th>Nombre</th><th>Marca</th><th>Estado</th><th>Custodio Responsable</th><th>Colaborador</th></tr></thead>
        <tbody>
          <tr><td>2026_ADM_0003</td><td>Teclado HP K1500</td><td>HP</td><td>Bueno</td>
            <td><div class="aprob-zona"><span class="f-done">G. Palacios</span><div class="f-meta">Jefa UN. Administración</div><div class="f-meta">28/03/2026</div></div></td>
            <td><div class="aprob-zona"><span class="f-done">Aaron N.</span><div class="f-meta">Analista de Sistemas — UN. DE TI</div><div class="f-meta">28/03/2026</div></div></td>
          </tr>
          <tr><td>2026_ADM_0004</td><td>Mouse Logitech M185</td><td>Logitech</td><td>Bueno</td>
            <td><div class="aprob-zona"><span class="f-done">G. Palacios</span><div class="f-meta">Jefa UN. Administración</div><div class="f-meta">28/03/2026</div></div></td>
            <td><div class="aprob-zona"><span class="f-done">Aaron N.</span><div class="f-meta">Analista de Sistemas — UN. DE TI</div><div class="f-meta">28/03/2026</div></div></td>
          </tr>
          <tr><td>2026_ADM_0005</td><td>Auriculares Jabra</td><td>Jabra</td><td>Regular</td>
            <td><div class="aprob-zona"><span class="f-wait">En espera</span><div class="f-meta">—</div></div></td>
            <td><div class="aprob-zona"><span class="f-wait">En espera</span><div class="f-meta">—</div></div></td>
          </tr>
        </tbody>
      </table>
    </div></body></html>`)
    w.document.close()
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {toast.el}

      {/* ── PANTALLA PRINCIPAL ── */}
      <div className="breadcrumb">Gestión de Recursos › <span>Asignación de Bienes y Accesorios</span></div>
      <div className="page-header">
        <div>
          <div className="page-title">Asignación de Bienes y Accesorios</div>
          <div className="page-subtitle">Solicitud y seguimiento de bienes para colaboradores</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline btn-sm" onClick={() => setShowDisp(true)}>🔍 Consultar disponibilidad</button>
          <button className="btn btn-primary" onClick={() => setShowNueva(true)}>+ Nueva Solicitud</button>
        </div>
      </div>

      <div className="tabs">
        {(['mis','pendientes','historial'] as const).map(t => (
          <div key={t} className={`tab${tab===t?' active':''}`} onClick={() => setTab(t)}>
            {t==='mis'?'Mis Solicitudes':t==='pendientes'?'Pendientes de Aprobación':'Historial'}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>N° Solicitud</th><th>Bien / Accesorio solicitado</th><th>Tipo</th>
                <th>Fecha solicitud</th><th>Fecha de entrega</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudesDB.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>No hay solicitudes registradas</td></tr>
              )}
              {solicitudesDB.map(s => (
                <tr key={s.id}>
                  <td className="fw-600">{s.numero}</td>
                  <td>{s.bien_nombre}</td>
                  <td><span className="badge b-gray">{s.tipo}</span></td>
                  <td>{s.fecha_solicitud ?? '—'}</td>
                  <td className="text-gray">—</td>
                  <td><span className={`badge ${s.estado==='Aprobado'?'b-green':s.estado==='Observado'||s.estado==='Observación'?'b-yellow':'b-red'}`}>{s.estado}</span></td>
                  <td><div className="actions-cell"><button className="btn btn-gray btn-xs" onClick={() => openDetalle(s.numero)}>Ver detalle</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer">
          <div className="banner banner-purple">
            📋 Para solicitudes de bienes de cómputo, TI verificará disponibilidad. Para comunicaciones, el área de Comunicaciones gestionará el equipamiento.
          </div>
        </div>
      </div>
      <div className="text-xs text-gray mt-8" style={{fontStyle:'italic'}}>📌 Nota de diseño: Rol activo determina tabs visibles — usuario ve sus solicitudes, GDTH/Admin ven bandeja completa.</div>

      {/* ══════════════════════════════════════════════════════════════
           MODAL — Nueva Solicitud
         ══════════════════════════════════════════════════════════════ */}
      {showNueva && (
        <div className="modal-overlay" onClick={() => setShowNueva(false)}>
          <div className="modal-box" style={{maxWidth:680}} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <span className="modal-title">Nueva Solicitud de Asignación de Bienes y Accesorios</span>
                <div style={{fontSize:11,color:'#9CA3AF',marginTop:2}}>Rol: Administración — Asignación a colaborador</div>
              </div>
              <button className="modal-close" onClick={() => setShowNueva(false)}>×</button>
            </div>
            <div className="modal-body">

              {/* Buscar colaborador */}
              <div className="section-title-sm">BUSCAR COLABORADOR</div>
              <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
                <div style={{flex:1}}>
                  <label className="form-label">DNI del colaborador <span className="req">*</span></label>
                  <input type="text" className="form-control" placeholder="Ingresa el DNI" maxLength={8}
                    value={nsDni} onChange={e => setNsDni(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && buscarColab()} />
                </div>
                <button className="btn btn-primary btn-sm" onClick={buscarColab}>🔍 Buscar</button>
                <button className="btn btn-gray btn-sm" onClick={() => { setNsDni(''); setNsColab(null); setNsDniErr(false) }}>Limpiar</button>
              </div>
              <div className="search-hint mt-8 mb-12">DNIs de prueba: <strong>45231089</strong> · <strong>77434028</strong> · <strong>32187654</strong></div>

              {nsDniErr && <div className="banner banner-amber mb-12">⚠ No se encontró colaborador con ese DNI.</div>}

              {nsColab && (
                <div className="colab-found mb-12">
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                    <div style={{width:34,height:34,background:'#6B21A8',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:12,fontWeight:700,flexShrink:0}}>{nsColab.initials}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:'#1E1B4B'}}>{nsColab.nombre} {nsColab.apellido}</div>
                      <div style={{fontSize:11,color:'#6B7280'}}>{nsColab.puesto} · {nsColab.subarea}</div>
                    </div>
                    <span className="badge b-green">✓ Encontrado</span>
                  </div>
                  <div className="colab-grid">
                    <div className="colab-field"><div className="lbl">Nombre(s)</div><div className="val">{nsColab.nombre}</div></div>
                    <div className="colab-field"><div className="lbl">Apellido(s)</div><div className="val">{nsColab.apellido}</div></div>
                    <div className="colab-field"><div className="lbl">Puesto</div><div className="val">{nsColab.puesto}</div></div>
                    <div className="colab-field"><div className="lbl">Sub-Área</div><div className="val">{nsColab.subarea}</div></div>
                    <div className="colab-field"><div className="lbl">Relación Laboral</div><div className="val">{nsColab.relacionLaboral}</div></div>
                    <div className="colab-field" style={{gridColumn:'1/-1'}}><div className="lbl">Consejo Regional</div><div className="val">{nsColab.consejo}</div></div>
                  </div>
                </div>
              )}

              <div className="h-divider" />

              {/* Modal tabs */}
              <div className="modal-tabs">
                {([['bienes','📦 Bienes'],['accesorios','🔌 Accesorios'],['disponibles','📋 Bienes y Accesorios Disponibles'],['asignaciones','🔒 Asignaciones'],['reasignaciones','🔒 Reasignaciones']] as const).map(([t,lbl]) => (
                  <div key={t}
                    className={`modal-tab${nsTab===t?' active':''}${(t==='asignaciones'||t==='reasignaciones')&&!nsColab?' tab-locked':''}`}
                    onClick={() => { if ((t==='asignaciones'||t==='reasignaciones') && !nsColab) { toast.show('Busca un colaborador primero'); return } setNsTab(t) }}
                    title={(t==='asignaciones'||t==='reasignaciones')&&!nsColab?'Busca un colaborador primero':undefined}
                  >{lbl}</div>
                ))}
              </div>

              {/* PANE: Bienes */}
              {nsTab==='bienes' && (
                <div className="modal-tab-pane active">
                  <div className="form-group">
                    <label className="form-label">Tipo de bien <span className="req">*</span></label>
                    <select className="form-control" value={nsTipoBien} onChange={e => setNsTipoBien(e.target.value)}>
                      <option value="">Seleccionar...</option>
                      <option value="computo">Cómputo</option>
                      <option value="mobiliario">Mobiliario o Móvil</option>
                      <option value="comunicaciones">Comunicaciones</option>
                    </select>
                    <div className="form-hint">El tipo determina el área responsable del custodio</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bien a asignar <span className="req">*</span></label>
                    <input type="text" className="form-control" placeholder="Ej: Laptop HP EliteBook 840"
                      value={nsBienNom} onChange={e => setNsBienNom(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Justificación / Motivo <span className="req">*</span></label>
                    <textarea className="form-control" placeholder="Explica el motivo de la asignación..." value={nsBienJust} onChange={e => setNsBienJust(e.target.value)} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Área Funcional <span className="text-xs text-gray">(autocompletado)</span></label>
                      <input type="text" className="form-control" value={flujoAreaMap[nsTipoBien]||'UN. DE TI'} readOnly />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sede</label>
                      <select className="form-control">
                        <option>Sede Malecón de la Reserva</option>
                        <option>Sede 28 de Julio</option>
                        <option>Sede Miraflores</option>
                      </select>
                    </div>
                  </div>
                  {nsTipoBien==='computo' && <div className="banner banner-blue">💻 Esta solicitud será revisada por SEC. DE ADMINISTRACION y derivada a UN. DE TI para verificar disponibilidad en inventario.</div>}
                  <div className="h-divider" />
                  <div className="section-title-sm">FLUJO DE APROBACIÓN Y FIRMAS</div>
                  <div className="banner banner-purple" style={{marginBottom:12,fontSize:12}}>📋 Al enviar la solicitud se activará el flujo. Cada etapa requiere firma digital del responsable.</div>
                  <div className="stepper" style={{margin:'10px 0 6px'}}>
                    {[['1','Admin\nregistra'],['2',flujoAreaMap[nsTipoBien]||'Área\nvalida'],['3','Admin\nentrega'],['4','Colaborador\nfirma']].map(([n,lbl],i,a) => (
                      <><div key={n} className="step"><div className="step-circ pend" style={{fontSize:10,width:24,height:24}}>{n}</div><span className="step-lbl pend" style={{fontSize:10,textAlign:'center',maxWidth:55}}>{lbl}</span></div>{i<a.length-1&&<div className="step-conn"/>}</>
                    ))}
                  </div>
                  {!nsTipoBien && <div className="text-xs text-gray mt-8" style={{fontStyle:'italic'}}>Selecciona el tipo de bien para ver el área responsable de validación.</div>}
                </div>
              )}

              {/* PANE: Accesorios */}
              {nsTab==='accesorios' && (
                <div className="modal-tab-pane active">
                  <div className="form-group">
                    <label className="form-label">Tipo de accesorio <span className="req">*</span></label>
                    <select className="form-control" value={nsTipoAcc} onChange={e => setNsTipoAcc(e.target.value)}><option value="">Seleccionar...</option><option>Periférico de entrada</option><option>Periférico de salida</option><option>Conectividad</option><option>Audio / Video</option><option>Almacenamiento</option></select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Accesorio a asignar <span className="req">*</span></label>
                    <input type="text" className="form-control" placeholder="Ej: Teclado inalámbrico Logitech"
                      value={nsAccNom} onChange={e => setNsAccNom(e.target.value)} />
                    {nsAccNom && <div className="form-hint">✓ Autocompletado desde selección en Disponibles</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Justificación / Motivo <span className="req">*</span></label>
                    <textarea className="form-control" placeholder="Explica el motivo de la asignación..."
                      value={nsAccJust} onChange={e => setNsAccJust(e.target.value)} />
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label className="form-label">Sub-Área</label><input type="text" className="form-control" value="UN. DE TI" readOnly /></div>
                    <div className="form-group"><label className="form-label">Sede</label><input type="text" className="form-control" value="Sede Malecón de la Reserva" readOnly /></div>
                  </div>
                  <div className="h-divider" />
                  <div className="section-title-sm">FLUJO DE APROBACIÓN Y FIRMAS</div>
                  <div className="banner banner-purple" style={{marginBottom:12,fontSize:12}}>📋 Al enviar la solicitud se activará el flujo. Cada etapa requiere firma digital del responsable.</div>
                  <div className="stepper" style={{margin:'10px 0 6px'}}>
                    {['Admin\nregistra','Área\nvalida','Admin\nentrega','Colaborador\nfirma'].map((lbl,i,a) => (
                      <><div key={i} className="step"><div className="step-circ pend" style={{fontSize:10,width:24,height:24}}>{i+1}</div><span className="step-lbl pend" style={{fontSize:10,textAlign:'center',maxWidth:55}}>{lbl}</span></div>{i<a.length-1&&<div className="step-conn"/>}</>
                    ))}
                  </div>
                  <div className="text-xs text-gray mt-8" style={{fontStyle:'italic'}}>Registro → Validación → Entrega → Conformidad</div>
                </div>
              )}

              {/* PANE: Disponibles */}
              {nsTab==='disponibles' && (
                <div className="modal-tab-pane active">
                  <div className="banner banner-teal" style={{marginBottom:12}}>⚡ Información sincronizada con el inventario del <strong>Portal CMP</strong> — stock en tiempo real.</div>
                  <div className="sub-tabs">
                    <div className={`sub-tab${nsdTab==='bienes'?' active':''}`} onClick={() => { setNsdTab('bienes'); setNsdDetalle(null) }}>📦 Bienes</div>
                    <div className={`sub-tab${nsdTab==='accs'?' active':''}`} onClick={() => { setNsdTab('accs'); setNsdDetalle(null) }}>🔌 Accesorios</div>
                  </div>

                  {nsdTab==='bienes' && (
                    <>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10,flexWrap:'wrap',gap:8}}>
                        <div style={{fontSize:12,color:'#6B7280'}}>Haz clic en un bien para ver su ficha. Usa el checkbox para selección múltiple.</div>
                        {selBienes.size>0 && <span className="badge b-purple">{selBienes.size} bien(es) seleccionado(s)</span>}
                      </div>
                      {selBienes.size>0 && (
                        <button className="btn btn-primary btn-sm mb-8" onClick={() => { toast.show(`✓ ${selBienes.size} bien(es) agregado(s) a la solicitud`); setSelBienes(new Set()) }}>
                          → Agregar a solicitud Bienes ({selBienes.size})
                        </button>
                      )}
                      <div id="nsd-bienes-list">
                        {BIENES_DISP.map(b => (
                          <div key={b.id} className={`bien-card${nsdDetalle?.id===b.id?' selected':''}`} onClick={() => setNsdDetalle(nsdDetalle?.id===b.id?null:b)} style={{position:'relative'}}>
                            <input type="checkbox" style={{position:'absolute',top:8,right:8,width:16,height:16,accentColor:'#6B21A8',cursor:'pointer',zIndex:2}}
                              checked={selBienes.has(b.id)} onClick={e => { e.stopPropagation(); toggleBien(b.id) }} onChange={() => {}} />
                            <div className="bien-card-icon">{b.icon}</div>
                            <div className="bien-card-info"><div className="bien-card-title">{b.title}</div><div className="bien-card-sub">{b.sub}</div></div>
                            <span className={`badge ${b.badge}`}>{b.badgeTxt}</span>
                          </div>
                        ))}
                      </div>
                      {nsdDetalle && (
                        <div className="bien-detail-card">
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                            <div style={{fontSize:13,fontWeight:700,color:'#1E1B4B'}}>Ficha del Bien</div>
                            <button className="btn btn-gray btn-xs" onClick={() => setNsdDetalle(null)}>× Cerrar ficha</button>
                          </div>
                          <div className="foto-grid">
                            <div className="foto-placeholder"><span>{nsdDetalle.icon}</span><small>Vista frontal</small></div>
                            <div className="foto-placeholder"><span>{nsdDetalle.icon}</span><small>Vista lateral / detalle</small></div>
                          </div>
                          <div className="inv-grid">
                            <div className="inv-field"><div className="lbl">ID</div><div className="val fw-600">{nsdDetalle.id}</div></div>
                            <div className="inv-field"><div className="lbl">Código QR</div><div className="val"><code>{nsdDetalle.qr}</code></div></div>
                            <div className="inv-field"><div className="lbl">Marca</div><div className="val">{nsdDetalle.marca}</div></div>
                            <div className="inv-field"><div className="lbl">Modelo</div><div className="val">{nsdDetalle.modelo}</div></div>
                            <div className="inv-field"><div className="lbl">Estado</div><div className="val">{nsdDetalle.estado}</div></div>
                            <div className="inv-field"><div className="lbl">Condición</div><div className="val">{nsdDetalle.condicion}</div></div>
                            <div className="inv-field"><div className="lbl">Área</div><div className="val">{nsdDetalle.area}</div></div>
                            <div className="inv-field"><div className="lbl">N° Serie</div><div className="val">{nsdDetalle.serie}</div></div>
                          </div>
                          <div style={{marginTop:12}}>
                            <button className="btn btn-primary btn-sm" onClick={() => { setNsBienNom(`${nsdDetalle.title}`); setNsTab('bienes'); toast.show(`✓ Bien seleccionado: ${nsdDetalle.title}`) }}>✔ Seleccionar para solicitud</button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {nsdTab==='accs' && (
                    <>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                        <div style={{fontSize:12,color:'#6B7280'}}>Accesorios disponibles registrados en sistema</div>
                        {selAccs.size>0 && <span className="badge b-purple">{selAccs.size} accesorio(s) seleccionado(s)</span>}
                      </div>
                      {selAccs.size>0 && (
                        <button className="btn btn-primary btn-sm mb-8" onClick={() => {
                          const first = ACCS_DISP.find(a => selAccs.has(a.id))
                          if (first) setNsAccNom(`${first.nombre} ${first.marca}`.trim())
                          toast.show(`✓ Accesorio autocompletado en pestaña Accesorios`)
                          setNsTab('accesorios')
                          setSelAccs(new Set())
                        }}>
                          → Agregar a solicitud Accesorios ({selAccs.size})
                        </button>
                      )}
                      <div className="table-wrap">
                        <table>
                          <thead className="thead-orange"><tr><th style={{width:32}}></th><th>ID</th><th>Nombre</th><th>Marca</th><th>Sub Área</th><th>Estado</th><th>Disponibilidad</th></tr></thead>
                          <tbody>
                            {ACCS_DISP.map(a => (
                              <tr key={a.id}>
                                <td><input type="checkbox" style={{accentColor:'#6B21A8'}} checked={selAccs.has(a.id)} onChange={() => toggleAcc(a.id)} /></td>
                                <td>{a.id}</td><td>{a.nombre}</td><td>{a.marca}</td><td>{a.area}</td>
                                <td><span className={`badge ${a.estado}`}>{a.estadoTxt}</span></td>
                                <td><span className={`badge ${a.disp}`}>{a.dispTxt}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* PANE: Asignaciones */}
              {nsTab==='asignaciones' && (
                <div className="modal-tab-pane active">
                  <div className="banner banner-purple" style={{marginBottom:12,fontSize:12}}>📌 Bienes y accesorios actualmente asignados al colaborador buscado.</div>
                  <div style={{display:'flex',justifyContent:'flex-end',marginBottom:10}}>
                    <button className="btn btn-outline btn-sm" onClick={() => setShowReporte(true)}>📊 Generar Reporte</button>
                  </div>
                  <div className="sub-tabs">
                    <div className={`sub-tab${nsaTab==='bienes'?' active':''}`} onClick={() => { setNsaTab('bienes'); setNsaDetalle(null) }}>📦 Bienes asignados</div>
                    <div className={`sub-tab${nsaTab==='accs'?' active':''}`} onClick={() => setNsaTab('accs')}>🔌 Accesorios asignados</div>
                  </div>
                  {nsaTab==='bienes' && (
                    <>
                      <div style={{fontSize:12,color:'#6B7280',marginBottom:10}}>Bienes asignados al colaborador — haz clic para ver ficha</div>
                      {BIENES_ASIG.map(b => (
                        <div key={b.id} className="bien-card" onClick={() => setNsaDetalle(nsaDetalle?.id===b.id?null:b)}>
                          <div className="bien-card-icon">{b.icon}</div>
                          <div className="bien-card-info"><div className="bien-card-title">{b.title}</div><div className="bien-card-sub">{b.sub}</div></div>
                          <span className="badge b-purple">Asignado</span>
                        </div>
                      ))}
                      {nsaDetalle && (
                        <div className="bien-detail-card">
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                            <div style={{fontSize:13,fontWeight:700,color:'#1E1B4B'}}>Ficha del Bien</div>
                            <button className="btn btn-gray btn-xs" onClick={() => setNsaDetalle(null)}>× Cerrar ficha</button>
                          </div>
                          <div className="foto-grid">
                            <div className="foto-placeholder"><span>{nsaDetalle.icon}</span><small>Vista frontal</small></div>
                            <div className="foto-placeholder"><span>{nsaDetalle.icon}</span><small>Vista lateral / detalle</small></div>
                          </div>
                          <div className="inv-grid">
                            <div className="inv-field"><div className="lbl">ID</div><div className="val fw-600">{nsaDetalle.id}</div></div>
                            <div className="inv-field"><div className="lbl">Código QR</div><div className="val"><code>{nsaDetalle.qr}</code></div></div>
                            <div className="inv-field"><div className="lbl">Marca</div><div className="val">{nsaDetalle.marca}</div></div>
                            <div className="inv-field"><div className="lbl">Modelo</div><div className="val">{nsaDetalle.modelo}</div></div>
                            <div className="inv-field"><div className="lbl">Estado</div><div className="val">{nsaDetalle.estado}</div></div>
                            <div className="inv-field"><div className="lbl">Condición</div><div className="val">{nsaDetalle.condicion}</div></div>
                            <div className="inv-field"><div className="lbl">Área</div><div className="val">{nsaDetalle.area}</div></div>
                            <div className="inv-field"><div className="lbl">N° Serie</div><div className="val">{nsaDetalle.serie}</div></div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {nsaTab==='accs' && (
                    <div className="table-wrap">
                      <table>
                        <thead className="thead-orange"><tr><th>ID</th><th>Nombre</th><th>Marca</th><th>Área</th><th>SubÁrea</th><th>Estado</th></tr></thead>
                        <tbody>
                          {ACCS_ASIG.map(a => <tr key={a.id}><td>{a.id}</td><td>{a.nombre}</td><td>{a.marca}</td><td>{a.area}</td><td>{a.subarea}</td><td><span className={`badge ${a.estado}`}>{a.estadoTxt}</span></td></tr>)}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* PANE: Reasignaciones */}
              {nsTab==='reasignaciones' && (
                <div className="modal-tab-pane active">
                  <div className="banner banner-purple" style={{marginBottom:12,fontSize:12}}>🔄 Bienes y accesorios asignados al colaborador. Selecciona un registro para reasignar o dar de baja.</div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                    <span className="text-xs text-gray">{reasigSel?`Seleccionado: ${reasigSel.desc}`:'Selecciona un registro para habilitar acciones'}</span>
                    <button className={`btn btn-primary btn-sm${!reasigSel?' btn-disabled':''}`} disabled={!reasigSel} onClick={openReasignacion}>🔄 Reasignar / Quitar asignación</button>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead className="thead-orange"><tr><th style={{width:32}}></th><th>ID</th><th>Descripción</th><th>Tipo</th><th>Código QR</th><th>Estado</th></tr></thead>
                      <tbody>
                        {REASI_ROWS.map(r => (
                          <tr key={r.id} className="reasi-row" onClick={() => setReasigSel(reasigSel?.id===r.id?null:r)} style={{cursor:'pointer',background:reasigSel?.id===r.id?'#F5F3FF':''}}>
                            <td><input type="radio" name="reasi-sel" style={{accentColor:'#6B21A8'}} checked={reasigSel?.id===r.id} onChange={() => {}} /></td>
                            <td className="fw-600">{r.id}</td><td>{r.desc}</td><td>{r.tipo}</td><td><code>{r.qr}</code></td>
                            <td><span className="badge b-purple">{r.estado}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}



              {/* ── Resumen de solicitud ── */}
              <div className="h-divider" />
              <div style={{background:'#F5F3FF',border:'1.5px solid #6B21A8',borderRadius:8,padding:'12px 14px'}}>
                <div style={{fontSize:11,fontWeight:700,color:'#7C3AED',marginBottom:8,letterSpacing:.5}}>RESUMEN DE SOLICITUD</div>
                <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                  <div style={{flex:1,minWidth:180,background:'white',border:'1px solid #E9D5FF',borderRadius:6,padding:'8px 12px'}}>
                    <div style={{fontSize:10,color:'#9CA3AF',marginBottom:4,fontWeight:600}}>📦 BIEN SOLICITADO</div>
                    {nsBienNom
                      ? <div style={{fontSize:12,fontWeight:600,color:'#1E1B4B'}}>{nsBienNom}<br/><span style={{fontWeight:400,color:'#6B7280',fontSize:11}}>{flujoAreaMap[nsTipoBien]||'Área por definir'}</span></div>
                      : selBienes.size > 0
                        ? <div style={{fontSize:12,fontWeight:600,color:'#1E1B4B'}}>{selBienes.size} bien(es) seleccionado(s) desde inventario</div>
                        : <div style={{fontSize:12,color:'#9CA3AF',fontStyle:'italic'}}>Sin bien agregado — ve a la pestaña Bienes</div>
                    }
                  </div>
                  <div style={{flex:1,minWidth:180,background:'white',border:'1px solid #E9D5FF',borderRadius:6,padding:'8px 12px'}}>
                    <div style={{fontSize:10,color:'#9CA3AF',marginBottom:4,fontWeight:600}}>🔌 ACCESORIO SOLICITADO</div>
                    {nsAccNom
                      ? <div style={{fontSize:12,fontWeight:600,color:'#1E1B4B'}}>{nsAccNom}<br/><span style={{fontWeight:400,color:'#6B7280',fontSize:11}}>{nsTipoAcc||'Tipo por definir'}</span></div>
                      : <div style={{fontSize:12,color:'#9CA3AF',fontStyle:'italic'}}>Sin accesorio agregado — ve a la pestaña Accesorios</div>
                    }
                  </div>
                </div>
                {(!nsBienNom && selBienes.size===0 && !nsAccNom) && (
                  <div style={{marginTop:8,fontSize:11,color:'#EF4444',fontWeight:500}}>⚠ Debes agregar al menos un bien o accesorio para enviar la solicitud.</div>
                )}
              </div>

            </div>
            <div className="modal-footer">
              <span className="modal-note">Los campos marcados con <span style={{color:'#EF4444'}}>*</span> son obligatorios</span>
              <button className="btn btn-gray" onClick={() => setShowNueva(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={enviarSolicitud}>Enviar Solicitud</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
           MODAL — Detalle Solicitud
         ══════════════════════════════════════════════════════════════ */}
      {showDetalle && detSol && (
        <div className="modal-overlay" onClick={() => setShowDetalle(false)}>
          <div className="modal-box" style={{maxWidth:640}} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <div className="modal-title">Solicitud {detSol.n}</div>
                <div className="modal-subtitle">{detSol.colaborador} · <span className={`badge ${detSol.estadoCls}`} style={{fontSize:10}}>{detSol.estado}</span></div>
              </div>
              <button className="modal-close" onClick={() => setShowDetalle(false)}>×</button>
            </div>
            <div style={{padding:'8px 20px',borderBottom:'1px solid #E5E7EB',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
              <div style={{fontSize:12,color:'#6B7280'}}>{detSol.n} · {detSol.fecha} · Área: <strong>{detSol.areaEncargada}</strong></div>
              <div style={{display:'flex',gap:6}}>
                {detBienItem && <span className={`badge ${detTab==='bienes' ? 'b-purple' : 'b-gray'}`} style={{fontSize:10,opacity:detTab==='bienes'?1:0.5}}>📦 Bien</span>}
                {detAccItem  && <span className={`badge ${detTab==='accesorios' ? 'b-orange' : 'b-gray'}`} style={{fontSize:10,opacity:detTab==='accesorios'?1:0.5}}>🔌 Accesorio</span>}
              </div>
            </div>
            <div style={{padding:'0 20px',borderBottom:'1px solid #E5E7EB',display:'flex'}}>
              <div className={`modal-tab${detTab==='bienes'?' active':''}`} onClick={() => setDetTab('bienes')}>📦 Bienes</div>
              <div className={`modal-tab${detTab==='accesorios'?' active':''}`} onClick={() => setDetTab('accesorios')}>🔌 Accesorios</div>
            </div>
            <div className="modal-body">

              {detTab==='bienes' && (
                detBienItem
                  ? (<>
                    <div className="section-title-sm">DETALLE DEL BIEN</div>
                    <div className="inv-grid" style={{marginBottom:14}}>
                      <div className="inv-field"><div className="lbl">N° Solicitud</div><div className="val fw-600">{detSol.n}</div></div>
                      <div className="inv-field"><div className="lbl">Fecha solicitud</div><div className="val">{detSol.fecha}</div></div>
                      <div className="inv-field" style={{gridColumn:'1/-1'}}><div className="lbl">Bien solicitado</div><div className="val fw-600">{detBienItem}</div></div>
                      <div className="inv-field"><div className="lbl">Tipo</div><div className="val">{detSol.tipo}</div></div>
                      <div className="inv-field"><div className="lbl">Fecha de entrega</div><div className="val">{detSol.fechaEntrega||'—'}</div></div>
                      <div className="inv-field"><div className="lbl">Área encargada</div><div className="val fw-600 text-purple">{detSol.areaEncargada}</div></div>
                      <div className="inv-field"><div className="lbl">Colaborador</div><div className="val">{detSol.colaborador}</div></div>
                      <div className="inv-field"><div className="lbl">DNI</div><div className="val">{detSol.dni}</div></div>
                      <div className="inv-field"><div className="lbl">Puesto</div><div className="val">{detSol.puesto}</div></div>
                      <div className="inv-field"><div className="lbl">Sub-Área</div><div className="val">{detSol.subArea}</div></div>
                      <div className="inv-field" style={{gridColumn:'1/-1'}}><div className="lbl">Motivo</div><div className="val">{detSol.motivo}</div></div>
                      {detSol.observacion && <div className="inv-field" style={{gridColumn:'1/-1'}}><div className="lbl" style={{color:'#92400E'}}>Observación</div><div className="val" style={{color:'#92400E'}}>{detSol.observacion}</div></div>}
                    </div>
                    {renderFlujoBlocks(detSol.flujo, 0)}
                  </>)
                  : (<div style={{textAlign:'center',padding:'40px 0',color:'#9CA3AF'}}>
                    <div style={{fontSize:32,marginBottom:8}}>📦</div>
                    <div style={{fontSize:13,fontWeight:600}}>Esta solicitud no incluye bienes</div>
                    <div style={{fontSize:11,marginTop:4}}>Solo se solicitaron accesorios</div>
                  </div>)
              )}

              {detTab==='accesorios' && (
                detAccItem
                  ? (<>
                    <div className="section-title-sm">DETALLE DEL ACCESORIO</div>
                    <div className="inv-grid" style={{marginBottom:14}}>
                      <div className="inv-field"><div className="lbl">N° Solicitud</div><div className="val fw-600">{detSol.n}</div></div>
                      <div className="inv-field"><div className="lbl">Fecha solicitud</div><div className="val">{detSol.fecha}</div></div>
                      <div className="inv-field" style={{gridColumn:'1/-1'}}><div className="lbl">Accesorio solicitado</div><div className="val fw-600">{detAccItem}</div></div>
                      <div className="inv-field"><div className="lbl">Tipo</div><div className="val">Accesorio</div></div>
                      <div className="inv-field"><div className="lbl">Fecha de entrega</div><div className="val">{detSol.fechaEntrega||'—'}</div></div>
                      <div className="inv-field"><div className="lbl">Área encargada</div><div className="val fw-600 text-purple">{detSol.areaEncargada}</div></div>
                      <div className="inv-field"><div className="lbl">Colaborador</div><div className="val">{detSol.colaborador}</div></div>
                      <div className="inv-field"><div className="lbl">DNI</div><div className="val">{detSol.dni}</div></div>
                      <div className="inv-field"><div className="lbl">Puesto</div><div className="val">{detSol.puesto}</div></div>
                      <div className="inv-field"><div className="lbl">Sub-Área</div><div className="val">{detSol.subArea}</div></div>
                      <div className="inv-field" style={{gridColumn:'1/-1'}}><div className="lbl">Motivo</div><div className="val">{detSol.motivo}</div></div>
                    </div>
                    {renderFlujoBlocks(detFlujoAcc, 100)}
                  </>)
                  : (<div style={{textAlign:'center',padding:'40px 0',color:'#9CA3AF'}}>
                    <div style={{fontSize:32,marginBottom:8}}>🔌</div>
                    <div style={{fontSize:13,fontWeight:600}}>Esta solicitud no incluye accesorios</div>
                    <div style={{fontSize:11,marginTop:4}}>Solo se solicitaron bienes — ve a la pestaña Bienes</div>
                  </div>)
              )}

            </div>
            <div className="modal-footer">
              <button className="btn btn-gray btn-sm" onClick={() => setShowDetalle(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
           MODAL — Conformidad
         ══════════════════════════════════════════════════════════════ */}
      {showConformidad && (
        <div className="modal-overlay" onClick={() => setShowConformidad(false)}>
          <div className="modal-box" style={{maxWidth:480}} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <span className="modal-title">Acta de Conformidad de Entrega — SOL-2026-004</span>
              <button className="modal-close" onClick={() => setShowConformidad(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="summary-block">
                <div className="summary-row"><span className="summary-lbl">Bien</span><span className="summary-val">Monitor 24" LG 24MK430H</span></div>
                <div className="summary-row"><span className="summary-lbl">Código QR</span><span className="summary-val"><code>CMP-038401</code></span></div>
                <div className="summary-row"><span className="summary-lbl">Estado</span><span className="summary-val"><span className="badge b-green">Bueno</span></span></div>
                <div className="summary-row"><span className="summary-lbl">Área</span><span className="summary-val">UN. DE TI</span></div>
                <div className="summary-row"><span className="summary-lbl">Fecha entrega</span><span className="summary-val">15/03/2026</span></div>
                <div className="summary-row"><span className="summary-lbl">Entregado por</span><span className="summary-val">Administración</span></div>
              </div>
              <div className="acta-text">
                "Yo, Aaron Samuel Nuñez Muñoz, identificado con DNI 77434028, declaro haber recibido el bien descrito en conformidad, en las condiciones indicadas, comprometiéndome a su uso responsable y devolución en caso corresponda."
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Nombre completo</label><input type="text" className="form-control" value="Aaron Samuel Nuñez Muñoz" readOnly /></div>
                <div className="form-group"><label className="form-label">DNI</label><input type="text" className="form-control" value="77434028" readOnly /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Cargo</label><input type="text" className="form-control" value="Analista de Sistemas" readOnly /></div>
                <div className="form-group"><label className="form-label">Fecha de firma</label><input type="text" className="form-control" value="25/03/2026" readOnly /></div>
              </div>
            </div>
            <div className="modal-footer">
              <span className="modal-note">Esta acción registra tu conformidad. Podrás descargar el PDF desde Historial.</span>
              <button className="btn btn-gray" onClick={() => setShowConformidad(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => { toast.show('✓ Conformidad firmada y registrada'); setShowConformidad(false) }}>✔ Confirmar y Firmar</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
           MODAL — Consultar Disponibilidad
         ══════════════════════════════════════════════════════════════ */}
      {showDisp && (
        <div className="modal-overlay" onClick={() => setShowDisp(false)}>
          <div className="modal-box" style={{maxWidth:680}} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <div className="modal-title" style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{color:'#0DA882'}}>▦</span> Disponibilidad de Bienes y Accesorios
                  <span className="badge b-teal" style={{fontSize:10}}>⚡ API Intranet</span>
                </div>
                <div style={{fontSize:11,color:'#9CA3AF',marginTop:2}}>Stock en tiempo real — Portal CMP</div>
              </div>
              <button className="modal-close" onClick={() => setShowDisp(false)}>×</button>
            </div>
            <div style={{padding:'0 20px',borderBottom:'1px solid #E5E7EB'}}>
              <div style={{display:'flex'}}>
                <div className={`modal-tab${dispTab==='bienes'?' active':''}`} onClick={() => setDispTab('bienes')}>📦 Bienes</div>
                <div className={`modal-tab${dispTab==='accs'?' active':''}`} onClick={() => setDispTab('accs')}>🔌 Accesorios</div>
              </div>
            </div>
            <div className="modal-body">
              {dispTab==='bienes' && (
                <>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                    <span style={{fontSize:12,color:'#64748B'}}>Bienes disponibles registrados en almacén</span>
                    <span className="badge b-green">4 disponibles</span>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead className="thead-teal"><tr><th>ID</th><th>Código QR</th><th>Descripción</th><th>Marca</th><th>Modelo</th><th>Estado</th><th>Condición</th><th>Disponibilidad</th></tr></thead>
                      <tbody>
                        <tr><td>111025</td><td>CMP-038395</td><td>Laptop</td><td>HP</td><td>EliteBook 840</td><td><span className="badge b-green">Bueno</span></td><td>Nuevo</td><td><span className="badge b-green">Disponible</span></td></tr>
                        <tr><td>111026</td><td>CMP-038396</td><td>Monitor</td><td>Samsung</td><td>27" S27A</td><td><span className="badge b-green">Bueno</span></td><td>En Uso</td><td><span className="badge b-green">Disponible</span></td></tr>
                        <tr><td>111027</td><td>CMP-038397</td><td>Impresora</td><td>Epson</td><td>L3150</td><td><span className="badge b-yellow">Regular</span></td><td>En Uso</td><td><span className="badge b-yellow">En revisión</span></td></tr>
                        <tr><td>111028</td><td>CMP-038398</td><td>Proyector</td><td>Epson</td><td>EB-X51</td><td><span className="badge b-green">Bueno</span></td><td>En Uso</td><td><span className="badge b-green">Disponible</span></td></tr>
                        <tr><td>111029</td><td>CMP-038399</td><td>Tablet</td><td>Samsung</td><td>Tab S7</td><td><span className="badge b-green">Bueno</span></td><td>Nuevo</td><td><span className="badge b-green">Disponible</span></td></tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              {dispTab==='accs' && (
                <>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                    <span style={{fontSize:12,color:'#64748B'}}>Accesorios disponibles registrados en sistema</span>
                    <span className="badge b-green">3 disponibles</span>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead className="thead-orange"><tr><th>ID</th><th>Nombre</th><th>Marca</th><th>Sub Área</th><th>Estado</th><th>DNI Asignado</th><th>Disponibilidad</th></tr></thead>
                      <tbody>
                        <tr><td>20261114</td><td>Teclado Inalámbrico</td><td>Logitech</td><td>UN. DE TI</td><td><span className="badge b-green">Bueno</span></td><td className="text-gray">—</td><td><span className="badge b-green">Disponible</span></td></tr>
                        <tr><td>20261115</td><td>Mouse Inalámbrico</td><td>Logitech</td><td>UN. DE TI</td><td><span className="badge b-green">Bueno</span></td><td className="text-gray">—</td><td><span className="badge b-green">Disponible</span></td></tr>
                        <tr><td>20261116</td><td>Hub USB 4 puertos</td><td>Anker</td><td>ADMINISTRACION</td><td><span className="badge b-green">Bueno</span></td><td className="text-gray">—</td><td><span className="badge b-green">Disponible</span></td></tr>
                        <tr><td>20261117</td><td>Webcam HD</td><td>Logitech</td><td>COMUNICACIONES</td><td><span className="badge b-green">Bueno</span></td><td className="fw-600">77434030</td><td><span className="badge b-blue">Asignado</span></td></tr>
                        <tr><td>20261118</td><td>Auriculares</td><td>Sony</td><td>UN. DE GDTH</td><td><span className="badge b-yellow">Regular</span></td><td className="text-gray">—</td><td><span className="badge b-yellow">En revisión</span></td></tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-gray" onClick={() => setShowDisp(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
           MODAL — Configuración de Reasignación
         ══════════════════════════════════════════════════════════════ */}
      {showReasignacion && reasigSel && (
        <div className="modal-overlay" style={{zIndex:1100}} onClick={() => setShowReasignacion(false)}>
          <div className="modal-box" style={{maxWidth:640,zIndex:1101}} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <span className="modal-title">Configuración de Reasignación</span>
                <div style={{fontSize:11,color:'#9CA3AF',marginTop:2}}>Bien / Accesorio seleccionado para gestión</div>
              </div>
              <button className="modal-close" onClick={() => setShowReasignacion(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* Datos del bien/accesorio seleccionado */}
              <div style={{background:'#F5F3FF',border:'1.5px solid #6B21A8',borderRadius:8,padding:'12px 16px',marginBottom:14}}>
                <div style={{fontSize:11,color:'#7C3AED',fontWeight:600,marginBottom:6}}>REGISTRO SELECCIONADO</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8,fontSize:12}}>
                  <div><div style={{color:'#9CA3AF',fontSize:10,marginBottom:2}}>ID</div><div style={{fontWeight:700,color:'#1E1B4B'}}>{reasigSel.id}</div></div>
                  <div><div style={{color:'#9CA3AF',fontSize:10,marginBottom:2}}>Tipo</div><div style={{fontWeight:600}}>{reasigSel.tipo}</div></div>
                  <div><div style={{color:'#9CA3AF',fontSize:10,marginBottom:2}}>Código QR</div><code style={{fontSize:11}}>{reasigSel.qr}</code></div>
                  <div><div style={{color:'#9CA3AF',fontSize:10,marginBottom:2}}>Estado</div><span className="badge b-purple">{reasigSel.estado}</span></div>
                  <div style={{gridColumn:'1/-1'}}><div style={{color:'#9CA3AF',fontSize:10,marginBottom:2}}>Descripción</div><div style={{fontWeight:600,color:'#374151'}}>{reasigSel.desc}</div></div>
                </div>
              </div>

              {/* Tabs */}
              <div className="modal-tabs" style={{marginBottom:14}}>
                <div className={`modal-tab${reasigTab==='reasignar'?' active':''}`} onClick={() => setReasigTab('reasignar')}>🔄 Reasignar bien/accesorio</div>
                <div className={`modal-tab${reasigTab==='quitar'?' active':''}`} onClick={() => setReasigTab('quitar')}>🚫 Quitar asignación</div>
              </div>

              {/* PANE: Reasignar */}
              {reasigTab==='reasignar' && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Motivo de reasignación <span className="req">*</span></label>
                    <select className="form-control" value={reasigMotivo} onChange={e => setReasigMotivo(e.target.value)}>
                      <option value="">Seleccionar...</option>
                      <option value="transferencia">Transferencia de área</option>
                      <option value="cambio_puesto">Cambio de puesto del colaborador</option>
                      <option value="requerimiento">Requerimiento de otro colaborador</option>
                      <option value="mantenimiento">Enviar a mantenimiento</option>
                      <option value="actualizacion">Actualización de inventario</option>
                      <option value="otro">Otro motivo</option>
                    </select>
                  </div>
                  {reasigMotivo && reasigMotivo!=='mantenimiento' && (
                    <div className="form-group">
                      <label className="form-label">Nuevo bien o descripción</label>
                      <input type="text" className="form-control" placeholder="Ej: Laptop Dell Latitude 5520 — ID: 111040"
                        value={reasigNuevoBien} onChange={e => setReasigNuevoBien(e.target.value)} />
                      <div className="form-hint">Opcional: indica el bien que lo reemplazará</div>
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Estado tras reasignación <span className="req">*</span></label>
                    <select className="form-control" value={reasigNuevoEst} onChange={e => setReasigNuevoEst(e.target.value)}>
                      <option value="disponible">Disponible (vuelve a inventario)</option>
                      <option value="mantenimiento">En mantenimiento</option>
                      <option value="otro_colaborador">Asignado a otro colaborador</option>
                    </select>
                  </div>
                  {reasigNuevoEst==='mantenimiento' && (
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Fecha estimada de retorno</label>
                        <input type="date" className="form-control" value={reasigMantFecha} onChange={e => setReasigMantFecha(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Responsable de mantenimiento</label>
                        <input type="text" className="form-control" placeholder="Nombre del técnico o proveedor" value={reasigMantResp} onChange={e => setReasigMantResp(e.target.value)} />
                      </div>
                    </div>
                  )}
                  {reasigNuevoEst==='otro_colaborador' && (
                    <div className="form-group">
                      <label className="form-label">DNI del colaborador destino <span className="req">*</span></label>
                      <input type="text" className="form-control" placeholder="Ingresa el DNI del nuevo responsable" maxLength={8}
                        value={reasigDniDest} onChange={e => setReasigDniDest(e.target.value)} />
                    </div>
                  )}
                  <div className="h-divider" />
                  <div className="section-title-sm">FLUJO DE APROBACIÓN</div>
                  <div className="banner banner-purple" style={{marginBottom:12,fontSize:12}}>📋 Al enviar se activará el flujo de reasignación con las firmas correspondientes.</div>
                  {[['1','Admin\nregistra'],['2','Área\nvalida'],['3','Nuevo\ncustodio'],['4','Colaborador\nconfirma']].map(([n],i) => (
                    <div key={n} style={{marginBottom:10}}>
                      <div className={`flow-step-hdr ${i===0?'active':'pending'}`}>
                        <div className="text-sm fw-600">{i===0?'⏳':'🔒'} Paso {n}: {['Administración registra reasignación','Área valida y aprueba el cambio','Nuevo custodio recibe el bien','Colaborador original confirma entrega'][i]}</div>
                        <span className="text-xs text-gray">—</span>
                      </div>
                      {i===0 && (
                        <div className="flow-step-body">
                          <button className="btn btn-outline btn-xs" onClick={() => setReasigShowObs(p=>({...p,[i]:!p[i]}))}>+ Observación</button>
                          {reasigShowObs[i] && (
                            <div style={{marginTop:8,background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:6,padding:'10px 12px'}}>
                              <textarea className="form-control" style={{fontSize:12,minHeight:56}} placeholder="Observación..."
                                value={reasigObs[i]||''} onChange={e=>setReasigObs(p=>({...p,[i]:e.target.value}))} />
                              <button className="btn btn-sm" style={{marginTop:6,background:'#D97706',color:'white',border:'none',borderRadius:5,padding:'4px 12px',fontSize:12,cursor:'pointer'}}
                                onClick={() => { toast.show('Observación registrada'); setReasigShowObs(p=>({...p,[i]:false})) }}>Guardar</button>
                            </div>
                          )}
                        </div>
                      )}
                      {i>0 && (
                        <div className="flow-step-body">
                          <p className="text-xs text-gray" style={{fontStyle:'italic',margin:'4px 0'}}>🔒 Pendiente — se habilitará al completar el paso anterior.</p>
                          <button className="btn btn-outline btn-xs" onClick={() => setReasigShowObs(p=>({...p,[i]:!p[i]}))}>+ Observación</button>
                          {reasigShowObs[i] && (
                            <div style={{marginTop:8,background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:6,padding:'10px 12px'}}>
                              <textarea className="form-control" style={{fontSize:12,minHeight:56}} placeholder="Observación..."
                                value={reasigObs[i]||''} onChange={e=>setReasigObs(p=>({...p,[i]:e.target.value}))} />
                              <button className="btn btn-sm" style={{marginTop:6,background:'#D97706',color:'white',border:'none',borderRadius:5,padding:'4px 12px',fontSize:12,cursor:'pointer'}}
                                onClick={() => { toast.show('Observación registrada'); setReasigShowObs(p=>({...p,[i]:false})) }}>Guardar</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* PANE: Quitar asignación */}
              {reasigTab==='quitar' && (
                <div>
                  <div className="banner banner-amber" style={{marginBottom:14}}>⚠ Esta acción retira la asignación del bien/accesorio al colaborador. El registro quedará en el historial.</div>
                  <div className="form-group">
                    <label className="form-label">Motivo de baja <span className="req">*</span></label>
                    <select className="form-control" value={quitarMotivo} onChange={e => setQuitarMotivo(e.target.value)}>
                      <option value="">Seleccionar...</option>
                      <option value="cese">Cese o desvinculación del colaborador</option>
                      <option value="traslado">Traslado a otra sede</option>
                      <option value="obsolescencia">Obsolescencia o descarte</option>
                      <option value="perdida">Pérdida o robo</option>
                      <option value="devolucion">Devolución voluntaria</option>
                      <option value="otro">Otro motivo</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estado final del bien <span className="req">*</span></label>
                    <select className="form-control" value={quitarEstFinal} onChange={e => setQuitarEstFinal(e.target.value)}>
                      <option value="disponible">Disponible (vuelve a inventario)</option>
                      <option value="baja">Dado de baja definitiva</option>
                      <option value="mantenimiento">En mantenimiento</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Observaciones adicionales</label>
                    <textarea className="form-control" placeholder="Detalla las razones o condiciones de la baja..." style={{minHeight:64}}
                      value={quitarNotas} onChange={e => setQuitarNotas(e.target.value)} />
                  </div>
                  <div className="h-divider" />
                  <div className="section-title-sm">FLUJO DE BAJA</div>
                  {[['1','Admin\nregistra'],['2','Área\nrevisa'],['3','Patrimonio\nconfirma'],['4','Cierre\nregistro']].map(([n],i) => (
                    <div key={n} style={{marginBottom:10}}>
                      <div className={`flow-step-hdr ${i===0?'active':'pending'}`}>
                        <div className="text-sm fw-600">{i===0?'⏳':'🔒'} Paso {n}: {['Administración registra baja de asignación','Área jefatura revisa y aprueba','Patrimonio confirma retiro del inventario personal','Sistema cierra el registro de asignación'][i]}</div>
                        <span className="text-xs text-gray">—</span>
                      </div>
                      <div className="flow-step-body">
                        {i>0 && <p className="text-xs text-gray" style={{fontStyle:'italic',margin:'4px 0 6px'}}>🔒 Pendiente — se habilitará al completar el paso anterior.</p>}
                        <button className="btn btn-outline btn-xs" onClick={() => setQuitarShowObs(p=>({...p,[i]:!p[i]}))}>+ Observación</button>
                        {quitarShowObs[i] && (
                          <div style={{marginTop:8,background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:6,padding:'10px 12px'}}>
                            <textarea className="form-control" style={{fontSize:12,minHeight:56}} placeholder="Observación..."
                              value={quitarObs[i]||''} onChange={e=>setQuitarObs(p=>({...p,[i]:e.target.value}))} />
                            <button className="btn btn-sm" style={{marginTop:6,background:'#D97706',color:'white',border:'none',borderRadius:5,padding:'4px 12px',fontSize:12,cursor:'pointer'}}
                              onClick={() => { toast.show('Observación registrada'); setQuitarShowObs(p=>({...p,[i]:false})) }}>Guardar</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-gray" onClick={() => setShowReasignacion(false)}>Cancelar</button>
              {reasigTab==='reasignar'
                ? <button className="btn btn-primary" onClick={() => { toast.show(`✓ Solicitud de reasignación enviada para ${reasigSel.desc}`); setShowReasignacion(false) }}>Enviar solicitud de reasignación</button>
                : <button className="btn btn-primary" style={{background:'#DC2626'}} onClick={() => { toast.show(`✓ Baja de asignación registrada para ${reasigSel.desc}`); setShowReasignacion(false) }}>Confirmar baja de asignación</button>
              }
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
           MODAL — Correo enviado para firma (genérico)
         ══════════════════════════════════════════════════════════════ */}
      {showCorreoModal && pendingConfData && (
        <div className="modal-overlay" onClick={() => setShowCorreoModal(false)}>
          <div className="modal-box" style={{maxWidth:500}} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <span className="modal-title">📧 Envío a correo exitoso</span>
                <div style={{fontSize:11,color:'#9CA3AF',marginTop:2}}>Solicitud de firma digital enviada</div>
              </div>
              <button className="modal-close" onClick={() => setShowCorreoModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* Éxito */}
              <div style={{textAlign:'center',marginBottom:20}}>
                <div style={{fontSize:48,marginBottom:8}}>✅</div>
                <div style={{fontSize:15,fontWeight:700,color:'#1E1B4B',marginBottom:4}}>¡Correo enviado exitosamente!</div>
                <div style={{fontSize:12,color:'#6B7280',lineHeight:1.6}}>
                  El colaborador recibirá el correo con el enlace de confirmación y el acta adjunta.
                  Al hacer clic en <strong>"Confirmar"</strong>, el sistema registrará su firma digital automáticamente.
                </div>
              </div>

              {/* Correlativo */}
              <div style={{background:'#F5F3FF',border:'1px solid #DDD6FE',borderRadius:8,padding:'10px 16px',marginBottom:14,textAlign:'center'}}>
                <div style={{fontSize:10,color:'#7C3AED',fontWeight:700,letterSpacing:1,marginBottom:4}}>N° DE CONFORMIDAD</div>
                <div style={{fontSize:20,fontWeight:700,color:'#6B21A8',letterSpacing:3}}>{pendingConfData.num}</div>
              </div>

              {/* Datos del destinatario */}
              <div style={{background:'#F9FAFB',border:'1px solid #E5E7EB',borderRadius:8,padding:'12px 14px',marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:'#374151',marginBottom:8}}>DATOS DEL DESTINATARIO</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,fontSize:12}}>
                  <div>
                    <div style={{color:'#9CA3AF',fontSize:10,marginBottom:2}}>Colaborador</div>
                    <div style={{fontWeight:600,color:'#1E1B4B'}}>{pendingConfData.nombre}</div>
                  </div>
                  <div>
                    <div style={{color:'#9CA3AF',fontSize:10,marginBottom:2}}>Puesto</div>
                    <div style={{fontWeight:600,color:'#1E1B4B'}}>{pendingConfData.puesto}</div>
                  </div>
                  <div style={{gridColumn:'1/-1'}}>
                    <div style={{color:'#9CA3AF',fontSize:10,marginBottom:2}}>Correo</div>
                    <div style={{fontWeight:600,color:'#1D4ED8'}}>{pendingConfData.correo}</div>
                  </div>
                </div>
              </div>

              {/* Documento adjunto */}
              <div style={{background:'#F0FDF4',border:'1px solid #86EFAC',borderRadius:8,padding:'12px 14px',marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:'#15803D',marginBottom:8}}>📎 DOCUMENTO ADJUNTO AL CORREO</div>
                <div style={{display:'flex',alignItems:'center',gap:10,background:'white',borderRadius:6,padding:'10px 14px',border:'1px solid #D1FAE5'}}>
                  <span style={{fontSize:28}}>📄</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:'#1E1B4B',marginBottom:2}}>ACTA DE ENTREGA Y DEVOLUCIÓN DE BIENES</div>
                    <div style={{fontSize:10,color:'#374151'}}>
                      Marcado como: <strong style={{color:'#15803D'}}>ENTREGA</strong>
                    </div>
                    <div style={{fontSize:10,color:'#6B7280',marginTop:2}}>
                      El colaborador firmará en el bloque <em>FIRMAS DEL ACTA</em> › campo <em>COLABORADOR — FIRMA POR CORREO</em>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info adicional */}
              <div style={{fontSize:11,color:'#9CA3AF',borderTop:'1px solid #F3F4F6',paddingTop:12}}>
                <div><strong>Solicitud:</strong> {detSol?.n ?? '—'} &nbsp;·&nbsp; <strong>Bien:</strong> {detSol?.bien ?? '—'}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowCorreoModal(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
           MODAL — Reporte de Asignaciones
         ══════════════════════════════════════════════════════════════ */}
      {showReporte && (
        <div className="modal-overlay" onClick={() => setShowReporte(false)}>
          <div className="modal-box" style={{maxWidth:700}} onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <span className="modal-title">Reporte de Asignaciones</span>
                <div style={{fontSize:11,color:'#9CA3AF',marginTop:2}}>Bienes y accesorios asignados al colaborador</div>
              </div>
              <button className="modal-close" onClick={() => setShowReporte(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{background:'#F5F3FF',border:'1.5px solid #6B21A8',borderRadius:8,padding:'14px 18px',marginBottom:16}}>
                <div style={{fontSize:14,fontWeight:700,color:'#1E1B4B',marginBottom:4}}>Aaron Samuel Nuñez Muñoz</div>
                <div style={{fontSize:12,color:'#6B7280'}}>DNI: 77434028 · Cargo: Analista de Sistemas · Área: UN. DE TI</div>
              </div>
              <p style={{fontSize:12,fontWeight:600,color:'#374151',marginBottom:8}}>📦 Bienes Asignados</p>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>ID</th><th>Descripción</th><th>QR</th><th>Condición</th><th>Custodio Responsable</th><th>Colaborador</th></tr></thead>
                  <tbody>
                    {[{id:'111030',desc:'Laptop Dell Latitude 5420',qr:'CMP-038401',cond:'Bueno',custFirma:true,colabFirma:true},
                      {id:'111031',desc:'Monitor LG 24"',qr:'CMP-038402',cond:'Bueno',custFirma:true,colabFirma:true},
                      {id:'111032',desc:'Teléfono IP Fanvil X4U',qr:'CMP-038403',cond:'Bueno',custFirma:true,colabFirma:false}].map(r => (
                      <tr key={r.id}>
                        <td>{r.id}</td><td>{r.desc}</td><td><code>{r.qr}</code></td><td>{r.cond}</td>
                        <td><div className="aprob-cell"><div className="aprob-zona">
                          {r.custFirma?<><span style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#1E1B4B',fontSize:12}}>G. Palacios</span><div style={{fontSize:10,color:'#6B7280',marginTop:2}}>Jefa UN. Administración · 28/03/2026</div></>:<span style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#991B1B',fontSize:12}}>Pendiente</span>}
                        </div></div></td>
                        <td><div className="aprob-cell"><div className="aprob-zona">
                          {r.colabFirma?<><span style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#1E1B4B',fontSize:12}}>Aaron N.</span><div style={{fontSize:10,color:'#6B7280',marginTop:2}}>Analista de Sistemas · 28/03/2026</div></>:<span style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#991B1B',fontSize:12}}>Pendiente</span>}
                        </div></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{fontSize:12,fontWeight:600,color:'#374151',margin:'16px 0 8px'}}>🔌 Accesorios Asignados</p>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>ID</th><th>Nombre</th><th>Marca</th><th>Estado</th><th>Custodio Responsable</th><th>Colaborador</th></tr></thead>
                  <tbody>
                    {[{id:'2026_ADM_0003',nom:'Teclado HP K1500',marca:'HP',est:'Bueno',c:true,col:true},
                      {id:'2026_ADM_0004',nom:'Mouse Logitech M185',marca:'Logitech',est:'Bueno',c:true,col:true},
                      {id:'2026_ADM_0005',nom:'Auriculares Jabra',marca:'Jabra',est:'Regular',c:false,col:false}].map(r => (
                      <tr key={r.id}>
                        <td>{r.id}</td><td>{r.nom}</td><td>{r.marca}</td><td>{r.est}</td>
                        <td><div className="aprob-cell"><div className="aprob-zona">
                          {r.c?<><span style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#1E1B4B',fontSize:12}}>G. Palacios</span><div style={{fontSize:10,color:'#6B7280',marginTop:2}}>Jefa UN. Administración · 28/03/2026</div></>:<span style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#6B7280',fontSize:12}}>En espera</span>}
                        </div></div></td>
                        <td><div className="aprob-cell"><div className="aprob-zona">
                          {r.col?<><span style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#1E1B4B',fontSize:12}}>Aaron N.</span><div style={{fontSize:10,color:'#6B7280',marginTop:2}}>Analista de Sistemas · 28/03/2026</div></>:<span style={{fontFamily:'Georgia,serif',fontStyle:'italic',color:'#6B7280',fontSize:12}}>En espera</span>}
                        </div></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-gray" onClick={() => setShowReporte(false)}>Cerrar</button>
              <button className="btn btn-outline" onClick={() => { const w=window.open('','_blank');if(w){w.document.write('<html><body>'+document.querySelector('.modal-body')?.innerHTML+'</body></html>');w.print()} }}>🖨 Imprimir</button>
              <button className="btn btn-primary" onClick={generarPDF}>📄 Generar PDF</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
