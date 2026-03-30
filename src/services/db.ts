import { supabase } from '../lib/supabase'

// ── Asignación de Bienes ──
export const solicitudesAsignacionService = {
  async getAll() {
    const { data, error } = await supabase
      .from('solicitudes_asignacion')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  async create(payload: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('solicitudes_asignacion')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },
  async update(id: string, payload: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('solicitudes_asignacion')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
}

// ── Bienes (inventario) ──
export const bienesService = {
  async getDisponibles() {
    const { data, error } = await supabase
      .from('bienes')
      .select('*')
      .eq('estado', 'disponible')
      .order('nombre')
    if (error) throw error
    return data
  },
  async getAll() {
    const { data, error } = await supabase
      .from('bienes')
      .select('*')
      .order('nombre')
    if (error) throw error
    return data
  },
}

// ── Devoluciones ──
export const devolucionesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('devoluciones')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  async getById(id: string) {
    const { data, error } = await supabase
      .from('devoluciones')
      .select('*, devolucion_items(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },
  async create(payload: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('devoluciones')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },
}

// ── Préstamos Bienes Tec ──
export const prestamosBienesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('prestamos_bienes')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  async create(payload: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('prestamos_bienes')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },
  async devolver(id: string) {
    const { data, error } = await supabase
      .from('prestamos_bienes')
      .update({ estado: 'devuelto', fecha_devolucion_real: new Date().toISOString().split('T')[0] })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
}

// ── Préstamos y Adelantos ──
export const solicitudesAdelantoService = {
  async getAll() {
    const { data, error } = await supabase
      .from('solicitudes_adelanto')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  async create(payload: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('solicitudes_adelanto')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },
  async updateEstado(id: string, estado: string) {
    const { data, error } = await supabase
      .from('solicitudes_adelanto')
      .update({ estado })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
}

// ── Caja Chica ──
export const cajaChicaService = {
  async getCajas() {
    const { data, error } = await supabase
      .from('caja_chica_cajas')
      .select('*')
      .order('area')
    if (error) throw error
    return data
  },
  async getGastos(cajaId: string) {
    const { data, error } = await supabase
      .from('caja_chica_gastos')
      .select('*')
      .eq('caja_id', cajaId)
      .order('fecha', { ascending: false })
    if (error) throw error
    return data
  },
  async registrarGasto(payload: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('caja_chica_gastos')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },
}

// ── Colaboradores ──
export const colaboradoresService = {
  async getByDNI(dni: string) {
    const { data, error } = await supabase
      .from('colaboradores')
      .select('*')
      .eq('dni', dni)
      .maybeSingle()
    if (error) throw error
    return data
  },
  async getAll() {
    const { data, error } = await supabase
      .from('colaboradores')
      .select('*')
      .order('apellidos')
    if (error) throw error
    return data
  },
}
