export type ContainerStatus = 'in-transit' | 'at-gate' | 'in-yard' | 'on-quay' | 'released' | 'hold';
export type EquipmentKind = 'quay-crane' | 'yard-crane' | 'terminal-truck' | 'reach-stacker';
export type TaskStatus = 'queued' | 'assigned' | 'executing' | 'blocked' | 'done';
export type AppointmentStatus = 'booked' | 'checked-in' | 'completed' | 'cancelled' | 'exception';

export interface Voyage { id: string; vessel: string; imo: string; service: string; eta: string; etd: string; status: 'approaching' | 'berthed' | 'loading' | 'departed'; berth: string; movesPlanned: number; movesDone: number; lateRisk: 'low' | 'medium' | 'high'; }
export interface Container { id: string; voyageId: string; size: '20' | '40' | '45'; isoType: string; direction: 'import' | 'export' | 'transshipment'; status: ContainerStatus; weightT: number; reefer: boolean; temperature?: number; hazmatClass?: string; customs: 'released' | 'inspection' | 'hold'; priority: 'normal' | 'hot' | 'reefer' | 'hazmat'; yardSlot: string; appointmentId?: string; lastEvent: string; }
export interface YardBlock { id: string; zone: string; rows: number; tiers: number; capacity: number; occupied: number; reeferPlugs: number; usedPlugs: number; hazmatAllowed: boolean; equipment: EquipmentKind[]; heat: number; }
export interface GateAppointment { id: string; containerId: string; truckNo: string; driver: string; type: 'pickup' | 'dropoff'; windowStart: string; windowEnd: string; lane: 'north' | 'south' | 'rail'; status: AppointmentStatus; sealVerified: boolean; weightVerified: boolean; exception?: string; }
export interface Equipment { id: string; name: string; kind: EquipmentKind; status: 'available' | 'working' | 'maintenance' | 'offline'; location: string; battery: number; queue: number; movesPerHour: number; }
export interface YardTask { id: string; kind: 'receive' | 'deliver' | 'rehandle' | 'load' | 'discharge' | 'inspect'; containerId: string; from: string; to: string; equipmentId?: string; priority: number; status: TaskStatus; scheduledAt: string; blockingReasons: string[]; estimatedMinutes: number; }
export interface AuditEvent { id: string; actor: string; action: string; entity: string; entityId: string; at: string; details: string; }

