export type ContainerStatus = 'in-transit' | 'at-gate' | 'in-yard' | 'on-quay' | 'released' | 'hold';
export type EquipmentKind = 'quay-crane' | 'yard-crane' | 'terminal-truck' | 'reach-stacker';
export type TaskStatus = 'queued' | 'assigned' | 'executing' | 'blocked' | 'done';
export type AppointmentStatus = 'booked' | 'checked-in' | 'completed' | 'cancelled' | 'exception';

export interface Voyage { id: string; vessel: string; imo: string; service: string; eta: string; etd: string; status: 'approaching' | 'berthed' | 'loading' | 'departed'; berth: string; movesPlanned: number; movesDone: number; lateRisk: 'low' | 'medium' | 'high'; }
export interface Container { id: string; voyageId: string; size: '20' | '40' | '45'; isoType: string; direction: 'import' | 'export' | 'transshipment'; status: ContainerStatus; weightT: number; reefer: boolean; temperature?: number; hazmatClass?: string; customs: 'released' | 'inspection' | 'hold'; priority: 'normal' | 'hot' | 'reefer' | 'hazmat'; yardSlot: string; appointmentId?: string; lastEvent: string; }
export interface YardBlock { id: string; zone: string; rows: number; tiers: number; capacity: number; occupied: number; reeferPlugs: number; usedPlugs: number; hazmatAllowed: boolean; customsHold?: boolean; gateMinutes?: number; equipment: EquipmentKind[]; heat: number; }
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
  { id: 'A01', zone: 'North Import', rows: 14, tiers: 5, capacity: 280, occupied: 247, reeferPlugs: 18, usedPlugs: 16, hazmatAllowed: false, gateMinutes: 12, equipment: ['yard-crane', 'terminal-truck'], heat: 78 },
  { id: 'B07', zone: 'Central Transshipment', rows: 18, tiers: 5, capacity: 360, occupied: 302, reeferPlugs: 24, usedPlugs: 19, hazmatAllowed: true, gateMinutes: 8, equipment: ['yard-crane', 'reach-stacker', 'terminal-truck'], heat: 91 },
  { id: 'C03', zone: 'Export Pre-staging', rows: 12, tiers: 4, capacity: 192, occupied: 128, reeferPlugs: 8, usedPlugs: 3, hazmatAllowed: false, gateMinutes: 6, equipment: ['yard-crane', 'terminal-truck'], heat: 54 },
  { id: 'D05', zone: 'Inspection & Hold', rows: 8, tiers: 3, capacity: 96, occupied: 72, reeferPlugs: 5, usedPlugs: 4, hazmatAllowed: true, customsHold: true, gateMinutes: 15, equipment: ['reach-stacker'], heat: 63 }
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
export function yardHeatmap() { return blocks.map(block => ({ ...block, utilization: block.occupied / block.capacity, freeSlots: block.capacity - block.occupied, pressure: block.heat > 85 ? 'critical' : block.heat > 65 ? 'warning' : 'normal' })); }
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

// ---- 堆位方案工作台：多候选方案、容量预留、锁定/取消与失效重规划 ----
export type PlanStatus = 'draft' | 'locked' | 'cancelled' | 'invalidated';
export interface ConstraintHit { key: string; label: string; hard: boolean; passed: boolean; detail: string; }
export interface PlanCandidate { id: string; blockId: string; slot: string; score: number; constraintHits: ConstraintHit[]; cost: { travelMinutes: number; rehandles: number; plugContention: number; total: number }; risks: string[]; }
export interface SlotPlan { id: string; containerId: string; targetVoyageId?: string; etaPickup?: string; fingerprint: string; status: PlanStatus; candidates: PlanCandidate[]; lockedCandidateId?: string; taskId?: string; createdAt: string; note?: string; }
export interface SlotReservation { id: string; planId: string; containerId: string; blockId: string; reefer: boolean; createdAt: string; }
export const slotPlans: SlotPlan[] = [];
export const slotReservations: SlotReservation[] = [];

