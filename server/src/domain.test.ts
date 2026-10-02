import test from 'node:test'; import assert from 'node:assert/strict'; import { containerPlan, dashboard, gateConflicts, prioritizeTasks } from './domain.js';
test('dashboard aggregates berth, yard, gate and exception signals', () => { const data = dashboard(); assert.equal(data.activeVoyages, 2); assert.ok(data.yardUtilization > 0.7); assert.ok(data.blockedTasks >= 1); });
test('gate conflict engine detects same truck overlap', () => { const conflicts = gateConflicts(); assert.ok(conflicts.some(item => item.appointmentId === 'APT-9001' || item.appointmentId === 'APT-9004')); });
test('yard planner respects reefer and hazmat constraints', () => { const plan = containerPlan('TGHU-9831204'); assert.equal(plan?.recommendedBlock?.hazmatAllowed, true); assert.ok(plan?.reasons.some(reason => reason.includes('危险品'))); });
test('priority queue promotes customs inspection work', () => { const tasks = prioritizeTasks(); assert.equal(tasks[0].containerId, 'TGHU-9831204'); });

test('container create, update and delete form a complete audited CRUD cycle', async () => {
  const { createContainer, updateContainer, deleteContainer, containers } = await import('./domain.js');
  const created = createContainer({ id: 'TEST-CRUD-0001', voyageId: 'VOY-AX7', size: '20', isoType: '22G1', direction: 'import', status: 'in-yard', weightT: 10, reefer: false, customs: 'released', priority: 'normal', yardSlot: 'C03-R11-T1' });
  assert.equal(created.id, 'TEST-CRUD-0001');
  assert.equal(updateContainer(created.id, { weightT: 12 })?.weightT, 12);
  assert.equal(deleteContainer(created.id)?.id, 'TEST-CRUD-0001');
  assert.equal(containers.some(item => item.id === 'TEST-CRUD-0001'), false);
});

test('appointment and task domain operations support create, update and delete', async () => {
  const { createGateAppointment, editGateAppointment, deleteGateAppointment, createYardTask, updateYardTask, deleteYardTask } = await import('./domain.js');
  const appointment = createGateAppointment({ containerId: 'MSCU-4829017', truckNo: 'TEST-CRUD-01', driver: '测试司机', type: 'pickup', windowStart: new Date(Date.now()+3600000).toISOString(), windowEnd: new Date(Date.now()+7200000).toISOString(), lane: 'north' });
  assert.equal(editGateAppointment(appointment.id, { driver: '更新司机' })?.driver, '更新司机');
  assert.equal(deleteGateAppointment(appointment.id)?.id, appointment.id);
  const task = createYardTask({ kind: 'deliver', containerId: 'MSCU-4829017', from: 'A01-R01-T1', to: '南闸口', priority: 40, scheduledAt: new Date().toISOString(), estimatedMinutes: 12 });
  assert.equal(updateYardTask(task.id, { to: '北闸口' })?.to, '北闸口');
  assert.equal(deleteYardTask(task.id)?.id, task.id);
});

test('slot plan workbench generates multiple explainable candidates', async () => {
  const { generateSlotPlan } = await import('./domain.js');
  const session = generateSlotPlan({ containerId: 'MSCU-4829017' });
  assert.ok(session.candidates.length >= 3);
  assert.ok(session.candidates.every(c => c.constraints.length >= 6 && c.cost.breakdown.length >= 2));
  const hazmat = generateSlotPlan({ containerId: 'TGHU-9831204' });
  assert.ok(hazmat.candidates.some(c => !c.feasible && c.constraints.some(item => item.key === 'hazmat' && item.status === 'fail')));
  assert.ok(hazmat.candidates.some(c => c.constraints.some(item => item.key === 'customs' && item.status === 'pass')));
  assert.ok(hazmat.candidates.some(c => c.constraints.some(item => item.key === 'equipment' && item.status === 'fail')));
});

test('locking reserves capacity, rejects double booking and unlock restores it', async () => {
  const { generateSlotPlan, lockSlotPlan, unlockSlotPlan, slotReservations, tasks } = await import('./domain.js');
  const first = generateSlotPlan({ containerId: 'MSCU-4829017' });
  const second = generateSlotPlan({ containerId: 'CMAU-6001722' });
  const firstCandidate = first.candidates.find(c => c.feasible)!;
  const clash = second.candidates.find(c => c.slot === firstCandidate.slot)!;
  const locked = lockSlotPlan(first.id, firstCandidate.id);
  assert.equal(locked?.status, 'locked');
  const createdTaskId = locked!.createdTaskId!;
  assert.ok(slotReservations.some(r => r.slot === firstCandidate.slot));
  assert.ok(tasks.some(t => t.id === createdTaskId && t.to === firstCandidate.slot));
  assert.throws(() => lockSlotPlan(second.id, clash.id), /占用/);
  const reopened = unlockSlotPlan(first.id);
  assert.equal(reopened?.status, 'open');
  assert.equal(slotReservations.some(r => r.slot === firstCandidate.slot), false);
  assert.equal(tasks.find(t => t.id === createdTaskId)?.status, 'blocked');
});

test('reefer or hazmat changes invalidate plans and release reservations', async () => {
  const { createContainer, deleteContainer, generateSlotPlan, lockSlotPlan, updateContainer, listPlanSessions, slotReservations } = await import('./domain.js');
  createContainer({ id: 'TEST-PLAN-0001', voyageId: 'VOY-AX7', size: '40', isoType: '45G1', direction: 'import', status: 'in-yard', weightT: 20, reefer: false, customs: 'released', priority: 'normal', yardSlot: 'C03-R09-T1' });
  const session = generateSlotPlan({ containerId: 'TEST-PLAN-0001' });
  lockSlotPlan(session.id, session.candidates.find(c => c.feasible)!.id);
  updateContainer('TEST-PLAN-0001', { reefer: true, temperature: -18 });
  const invalidated = listPlanSessions().find(item => item.id === session.id);
  assert.equal(invalidated?.status, 'invalidated');
  assert.ok(invalidated?.invalidReason?.includes('冷藏'));
  assert.equal(slotReservations.some(r => r.sessionId === session.id), false);
  deleteContainer('TEST-PLAN-0001');
});