const start = Date.now(); const iso = (minutes: number) => new Date(start + minutes * 60000).toISOString();
export const voyages: Voyage[] = [
  { id: 'VOY-AX7', vessel: 'MSC Aurora', imo: 'IMO9382014', service: 'AE-3', eta: iso(-90), etd: iso(350), status: 'berthed', berth: 'B07', movesPlanned: 1240, movesDone: 886, lateRisk: 'medium' },
  { id: 'VOY-QF2', vessel: 'Ever Quartz', imo: 'IMO9721103', service: 'TP9', eta: iso(190), etd: iso(890), status: 'approaching', berth: 'B04', movesPlanned: 760, movesDone: 0, lateRisk: 'high' },
  { id: 'VOY-RD8', vessel: 'ONE Redwood', imo: 'IMO9812340', service: 'PNW', eta: iso(-700), etd: iso(-330), status: 'departed', berth: 'B02', movesPlanned: 520, movesDone: 520, lateRisk: 'low' }
];
export const blocks: YardBlock[] = [
  { id: 'A01', zone: 'North Import', rows: 14, tiers: 5, capacity: 280, occupied: 247, reeferPlugs: 18, usedPlugs: 16, hazmatAllowed: false, equipment: ['yard-crane', 'terminal-truck'], heat: 78 },
  { id: 'B07', zone: 'Central Transshipment', rows: 18, tiers: 5, capacity: 360, occupied: 302, reeferPlugs: 24, usedPlugs: 19, hazmatAllowed: true, equipment: ['yard-crane', 'reach-stacker', 'terminal-truck'], heat: 91 },
  { id: 'C03', zone: 'Export Pre-staging', rows: 12, tiers: 4, capacity: 192, occupied: 128, reeferPlugs: 8, usedPlugs: 3, hazmatAllowed: false, equipment: ['yard-crane', 'terminal-truck'], heat: 54 },
  { id: 'D05', zone: 'Inspection & Hold', rows: 8, tiers: 3, capacity: 96, occupied: 72, reeferPlugs: 5, usedPlugs: 4, hazmatAllowed: true, equipment: ['reach-stacker'], heat: 63 }
];
export const containers: Container[] = [
  { id: 'MSCU-4829017', voyageId: 'VOY-AX7', size: '40', isoType: '45G1', direction: 'import', status: 'in-yard', weightT: 22.4, reefer: false, customs: 'released', priority: 'hot', yardSlot: 'A01-R07-T3', lastEvent: '卸船完成 08:42' },
  { id: 'EISU-1288420', voyageId: 'VOY-AX7', size: '40', isoType: '45R1', direction: 'import', status: 'in-yard', weightT: 27.8, reefer: true, temperature: -18, customs: 'released', priority: 'reefer', yardSlot: 'B07-R03-T2', lastEvent: '温度回传正常 08:51' },
  { id: 'TGHU-9831204', voyageId: 'VOY-AX7', size: '20', isoType: '22K2', direction: 'transshipment', status: 'hold', weightT: 19.7, reefer: false, hazmatClass: '3', customs: 'inspection', priority: 'hazmat', yardSlot: 'D05-R02-T1', lastEvent: '海关查验挂起' },
  { id: 'OOLU-7734201', voyageId: 'VOY-AX7', size: '40', isoType: '45G1', direction: 'export', status: 'at-gate', weightT: 24.1, reefer: false, customs: 'released', priority: 'normal', yardSlot: 'C03-R06-T1', appointmentId: 'APT-9001', lastEvent: '南闸口已称重' },
  { id: 'CMAU-6001722', voyageId: 'VOY-QF2', size: '40', isoType: '45G1', direction: 'import', status: 'in-transit', weightT: 23.5, reefer: false, customs: 'released', priority: 'hot', yardSlot: 'B07-R10-T1', lastEvent: '船期 ETA +35min' },
  { id: 'FCIU-9920310', voyageId: 'VOY-QF2', size: '20', isoType: '22G1', direction: 'export', status: 'in-yard', weightT: 12.2, reefer: false, customs: 'released', priority: 'normal', yardSlot: 'C03-R04-T2', lastEvent: '待装船' },
  { id: 'TEMU-1774029', voyageId: 'VOY-AX7', size: '40', isoType: '45R1', direction: 'import', status: 'in-yard', weightT: 26.3, reefer: true, temperature: 4, customs: 'inspection', priority: 'reefer', yardSlot: 'D05-R05-T1', lastEvent: '待海关查验' }
];
export const appointments: GateAppointment[] = [
  { id: 'APT-9001', containerId: 'OOLU-7734201', truckNo: '沪A·7K229', driver: '陈海', type: 'dropoff', windowStart: iso(-14), windowEnd: iso(16), lane: 'south', status: 'checked-in', sealVerified: true, weightVerified: true },
  { id: 'APT-9002', containerId: 'MSCU-4829017', truckNo: '苏E·66218', driver: '王建国', type: 'pickup', windowStart: iso(34), windowEnd: iso(64), lane: 'north', status: 'booked', sealVerified: false, weightVerified: false },
  { id: 'APT-9003', containerId: 'EISU-1288420', truckNo: '沪B·02891', driver: '赵晨', type: 'pickup', windowStart: iso(38), windowEnd: iso(68), lane: 'north', status: 'booked', sealVerified: false, weightVerified: false },
  { id: 'APT-9004', containerId: 'FCIU-9920310', truckNo: '沪A·7K229', driver: '陈海', type: 'pickup', windowStart: iso(4), windowEnd: iso(22), lane: 'south', status: 'booked', sealVerified: false, weightVerified: false, exception: '同一车辆相邻窗口过短' }
];
export const equipment: Equipment[] = [
  { id: 'QC-07', name: '岸桥 QC-07', kind: 'quay-crane', status: 'working', location: 'B07 / MSC Aurora', battery: 96, queue: 4, movesPerHour: 31 },
  { id: 'YC-12', name: '场桥 YC-12', kind: 'yard-crane', status: 'working', location: 'B07-R03', battery: 72, queue: 9, movesPerHour: 24 },
  { id: 'YC-05', name: '场桥 YC-05', kind: 'yard-crane', status: 'available', location: 'C03-R06', battery: 88, queue: 3, movesPerHour: 27 },
  { id: 'TT-31', name: '集卡 TT-31', kind: 'terminal-truck', status: 'working', location: '南闸口', battery: 61, queue: 2, movesPerHour: 8 },
  { id: 'RS-02', name: '正面吊 RS-02', kind: 'reach-stacker', status: 'maintenance', location: 'D05', battery: 34, queue: 0, movesPerHour: 14 }
];
export const tasks: YardTask[] = [
  { id: 'TASK-101', kind: 'deliver', containerId: 'MSCU-4829017', from: 'A01-R07-T3', to: '南闸口', equipmentId: 'YC-12', priority: 92, status: 'assigned', scheduledAt: iso(12), blockingReasons: [], estimatedMinutes: 18 },
  { id: 'TASK-102', kind: 'rehandle', containerId: 'EISU-1288420', from: 'B07-R03-T2', to: 'D05-R05-T1', equipmentId: 'YC-12', priority: 88, status: 'queued', scheduledAt: iso(24), blockingReasons: ['查验区插件余量接近阈值'], estimatedMinutes: 26 },
  { id: 'TASK-103', kind: 'inspect', containerId: 'TGHU-9831204', from: 'D05-R02-T1', to: 'D05-R02-T1', priority: 125, status: 'blocked', scheduledAt: iso(4), blockingReasons: ['RS-02 维护中', '待海关查验窗口'], estimatedMinutes: 32 },
  { id: 'TASK-104', kind: 'load', containerId: 'FCIU-9920310', from: 'C03-R04-T2', to: 'B07 / VOY-QF2', equipmentId: 'YC-05', priority: 75, status: 'queued', scheduledAt: iso(76), blockingReasons: [], estimatedMinutes: 21 }
];
export const auditEvents: AuditEvent[] = [{ id: 'AUD-500', actor: '中控调度员', action: 'REPLAN', entity: 'voyage', entityId: 'VOY-AX7', at: new Date(start - 20 * 60000).toISOString(), details: '因 QC-07 瞬时降速，重新计算 14 个高优先级作业' }];