// 约束相关字段的指纹：冷藏/危险品/海关/航次等变化后旧方案必须失效
function planFingerprint(container: Container) {
  return JSON.stringify([container.reefer, container.temperature ?? null, container.hazmatClass ?? '', container.customs, container.size, container.direction, container.voyageId]);
}
// 已锁定方案占用的容量/冷插，候选生成时必须扣除，避免同一容量被重复占用
function effectiveUsage(blockId: string) {
  const reserved = slotReservations.filter(r => r.blockId === blockId);
  return { slots: reserved.length, plugs: reserved.filter(r => r.reefer).length };
}
const directionZones: Record<Container['direction'], RegExp> = { import: /Import/i, export: /Export/i, transshipment: /Transshipment/i };

export function generateSlotPlan(input: { containerId: string; targetVoyageId?: string; etaPickup?: string }) {
  const container = containers.find(c => c.id === input.containerId);
  if (!container) throw new Error('箱号不存在');
  if (input.targetVoyageId && !voyages.some(v => v.id === input.targetVoyageId)) throw new Error('目标航次不存在');
  if (input.etaPickup && Number.isNaN(new Date(input.etaPickup).getTime())) throw new Error('预计提箱时间格式无效');
  for (const plan of slotPlans.filter(p => p.containerId === container.id && p.status === 'draft')) { plan.status = 'invalidated'; plan.note = '已被新的规划取代，请使用最新方案'; }
  const pickup = input.etaPickup ? new Date(input.etaPickup).getTime() : undefined;
  const urgent = pickup !== undefined && pickup - Date.now() < 2 * 3600_000;
  const planId = `PLAN-${Date.now()}-${slotPlans.length + 1}`;
  const candidates: PlanCandidate[] = [];
  for (const block of blocks) {
    const usage = effectiveUsage(block.id);
    const freeSlots = block.capacity - block.occupied - usage.slots;
    const freePlugs = block.reeferPlugs - block.usedPlugs - usage.plugs;
    const machines = equipment.filter(item => block.equipment.includes(item.kind) && (item.status === 'available' || item.status === 'working'));
    const utilization = (block.occupied + usage.slots) / block.capacity;
    const rehandles = Math.round(utilization * block.tiers * 0.5);
    const queue = machines.length ? Math.min(...machines.map(m => m.queue)) : 5;
    const travelMinutes = (block.gateMinutes ?? 10) + queue * 2;
    const plugContention = container.reefer ? Math.max(0, 3 - freePlugs) : 0;
    const constraintHits: ConstraintHit[] = [
      { key: 'capacity', label: '容量', hard: true, passed: freeSlots > 0, detail: `剩余 ${freeSlots} TEU（含 ${usage.slots} 个已锁定预留）` },
      { key: 'reefer', label: '冷藏插座', hard: container.reefer, passed: !container.reefer || freePlugs > 0, detail: container.reefer ? `剩余冷插 ${freePlugs} 个（含预留占用）` : '普通箱，无需冷插' },
      { key: 'hazmat', label: '危险品隔离', hard: Boolean(container.hazmatClass), passed: !container.hazmatClass || block.hazmatAllowed, detail: container.hazmatClass ? (block.hazmatAllowed ? `${container.hazmatClass} 类隔离资质满足` : '区块无危险品隔离资质') : '非危险品，无隔离要求' },
      { key: 'customs', label: '海关监管', hard: container.customs !== 'released', passed: container.customs === 'released' || Boolean(block.customsHold), detail: container.customs === 'released' ? '海关已放行，无监管区限制' : `海关${container.customs === 'inspection' ? '查验中' : '扣留'}，须进查验/监管区` },
      { key: 'equipment', label: '设备可达', hard: false, passed: machines.length > 0, detail: machines.length ? `${machines.map(m => m.name).join('、')} 可调度` : '区块设备均不可用，需跨区调度' },
      { key: 'direction', label: '流向匹配', hard: false, passed: directionZones[container.direction].test(block.zone), detail: `${container.direction === 'import' ? '进口' : container.direction === 'export' ? '出口' : '中转'}流向与 ${block.zone} ${directionZones[container.direction].test(block.zone) ? '匹配' : '不匹配'}` }
    ];
    if (input.targetVoyageId) {
      const voyage = voyages.find(v => v.id === input.targetVoyageId)!;
      constraintHits.push({ key: 'voyage', label: '目标航次', hard: false, passed: voyage.status !== 'departed', detail: `${voyage.vessel} ETD ${voyage.etd.slice(11, 16)}，${voyage.status === 'departed' ? '已离港，需改配航次' : '可按船期预配'}` });
    }
    if (pickup !== undefined) constraintHits.push({ key: 'pickup', label: '提箱时效', hard: false, passed: !urgent || rehandles <= 2, detail: urgent ? `提箱在即（2 小时内），预计翻箱 ${rehandles} 次` : `提箱时间充裕，预计翻箱 ${rehandles} 次` });
    if (constraintHits.some(hit => hit.hard && !hit.passed)) continue;
    let score = 100 - travelMinutes * 1.2 - rehandles * 4 - plugContention * 6;
    if (!constraintHits.find(hit => hit.key === 'equipment')!.passed) score -= 15;
    if (!constraintHits.find(hit => hit.key === 'direction')!.passed) score -= 10;
    const pickupHit = constraintHits.find(hit => hit.key === 'pickup');
    if (pickupHit && !pickupHit.passed) score -= 12;
    const risks: string[] = [];
    if (block.heat > 85) risks.push('区块热度临界，高峰时段可能排队');
    if (utilization > 0.9) risks.push('容量接近饱和，后续翻箱概率高');
    if (container.reefer && freePlugs < 3) risks.push(`冷插余量仅 ${freePlugs} 个`);
    if (!machines.length) risks.push('区块设备不可用，需跨区调度');
    const slotSeq = block.occupied + usage.slots;
    candidates.push({
      id: `${planId}-C${candidates.length + 1}`, blockId: block.id,
      slot: `${block.id}-R${String(slotSeq % block.rows + 1).padStart(2, '0')}-T${slotSeq % block.tiers + 1}`,
      score: Math.round(score), constraintHits,
      cost: { travelMinutes, rehandles, plugContention, total: travelMinutes + rehandles * 3 + plugContention * 5 },
      risks
    });
  }
  candidates.sort((a, b) => b.score - a.score);
  candidates.forEach((candidate, index) => { candidate.id = `${planId}-C${index + 1}`; });
  const plan: SlotPlan = { id: planId, containerId: container.id, targetVoyageId: input.targetVoyageId, etaPickup: input.etaPickup, fingerprint: planFingerprint(container), status: 'draft', candidates, createdAt: new Date().toISOString(), ...(candidates.length ? {} : { note: '没有同时满足容量、冷藏、危险品与海关硬约束的可执行区块' }) };
  slotPlans.unshift(plan);
  recordAudit('PLAN_GENERATE', 'slot-plan', plan.id, `为 ${container.id} 生成 ${candidates.length} 个候选方案`);
  return plan;
}

