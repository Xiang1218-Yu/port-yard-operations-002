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

test('slot plan workbench generates multiple explainable candidates with cost and risk', async () => {
  const { generateSlotPlan } = await import('./domain.js');
  const plan = generateSlotPlan({ containerId: 'EISU-1288420', targetVoyageId: 'VOY-AX7', etaPickup: new Date(Date.now() + 5 * 3600000).toISOString() });
  assert.ok(plan.candidates.length >= 2, '高峰时段应返回多个可执行候选方案');
  const candidate = plan.candidates[0];
  assert.ok(candidate.constraintHits.some(hit => hit.key === 'reefer' && hit.passed));
  assert.ok(candidate.constraintHits.every(hit => hit.detail.length > 0), '每条约束命中都要可解释');
  assert.ok(candidate.cost.total > 0 && candidate.slot.startsWith(candidate.blockId));
  for (const c of plan.candidates) assert.ok(c.constraintHits.filter(h => h.hard).every(h => h.passed), '候选必须满足全部硬约束');
});

test('locking reserves capacity so the same slot capacity cannot be double-booked, cancel restores it', async () => {
  const { createContainer, generateSlotPlan, lockSlotPlan, cancelSlotPlan, slotReservations, deleteContainer } = await import('./domain.js');
  createContainer({ id: 'TEST-PLAN-0001', voyageId: 'VOY-AX7', size: '40', isoType: '45R1', direction: 'import', status: 'in-yard', weightT: 20, reefer: true, temperature: -18, customs: 'released', priority: 'reefer', yardSlot: 'B07-R11-T1' });
  const plan = generateSlotPlan({ containerId: 'TEST-PLAN-0001' });
  const reeferCandidate = plan.candidates.find(c => c.constraintHits.some(h => h.key === 'reefer' && h.hard && h.passed))!;
  const locked = lockSlotPlan(plan.id, reeferCandidate.id)!;
  assert.equal(locked.status, 'locked');
  assert.ok(locked.taskId, '锁定后应创建场内任务');
  assert.equal(slotReservations.filter(r => r.blockId === reeferCandidate.blockId).length, 1);
  const followUp = generateSlotPlan({ containerId: 'EISU-1288420' });
  const sameBlock = followUp.candidates.find(c => c.blockId === reeferCandidate.blockId);
  if (sameBlock) assert.ok(sameBlock.constraintHits.find(h => h.key === 'reefer')!.detail.includes('预留'), '后续方案必须看到已锁定预留');
  assert.throws(() => lockSlotPlan(plan.id, reeferCandidate.id), /不能锁定/, '重复锁定同一方案应被拒绝');
  const cancelled = cancelSlotPlan(plan.id)!;
  assert.equal(cancelled.status, 'cancelled');
  assert.equal(slotReservations.filter(r => r.planId === plan.id).length, 0, '取消后预留必须恢复');
  deleteContainer('TEST-PLAN-0001');
});

test('reefer or hazmat attribute changes invalidate old plans and release reservations', async () => {
  const { createContainer, generateSlotPlan, lockSlotPlan, updateContainer, slotPlans, slotReservations, tasks, deleteContainer } = await import('./domain.js');
  createContainer({ id: 'TEST-PLAN-0002', voyageId: 'VOY-AX7', size: '40', isoType: '45G1', direction: 'import', status: 'in-yard', weightT: 18, reefer: false, customs: 'released', priority: 'normal', yardSlot: 'C03-R08-T1' });
  const plan = generateSlotPlan({ containerId: 'TEST-PLAN-0002' });
  lockSlotPlan(plan.id, plan.candidates[0].id);
  assert.equal(slotReservations.filter(r => r.planId === plan.id).length, 1);
  updateContainer('TEST-PLAN-0002', { reefer: true, temperature: -18 });
  const invalidated = slotPlans.find(p => p.id === plan.id)!;
  assert.equal(invalidated.status, 'invalidated', '冷藏条件变化后旧方案必须失效');
  assert.ok(invalidated.note?.includes('重新规划'));
  assert.equal(slotReservations.filter(r => r.planId === plan.id).length, 0, '失效后预留必须释放');
  assert.ok(!tasks.some(t => t.id === invalidated.taskId), '失效方案的未执行任务应被回收');
  assert.throws(() => lockSlotPlan(plan.id, plan.candidates[0].id), /不能锁定/);
  deleteContainer('TEST-PLAN-0002');
});

test('completing a locked plan task settles the reservation into real occupancy', async () => {
  const { createContainer, generateSlotPlan, lockSlotPlan, updateYardTask, blocks, slotReservations, containers, deleteContainer } = await import('./domain.js');
  createContainer({ id: 'TEST-PLAN-0003', voyageId: 'VOY-AX7', size: '20', isoType: '22G1', direction: 'export', status: 'at-gate', weightT: 14, reefer: false, customs: 'released', priority: 'normal', yardSlot: '闸口' });
  const plan = generateSlotPlan({ containerId: 'TEST-PLAN-0003' });
  const locked = lockSlotPlan(plan.id, plan.candidates[0].id)!;
  const block = blocks.find(b => b.id === plan.candidates[0].blockId)!;
  const occupiedBefore = block.occupied;
  updateYardTask(locked.taskId!, { status: 'done' });
  assert.equal(slotReservations.filter(r => r.planId === plan.id).length, 0);
  assert.equal(block.occupied, occupiedBefore + 1, '任务完成后预留转为实际占用');
  assert.equal(containers.find(c => c.id === 'TEST-PLAN-0003')?.yardSlot, plan.candidates[0].slot);
  deleteContainer('TEST-PLAN-0003');
});