function parseSlot(slot: string) { const match = slot.match(/^([A-Z]\d\d)-/); return match?.[1]; }
export function dashboard() {
  const activeVoyages = voyages.filter(v => v.status !== 'departed');
  const yardCapacity = blocks.reduce((sum, block) => sum + block.capacity, 0); const yardOccupied = blocks.reduce((sum, block) => sum + block.occupied, 0);
  return { activeVoyages: activeVoyages.length, berthMoves: activeVoyages.reduce((sum, v) => sum + v.movesPlanned - v.movesDone, 0), yardUtilization: yardOccupied / yardCapacity, gateQueue: appointments.filter(a => a.status === 'checked-in').length + 7, pendingTasks: tasks.filter(t => t.status !== 'done').length, blockedTasks: tasks.filter(t => t.status === 'blocked').length, reeferAlerts: containers.filter(c => c.reefer && (c.customs === 'inspection' || (c.temperature ?? 0) > 5)).length, hazmatHolds: containers.filter(c => c.hazmatClass && c.customs !== 'released').length, lateVessels: activeVoyages.filter(v => v.lateRisk === 'high').length };
}
export function gateConflicts() {
  const result: { severity: 'critical' | 'warning'; appointmentId: string; reason: string }[] = [];
  appointments.forEach((a, index) => appointments.slice(index + 1).forEach(b => {
    const overlap = a.truckNo === b.truckNo && new Date(a.windowStart).getTime() < new Date(b.windowEnd).getTime() && new Date(b.windowStart).getTime() < new Date(a.windowEnd).getTime();
    if (overlap) result.push({ severity: 'critical', appointmentId: a.id, reason: `车辆 ${a.truckNo} 与 ${b.id} 时间窗口重叠，需重新分配闸口时隙` });
  }));
  appointments.filter(a => a.status === 'booked').forEach(a => { const container = containers.find(c => c.id === a.containerId); if (container?.customs !== 'released') result.push({ severity: 'warning', appointmentId: a.id, reason: `箱 ${a.containerId} 海关状态为 ${container?.customs}，无法无条件放行` }); });
  return result;
}
export function yardHeatmap() {
  refreshPlanSessions();
  return blocks.map(block => {
    const reserved = reservedSlots(block.id); const reservedPlugCount = reservedPlugs(block.id);
    const committed = block.occupied + reserved;
    return { ...block, reserved, reservedPlugs: reservedPlugCount, utilization: committed / block.capacity, freeSlots: block.capacity - committed, pressure: block.heat > 85 ? 'critical' : block.heat > 65 ? 'warning' : 'normal' };
  });
}
export function containerPlan(containerId: string) {
  const container = containers.find(c => c.id === containerId); if (!container) return undefined;
  const reasons: string[] = []; const candidates = blocks.filter(block => block.capacity > block.occupied && (!container.hazmatClass || block.hazmatAllowed) && (!container.reefer || block.reeferPlugs > block.usedPlugs));
  if (container.customs !== 'released' && container.status === 'in-yard') reasons.push('海关未放行，必须保持在查验/监管区');
  const ranked = candidates.map(block => ({ block, score: (block.capacity - block.occupied) * 2 - block.heat - (container.reefer && block.reeferPlugs - block.usedPlugs < 3 ? 18 : 0) - (container.hazmatClass && !block.hazmatAllowed ? 100 : 0) })).sort((a, b) => b.score - a.score);
  if (!ranked.length) reasons.push('没有同时满足危险品、冷藏电源与容量约束的区块');
  const selected = ranked[0]?.block; if (container.reefer && selected) reasons.push(`需要占用 ${selected.reeferPlugs - selected.usedPlugs} 个剩余冷插位中的 1 个`);
  if (container.hazmatClass) reasons.push(`危险品 ${container.hazmatClass} 级，只能进入有隔离资质的区块`);
  return { container, recommendedBlock: selected, alternatives: ranked.slice(1, 3).map(item => item.block), reasons };
}
export function prioritizeTasks() { return tasks.map(task => ({ ...task, score: task.priority + (task.blockingReasons.length ? -20 : 10) + (task.kind === 'inspect' ? 12 : 0) })).sort((a, b) => b.score - a.score); }
export function createAppointment(input: Omit<GateAppointment, 'id' | 'status' | 'sealVerified' | 'weightVerified'>) {
  const container = containers.find(item => item.id === input.containerId); if (!container) throw new Error('箱号不存在');
  if (container.customs !== 'released' && input.type === 'pickup') throw new Error('海关未放行，不能预约提箱');
  const item: GateAppointment = { ...input, id: `APT-${Date.now()}`, status: 'booked', sealVerified: false, weightVerified: false }; appointments.unshift(item); container.appointmentId = item.id; return item;
}
export function updateAppointment(id: string, patch: Partial<Pick<GateAppointment, 'status' | 'sealVerified' | 'weightVerified' | 'exception'>>) { const item = appointments.find(a => a.id === id); if (!item) return undefined; Object.assign(item, patch); const container = containers.find(c => c.id === item.containerId); if (item.status === 'checked-in' && container) container.status = 'at-gate'; if (item.status === 'completed' && container) container.status = item.type === 'pickup' ? 'released' : 'in-yard'; auditEvents.unshift({ id: `AUD-${Date.now()}`, actor: '闸口值班员', action: 'GATE_UPDATE', entity: 'appointment', entityId: id, at: new Date().toISOString(), details: JSON.stringify(patch) }); return item; }
export function assignTask(id: string, equipmentId: string) { const task = tasks.find(item => item.id === id); const machine = equipment.find(item => item.id === equipmentId); if (!task || !machine) return undefined; const blockingReasons = [...task.blockingReasons]; if (machine.status === 'maintenance' || machine.status === 'offline') blockingReasons.push(`${machine.name} 当前不可用`); if (task.kind === 'inspect' && machine.kind !== 'reach-stacker') blockingReasons.push('查验作业需要正面吊或专用设备'); task.equipmentId = equipmentId; task.status = blockingReasons.length ? 'blocked' : 'assigned'; task.blockingReasons = blockingReasons; auditEvents.unshift({ id: `AUD-${Date.now()}`, actor: '中控调度员', action: 'ASSIGN_TASK', entity: 'yard-task', entityId: id, at: new Date().toISOString(), details: `${equipmentId} -> ${task.containerId}` }); return task; }
export function containerDetail(id: string) { const container = containers.find(item => item.id === id); if (!container) return undefined; return { container, voyage: voyages.find(v => v.id === container.voyageId), appointment: appointments.find(a => a.id === container.appointmentId), plan: containerPlan(id), tasks: tasks.filter(t => t.containerId === id) }; }