export function lockSlotPlan(planId: string, candidateId: string) {
  const plan = slotPlans.find(p => p.id === planId);
  if (!plan) return undefined;
  if (plan.status !== 'draft') throw new Error(`方案当前状态为 ${plan.status}，不能锁定`);
  const container = containers.find(c => c.id === plan.containerId);
  if (!container) throw new Error('关联箱号不存在');
  if (planFingerprint(container) !== plan.fingerprint) { plan.status = 'invalidated'; plan.note = '箱关键属性已变化，方案自动失效'; throw new Error('箱约束属性已变化，方案失效，请重新规划'); }
  const candidate = plan.candidates.find(c => c.id === candidateId);
  if (!candidate) throw new Error('候选方案不存在');
  const block = blocks.find(b => b.id === candidate.blockId);
  if (!block) throw new Error('候选区块不存在');
  const usage = effectiveUsage(block.id);
  const hardFail = block.capacity - block.occupied - usage.slots <= 0
    || (container.reefer && block.reeferPlugs - block.usedPlugs - usage.plugs <= 0)
    || (container.hazmatClass && !block.hazmatAllowed)
    || (container.customs !== 'released' && !block.customsHold);
  if (hardFail) { plan.status = 'invalidated'; plan.note = '锁定前复核发现容量/约束已变化'; throw new Error('区块容量或约束条件已变化，方案失效，请重新规划'); }
  slotReservations.push({ id: `RSV-${Date.now()}-${slotReservations.length + 1}`, planId: plan.id, containerId: container.id, blockId: block.id, reefer: container.reefer, createdAt: new Date().toISOString() });
  const kind = container.status === 'in-yard' || container.status === 'hold' ? 'rehandle' : 'receive';
  const priority = { hot: 90, hazmat: 85, reefer: 80, normal: 60 }[container.priority];
  const task = createYardTask({ kind, containerId: container.id, from: container.yardSlot, to: candidate.slot, priority, scheduledAt: new Date().toISOString(), estimatedMinutes: candidate.cost.travelMinutes + 6 });
  plan.status = 'locked'; plan.lockedCandidateId = candidate.id; plan.taskId = task.id;
  recordAudit('PLAN_LOCK', 'slot-plan', plan.id, `锁定 ${block.id} 候选位 ${candidate.slot}，预留容量并创建任务 ${task.id}`);
  return plan;
}