export type ContainerInput = Omit<Container, 'lastEvent' | 'appointmentId'> & { appointmentId?: string };
export type AppointmentInput = Pick<GateAppointment, 'containerId' | 'truckNo' | 'driver' | 'type' | 'windowStart' | 'windowEnd' | 'lane'>;
export type TaskInput = Pick<YardTask, 'kind' | 'containerId' | 'from' | 'to' | 'priority' | 'scheduledAt' | 'estimatedMinutes'> & { equipmentId?: string };

function recordAudit(action: string, entity: string, entityId: string, details: string) {
  auditEvents.unshift({ id: `AUD-${Date.now()}`, actor: '中控调度员', action, entity, entityId, at: new Date().toISOString(), details });
}

export function createContainer(input: ContainerInput) {
  const id = input.id.trim().toUpperCase();
  if (!id) throw new Error('箱号不能为空');
  if (containers.some(item => item.id === id)) throw new Error(`箱号 ${id} 已存在`);
  if (!voyages.some(item => item.id === input.voyageId)) throw new Error('关联航次不存在');
  const blockId = parseSlot(input.yardSlot);
  if (blockId && !blocks.some(block => block.id === blockId)) throw new Error('堆位所属区块不存在');
  if (input.hazmatClass && blockId && !blocks.find(block => block.id === blockId)?.hazmatAllowed) throw new Error('危险品不能进入当前堆场区块');
  if (input.reefer && blockId) {
    const block = blocks.find(item => item.id === blockId);
    if (block && block.reeferPlugs <= block.usedPlugs) throw new Error('当前区块没有可用冷藏插座');
  }
  const item: Container = { ...input, id, lastEvent: `人工建档 ${new Date().toLocaleString()}` };
  containers.unshift(item);
  recordAudit('CREATE', 'container', item.id, '新增集装箱台账记录');
  return item;
}

export function updateContainer(id: string, patch: Partial<Omit<Container, 'id' | 'lastEvent'>>) {
  const item = containers.find(container => container.id === id);
  if (!item) return undefined;
  if (patch.voyageId && !voyages.some(voyage => voyage.id === patch.voyageId)) throw new Error('关联航次不存在');
  const next = { ...item, ...patch };
  const blockId = parseSlot(next.yardSlot);
  if (blockId && !blocks.some(block => block.id === blockId)) throw new Error('堆位所属区块不存在');
  if (next.hazmatClass && blockId && !blocks.find(block => block.id === blockId)?.hazmatAllowed) throw new Error('危险品不能进入当前堆场区块');
  Object.assign(item, patch, { lastEvent: `台账更新 ${new Date().toLocaleString()}` });
  recordAudit('UPDATE', 'container', id, '更新集装箱台账字段');
  refreshPlanSessions();
  return item;
}

export function deleteContainer(id: string) {
  const index = containers.findIndex(item => item.id === id);
  if (index < 0) return undefined;
  const [item] = containers.splice(index, 1);
  const removedAppointments = appointments.filter(appointment => appointment.containerId === id);
  for (const appointment of removedAppointments) appointments.splice(appointments.indexOf(appointment), 1);
  const removedTasks = tasks.filter(task => task.containerId === id);
  for (const task of removedTasks) tasks.splice(tasks.indexOf(task), 1);
  recordAudit('DELETE', 'container', id, `删除箱务记录，并级联清理 ${removedAppointments.length} 条预约、${removedTasks.length} 条未完成任务`);
  refreshPlanSessions();
  return item;
}

export function createGateAppointment(input: AppointmentInput) {
  const container = containers.find(item => item.id === input.containerId);
  if (!container) throw new Error('箱号不存在');
  if (input.type === 'pickup' && container.customs !== 'released') throw new Error('海关未放行，不能预约提箱');
  if (new Date(input.windowEnd) <= new Date(input.windowStart)) throw new Error('预约结束时间必须晚于开始时间');
  const item: GateAppointment = { ...input, id: `APT-${Date.now()}`, status: 'booked', sealVerified: false, weightVerified: false };
  appointments.unshift(item);
  container.appointmentId = item.id;
  recordAudit('CREATE', 'appointment', item.id, `为 ${item.containerId} 创建闸口预约`);
  return item;
}

export function editGateAppointment(id: string, patch: Partial<AppointmentInput & Pick<GateAppointment, 'status' | 'sealVerified' | 'weightVerified' | 'exception'>>) {
  const item = appointments.find(appointment => appointment.id === id);
  if (!item) return undefined;
  if (patch.containerId && !containers.some(container => container.id === patch.containerId)) throw new Error('箱号不存在');
  if (patch.windowStart && patch.windowEnd && new Date(patch.windowEnd) <= new Date(patch.windowStart)) throw new Error('预约结束时间必须晚于开始时间');
  const previousContainer = containers.find(container => container.id === item.containerId);
  Object.assign(item, patch);
  const nextContainer = containers.find(container => container.id === item.containerId);
  if (previousContainer && previousContainer.id !== nextContainer?.id && previousContainer.appointmentId === id) previousContainer.appointmentId = undefined;
  if (nextContainer) nextContainer.appointmentId = id;
  if (item.status === 'checked-in' && nextContainer) nextContainer.status = 'at-gate';
  if (item.status === 'completed' && nextContainer) nextContainer.status = item.type === 'pickup' ? 'released' : 'in-yard';
  recordAudit('UPDATE', 'appointment', id, `更新预约状态/时隙：${JSON.stringify(patch)}`);
  return item;
}

export function deleteGateAppointment(id: string) {
  const index = appointments.findIndex(item => item.id === id);
  if (index < 0) return undefined;
  const [item] = appointments.splice(index, 1);
  const container = containers.find(entry => entry.id === item.containerId);
  if (container?.appointmentId === id) container.appointmentId = undefined;
  recordAudit('DELETE', 'appointment', id, `取消并删除 ${item.containerId} 的闸口预约`);
  return item;
}

export function createYardTask(input: TaskInput) {
  if (!containers.some(container => container.id === input.containerId)) throw new Error('关联箱号不存在');
  if (input.priority < 1 || input.priority > 100) throw new Error('优先级范围为 1–100');
  if (input.estimatedMinutes <= 0) throw new Error('预计作业时长必须大于 0');
  const item: YardTask = { ...input, id: `TASK-${Date.now()}`, status: input.equipmentId ? 'assigned' : 'queued', blockingReasons: [], scheduledAt: input.scheduledAt };
  tasks.unshift(item);
  recordAudit('CREATE', 'yard-task', item.id, `创建 ${input.kind} 任务，关联 ${input.containerId}`);
  return item;
}

export function updateYardTask(id: string, patch: Partial<TaskInput & Pick<YardTask, 'status' | 'blockingReasons'>>) {
  const item = tasks.find(task => task.id === id);
  if (!item) return undefined;
  if (patch.containerId && !containers.some(container => container.id === patch.containerId)) throw new Error('关联箱号不存在');
  if (patch.priority !== undefined && (patch.priority < 1 || patch.priority > 100)) throw new Error('优先级范围为 1–100');
  Object.assign(item, patch);
  recordAudit('UPDATE', 'yard-task', id, `更新场内作业任务：${JSON.stringify(patch)}`);
  return item;
}

export function deleteYardTask(id: string) {
  const index = tasks.findIndex(item => item.id === id);
  if (index < 0) return undefined;
  const [item] = tasks.splice(index, 1);
  recordAudit('DELETE', 'yard-task', id, `删除 ${item.containerId} 的场内任务`);
  return item;
}

// ---------- 堆位方案工作台 ----------
export type PlanSessionStatus = 'open' | 'locked' | 'cancelled' | 'invalidated';
export interface PlanConstraintHit { key: string; label: string; status: 'pass' | 'warn' | 'fail'; detail: string; }
export interface PlanCost { travelMinutes: number; rehandles: number; plugCost: number; heatPenalty: number; total: number; breakdown: string[]; }
export interface SlotPlanCandidate { id: string; blockId: string; slot: string; feasible: boolean; score: number; constraints: PlanConstraintHit[]; cost: PlanCost; risks: string[]; }
export interface SlotPlanSession { id: string; containerId: string; targetVoyageId: string; expectedPickupAt: string; createdAt: string; fingerprint: string; status: PlanSessionStatus; candidates: SlotPlanCandidate[]; lockedCandidateId?: string; createdTaskId?: string; invalidReason?: string; }
export interface SlotReservation { id: string; sessionId: string; blockId: string; slot: string; reefer: boolean; createdAt: string; }