function releasePlanReservation(plan: SlotPlan, reason: string) {
  const index = slotReservations.findIndex(r => r.planId === plan.id);
  if (index >= 0) slotReservations.splice(index, 1);
  if (plan.taskId) {
    const taskIndex = tasks.findIndex(t => t.id === plan.taskId);
    const task = tasks[taskIndex];
    if (task && task.status !== 'done' && task.status !== 'executing') tasks.splice(taskIndex, 1);
    else if (task && task.status !== 'done') { task.status = 'blocked'; task.blockingReasons = [...task.blockingReasons, reason]; }
  }
}

export function cancelSlotPlan(planId: string) {
  const plan = slotPlans.find(p => p.id === planId);
  if (!plan) return undefined;
  if (plan.status === 'cancelled' || plan.status === 'invalidated') return plan;
  if (plan.status === 'locked') releasePlanReservation(plan, '方案已取消，容量预留已释放');
  plan.status = 'cancelled'; plan.note = '调度员取消方案，占用预留已恢复';
  recordAudit('PLAN_CANCEL', 'slot-plan', plan.id, `取消 ${plan.containerId} 的堆位方案并释放预留`);
  return plan;
}

export function invalidateContainerPlans(containerId: string, reason: string) {
  const affected = slotPlans.filter(p => p.containerId === containerId && (p.status === 'draft' || p.status === 'locked'));
  for (const plan of affected) {
    if (plan.status === 'locked') releasePlanReservation(plan, reason);
    plan.status = 'invalidated'; plan.note = `${reason}，请重新规划`;
  }
  if (affected.length) recordAudit('PLAN_INVALIDATE', 'container', containerId, `${reason}，${affected.length} 个方案失效`);
  return affected.length;
}