export const slotPlanSessions: SlotPlanSession[] = [];
export const slotReservations: SlotReservation[] = [];

let planSeq = 0;
const nextPlanId = (prefix: string) => `${prefix}-${Date.now()}-${(planSeq += 1)}`;
const planPriority: Record<Container['priority'], number> = { normal: 50, hot: 90, reefer: 80, hazmat: 85 };
const gateTravelMinutes: Record<string, number> = { A01: 6, B07: 11, C03: 4, D05: 8 };
const isInspectionBlock = (block: YardBlock) => /inspection|hold|查验|监管/i.test(block.zone);
const reservedSlots = (blockId: string) => slotReservations.filter(item => item.blockId === blockId).length;
const reservedPlugs = (blockId: string) => slotReservations.filter(item => item.blockId === blockId && item.reefer).length;

// 指纹只包含会推翻方案前提的箱况字段：冷藏、危险品、海关、箱型、航次
const fingerprintOf = (container: Container) => JSON.stringify([container.reefer, container.hazmatClass ?? '', container.customs, container.size, container.voyageId]);
const fingerprintLabels = ['冷藏属性', '危险品级别', '海关状态', '箱型尺寸', '关联航次'];
function fingerprintDiff(oldFingerprint: string, container: Container) {
  const before = JSON.parse(oldFingerprint) as unknown[];
  const after = JSON.parse(fingerprintOf(container)) as unknown[];
  return fingerprintLabels.filter((_, index) => before[index] !== after[index]);
}

function releaseReservation(session: SlotPlanSession, reason: string) {
  const index = slotReservations.findIndex(item => item.sessionId === session.id);
  if (index >= 0) slotReservations.splice(index, 1);
  if (session.createdTaskId) {
    const task = tasks.find(item => item.id === session.createdTaskId);
    if (task && task.status !== 'done' && !task.blockingReasons.includes(reason)) {
      task.status = 'blocked';
      task.blockingReasons.push(reason);
    }
  }
}

// 条件变化后让旧方案失效：释放预留、阻塞关联任务、留下重新规划提示
export function refreshPlanSessions() {
  for (const session of slotPlanSessions) {
    if (session.status !== 'open' && session.status !== 'locked') continue;
    const container = containers.find(item => item.id === session.containerId);
    const changed = container ? fingerprintDiff(session.fingerprint, container) : ['箱务记录'];
    if (!container || changed.length) {
      session.status = 'invalidated';
      session.invalidReason = container ? `${changed.join('、')}发生变化，原方案约束前提已不成立，请重新规划` : '箱务记录已删除，方案自动失效';
      releaseReservation(session, '方案已失效，预留容量已释放，任务待重新规划');
    }
  }
}

function findFreeSlot(block: YardBlock) {
  const taken = new Set([...containers.map(item => item.yardSlot), ...slotReservations.map(item => item.slot)]);
  for (let row = 1; row <= block.rows; row += 1) {
    for (let tier = 1; tier <= block.tiers; tier += 1) {
      const slot = `${block.id}-R${String(row).padStart(2, '0')}-T${tier}`;
      if (!taken.has(slot)) return slot;
    }
  }
  return undefined;
}

function evaluateCandidate(container: Container, block: YardBlock, voyage: Voyage, expectedPickupAt: string, slot: string | undefined, index: number, sessionId: string): SlotPlanCandidate {
  const constraints: PlanConstraintHit[] = [];
  const risks: string[] = [];
  const reserved = reservedSlots(block.id);
  const freeSlots = block.capacity - block.occupied - reserved;
  const utilization = (block.occupied + reserved) / block.capacity;
  constraints.push(freeSlots <= 0
    ? { key: 'capacity', label: '容量', status: 'fail', detail: `区块已满（含 ${reserved} 个方案预留）` }
    : freeSlots / block.capacity < 0.08
      ? { key: 'capacity', label: '容量', status: 'warn', detail: `仅剩 ${freeSlots} 个空位，低于 8% 安全线` }
      : { key: 'capacity', label: '容量', status: 'pass', detail: `剩余 ${freeSlots} 个空位（已扣除 ${reserved} 个方案预留）` });
  if (!container.reefer) {
    constraints.push({ key: 'reefer', label: '冷藏插座', status: 'pass', detail: '非冷藏箱，无需占用插座' });
  } else {
    const freePlugs = block.reeferPlugs - block.usedPlugs - reservedPlugs(block.id);
    constraints.push(freePlugs <= 0
      ? { key: 'reefer', label: '冷藏插座', status: 'fail', detail: '无可用冷藏插座（含其他方案预留）' }
      : freePlugs <= 2
        ? { key: 'reefer', label: '冷藏插座', status: 'warn', detail: `仅剩 ${freePlugs} 个冷插位，余量告急` }
        : { key: 'reefer', label: '冷藏插座', status: 'pass', detail: `剩余 ${freePlugs} 个冷插位，锁定后占用 1 个` });
    if (freePlugs > 0 && freePlugs <= 2) risks.push('冷藏插座余量告急，温控异常时无备用位');
  }
  constraints.push(!container.hazmatClass
    ? { key: 'hazmat', label: '危险品隔离', status: 'pass', detail: '非危险品箱，无隔离要求' }
    : block.hazmatAllowed
      ? { key: 'hazmat', label: '危险品隔离', status: 'pass', detail: `区块具备 ${container.hazmatClass} 类危险品隔离资质` }
      : { key: 'hazmat', label: '危险品隔离', status: 'fail', detail: `危险品 ${container.hazmatClass} 类，区块无隔离资质` });
  constraints.push(container.customs === 'released'
    ? { key: 'customs', label: '海关监管', status: 'pass', detail: '海关已放行，无监管区限制' }
    : isInspectionBlock(block)
      ? { key: 'customs', label: '海关监管', status: 'pass', detail: `海关状态为 ${container.customs}，本区块为查验/监管区` }
      : { key: 'customs', label: '海关监管', status: 'fail', detail: `海关状态为 ${container.customs}，必须进入查验/监管区` });
  const reachable = block.equipment.filter(kind => equipment.some(item => item.kind === kind && (item.status === 'available' || item.status === 'working')));
  constraints.push(!reachable.length
    ? { key: 'equipment', label: '设备可达性', status: 'fail', detail: `区块设备均不可用（${block.equipment.join(' / ')}）` }
    : reachable.length === 1
      ? { key: 'equipment', label: '设备可达性', status: 'warn', detail: `仅 ${reachable[0]} 一类设备可达，冗余不足` }
      : { key: 'equipment', label: '设备可达性', status: 'pass', detail: `${reachable.join('、')} 均可到达` });
  if (reachable.length === 1) risks.push('仅单类设备可达，设备故障将中断作业');
  if (container.weightT > 28 && !block.equipment.includes('yard-crane')) {
    constraints.push({ key: 'size', label: '箱型与重量', status: 'fail', detail: `超重箱 ${container.weightT}t 需要场桥作业，本区块不具备` });
  } else {
    constraints.push({ key: 'size', label: '箱型与重量', status: 'pass', detail: `${container.size}ft / ${container.weightT}t 与区块设备能力匹配` });
  }
  if (voyage.status === 'departed') {
    constraints.push({ key: 'voyage', label: '航次衔接', status: 'fail', detail: `目标航次 ${voyage.id} 已离港` });
  } else if (container.direction !== 'import' && new Date(expectedPickupAt).getTime() > new Date(voyage.etd).getTime()) {
    constraints.push({ key: 'voyage', label: '航次衔接', status: 'warn', detail: `预计提箱时间晚于 ${voyage.id} 离港时间，存在误船风险` });
  } else {
    constraints.push({ key: 'voyage', label: '航次衔接', status: 'pass', detail: `${voyage.id} ${voyage.vessel} · ${voyage.status} · ETD ${voyage.etd.slice(11, 16)}` });
  }
  if (voyage.lateRisk === 'high') risks.push('目标航次延误风险高，作业窗口可能调整');
  if (!slot) constraints.push({ key: 'slot', label: '物理堆位', status: 'fail', detail: '区块内已无可分配的物理堆位' });
  const inYard = container.status === 'in-yard' || container.status === 'hold';
  const travelMinutes = (gateTravelMinutes[block.id] ?? 8) + (inYard ? 4 : 0) + (container.direction === 'export' ? 3 : 0);
  const rehandles = Math.round(utilization * block.tiers);
  const plugCost = container.reefer ? 12 : 0;
  const heatPenalty = block.heat > 85 ? 15 : block.heat > 65 ? 6 : 0;
  const total = travelMinutes * 2 + rehandles * 6 + plugCost + heatPenalty;
  const breakdown = [
    `水平运输约 ${travelMinutes} 分钟（代价 ${travelMinutes * 2}）`,
    `预计翻箱 ${rehandles} 次（代价 ${rehandles * 6}）`
  ];
  if (plugCost) breakdown.push(`冷藏接电与巡检（代价 ${plugCost}）`);
  if (heatPenalty) breakdown.push(`热区排队惩罚（代价 ${heatPenalty}）`);
  if (utilization > 0.85) risks.push('区块利用率超过 85%，高峰时段翻箱率上升');
  if (block.heat > 85) risks.push('区块热度临界，设备排队概率高');
  const fails = constraints.filter(item => item.status === 'fail').length;
  const feasible = fails === 0;
  const score = Math.max(0, Math.round(100 - total - fails * 40));
  return { id: `${sessionId}-C${index}`, blockId: block.id, slot: slot ?? `${block.id}-无可用位`, feasible, score, constraints, cost: { travelMinutes, rehandles, plugCost, heatPenalty, total, breakdown }, risks };
}

export function listPlanSessions() { refreshPlanSessions(); return slotPlanSessions; }