// 任务完成时把锁定预留转为实际堆存，容量口径保持一致
function settleLockedPlan(task: YardTask) {
  const plan = slotPlans.find(p => p.taskId === task.id && p.status === 'locked');
  if (!plan) return;
  const index = slotReservations.findIndex(r => r.planId === plan.id);
  if (index < 0) return;
  const [reservation] = slotReservations.splice(index, 1);
  const block = blocks.find(b => b.id === reservation.blockId);
  if (block) { block.occupied = Math.min(block.capacity, block.occupied + 1); if (reservation.reefer) block.usedPlugs = Math.min(block.reeferPlugs, block.usedPlugs + 1); }
  const container = containers.find(c => c.id === plan.containerId);
  if (container) { container.yardSlot = task.to; container.status = 'in-yard'; }
  plan.note = '任务完成，预留已转为实际堆存';
  recordAudit('PLAN_SETTLE', 'slot-plan', plan.id, `任务 ${task.id} 完成，预留容量转为实际占用`);
}

export function listSlotPlans(containerId?: string) { return slotPlans.filter(p => !containerId || p.containerId === containerId); }
export function createAppointment(input: Omit<GateAppointment, 'id' | 'status' | 'sealVerified' | 'weightVerified'>) {
  const container = containers.find(item => item.id === input.containerId); if (!container) throw new Error('箱号不存在');
  if (container.customs !== 'released' && input.type === 'pickup') throw new Error('海关未放行，不能预约提箱');
  const item: GateAppointment = { ...input, id: `APT-${Date.now()}`, status: 'booked', sealVerified: false, weightVerified: false }; appointments.unshift(item); container.appointmentId = item.id; return item;
}
export function updateAppointment(id: string, patch: Partial<Pick<GateAppointment, 'status' | 'sealVerified' | 'weightVerified' | 'exception'>>) { const item = appointments.find(a => a.id === id); if (!item) return undefined; Object.assign(item, patch); const container = containers.find(c => c.id === item.containerId); if (item.status === 'checked-in' && container) container.status = 'at-gate'; if (item.status === 'completed' && container) container.status = item.type === 'pickup' ? 'released' : 'in-yard'; auditEvents.unshift({ id: `AUD-${Date.now()}`, actor: '闸口值班员', action: 'GATE_UPDATE', entity: 'appointment', entityId: id, at: new Date().toISOString(), details: JSON.stringify(patch) }); return item; }
export function assignTask(id: string, equipmentId: string) { const task = tasks.find(item => item.id === id); const machine = equipment.find(item => item.id === equipmentId); if (!task || !machine) return undefined; const blockingReasons = [...task.blockingReasons]; if (machine.status === 'maintenance' || machine.status === 'offline') blockingReasons.push(`${machine.name} 当前不可用`); if (task.kind === 'inspect' && machine.kind !== 'reach-stacker') blockingReasons.push('查验作业需要正面吊或专用设备'); task.equipmentId = equipmentId; task.status = blockingReasons.length ? 'blocked' : 'assigned'; task.blockingReasons = blockingReasons; auditEvents.unshift({ id: `AUD-${Date.now()}`, actor: '中控调度员', action: 'ASSIGN_TASK', entity: 'yard-task', entityId: id, at: new Date().toISOString(), details: `${equipmentId} -> ${task.containerId}` }); return task; }
export function containerDetail(id: string) { const container = containers.find(item => item.id === id); if (!container) return undefined; return { container, voyage: voyages.find(v => v.id === container.voyageId), appointment: appointments.find(a => a.id === container.appointmentId), plan: containerPlan(id), slotPlans: listSlotPlans(id), tasks: tasks.filter(t => t.containerId === id) }; }

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
  const fingerprintBefore = planFingerprint(item);
  Object.assign(item, patch, { lastEvent: `台账更新 ${new Date().toLocaleString()}` });
  if (planFingerprint(item) !== fingerprintBefore) invalidateContainerPlans(id, '冷藏/危险品/海关/航次等关键属性变化');
  recordAudit('UPDATE', 'container', id, '更新集装箱台账字段');
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
  invalidateContainerPlans(id, '箱务记录已删除');
  recordAudit('DELETE', 'container', id, `删除箱务记录，并级联清理 ${removedAppointments.length} 条预约、${removedTasks.length} 条未完成任务`);
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
  if (item.status === 'done') settleLockedPlan(item);
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