export function generateSlotPlan(input: { containerId: string; targetVoyageId?: string; expectedPickupAt?: string }) {
  refreshPlanSessions();
  const container = containers.find(item => item.id === input.containerId);
  if (!container) throw new Error('箱号不存在');
  const targetVoyageId = input.targetVoyageId || container.voyageId;
  const voyage = voyages.find(item => item.id === targetVoyageId);
  if (!voyage) throw new Error('目标航次不存在');
  const expectedPickupAt = input.expectedPickupAt ?? new Date(Date.now() + 120 * 60000).toISOString();
  // 同一箱只保留一个待决策批次，避免多批次并行占用决策
  for (const session of slotPlanSessions) {
    if (session.containerId === container.id && session.status === 'open') {
      session.status = 'cancelled';
      session.invalidReason = '已被新的方案批次取代';
    }
  }
  const sessionId = nextPlanId('PLAN');
  const candidates = blocks
    .map((block, index) => evaluateCandidate(container, block, voyage, expectedPickupAt, findFreeSlot(block), index + 1, sessionId))
    .sort((a, b) => Number(b.feasible) - Number(a.feasible) || b.score - a.score);
  const session: SlotPlanSession = { id: sessionId, containerId: container.id, targetVoyageId, expectedPickupAt, createdAt: new Date().toISOString(), fingerprint: fingerprintOf(container), status: 'open', candidates };
  slotPlanSessions.unshift(session);
  recordAudit('PLAN_GENERATE', 'slot-plan', sessionId, `为 ${container.id} 生成 ${candidates.length} 个候选堆位方案（目标航次 ${targetVoyageId}）`);
  return session;
}

export function lockSlotPlan(sessionId: string, candidateId: string) {
  refreshPlanSessions();
  const session = slotPlanSessions.find(item => item.id === sessionId);
  if (!session) return undefined;
  if (session.status === 'invalidated') throw new Error('方案已失效，请重新生成方案');
  if (session.status !== 'open') throw new Error('只有待决策状态的方案可以锁定');
  const candidate = session.candidates.find(item => item.id === candidateId);
  if (!candidate) throw new Error('候选方案不存在');
  if (!candidate.feasible) throw new Error('该候选方案存在未满足的硬约束，不能锁定');
  const container = containers.find(item => item.id === session.containerId);
  if (!container) throw new Error('箱号不存在');
  if (slotPlanSessions.some(item => item.containerId === container.id && item.status === 'locked')) throw new Error('该箱已有锁定的方案，请先取消锁定');
  const block = blocks.find(item => item.id === candidate.blockId);
  if (!block) throw new Error('候选区块不存在');
  // 锁定瞬间按当前占用重新校验，防止同一容量被重复占用
  if (slotReservations.some(item => item.slot === candidate.slot)) throw new Error('目标堆位刚被其他方案占用，请重新生成方案');
  if (block.capacity - block.occupied - reservedSlots(block.id) <= 0) throw new Error('目标区块容量刚被占满，请重新生成方案');
  if (container.reefer && block.reeferPlugs - block.usedPlugs - reservedPlugs(block.id) <= 0) throw new Error('冷藏插座刚被其他方案占用，请重新生成方案');
  slotReservations.push({ id: nextPlanId('RSV'), sessionId: session.id, blockId: block.id, slot: candidate.slot, reefer: container.reefer, createdAt: new Date().toISOString() });
  const inYard = container.status === 'in-yard' || container.status === 'hold';
  const task: YardTask = {
    id: nextPlanId('TASK'), kind: inYard ? 'rehandle' : 'receive', containerId: container.id,
    from: inYard ? container.yardSlot : container.direction === 'export' ? '闸口' : `船边/${container.voyageId}`,
    to: candidate.slot, priority: planPriority[container.priority], status: 'queued',
    scheduledAt: session.expectedPickupAt, blockingReasons: [],
    estimatedMinutes: Math.max(6, candidate.cost.travelMinutes + candidate.cost.rehandles * 4 + 6)
  };
  tasks.unshift(task);
  session.status = 'locked';
  session.lockedCandidateId = candidateId;
  session.createdTaskId = task.id;
  recordAudit('PLAN_LOCK', 'slot-plan', session.id, `锁定 ${candidate.blockId} ${candidate.slot}，预留容量并创建 ${task.id}`);
  return session;
}

export function unlockSlotPlan(sessionId: string) {
  const session = slotPlanSessions.find(item => item.id === sessionId);
  if (!session) return undefined;
  if (session.status !== 'locked') throw new Error('只有已锁定的方案可以取消锁定');
  releaseReservation(session, '方案锁定已取消，预留容量已释放');
  session.status = 'open';
  session.lockedCandidateId = undefined;
  session.createdTaskId = undefined;
  recordAudit('PLAN_UNLOCK', 'slot-plan', session.id, '取消锁定，容量预留已恢复');
  return session;
}

export function cancelSlotPlan(sessionId: string) {
  const session = slotPlanSessions.find(item => item.id === sessionId);
  if (!session) return undefined;
  if (session.status === 'cancelled' || session.status === 'invalidated') throw new Error('方案批次已关闭');
  releaseReservation(session, '方案批次已取消，预留容量已释放');
  session.status = 'cancelled';
  recordAudit('PLAN_CANCEL', 'slot-plan', session.id, '取消方案批次，容量预留已恢复');
  return session;
}
