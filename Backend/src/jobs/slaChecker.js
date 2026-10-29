import cron from "node-cron";
import { Grievance } from "../models/grievance.model.js";
import { notify, notifyRole } from "../services/notification.service.js";
import { addHistory, OPEN_WORK_STATUSES } from "../utils/grievanceHelpers.js";
import { ESCALATE_L2_AT } from "../constants.js";

let running = false; // prevents two runs overlapping if one is slow

export const runSlaCheck = async () => {
  if (running) return;
  running = true;
  try {
    const now = Date.now();
    const open = await Grievance.find({
      status: { $in: OPEN_WORK_STATUSES },
      "sla.resolutionDue": { $exists: true },
    });

    let reminders = 0;
    let escalations = 0;

    for (const g of open) {
      try {
        const start = new Date(g.sla.startedAt).getTime();
        const total = new Date(g.sla.resolutionDue).getTime() - start;
        const elapsed = now - start;
        let changed = false;

        // A) First response missed -> one reminder to the officer
        if (
          !g.sla.firstResponseAt &&
          !g.sla.reminderSent &&
          g.sla.firstResponseDue &&
          now > new Date(g.sla.firstResponseDue).getTime()
        ) {
          g.sla.reminderSent = true;
          addHistory(g, "REMINDER_SENT", null, "First response deadline missed");
          await notify(g.assignedOfficer, g, `Reminder: first response overdue for ${g.grievanceId}`, "REMINDER");
          reminders++;
          changed = true;
        }

        // B) L2: 75% of resolution time elapsed -> Department Head (+ warn the officer)
        if (total > 0 && elapsed >= total * ESCALATE_L2_AT && g.escalationLevel < 2) {
          g.escalationLevel = 2;
          addHistory(g, "ESCALATED_L2", null, `${Math.round(ESCALATE_L2_AT * 100)}% of resolution time elapsed`);
          await notifyRole("head", g, `${g.grievanceId} is nearing its SLA deadline (L2)`, "ESCALATION", g.classification.department);
          await notify(g.assignedOfficer, g, `Warning: ${g.grievanceId} is close to its SLA deadline`, "ESCALATION");
          escalations++;
          changed = true;
        }

        // C) L3: SLA breached -> Central Grievance Cell
        if (total > 0 && elapsed >= total && g.escalationLevel < 3) {
          g.escalationLevel = 3;
          g.slaBreached = true;
          addHistory(g, "ESCALATED_L3", null, "Resolution SLA breached");
          await notifyRole("cgc", g, `${g.grievanceId} has breached its SLA (L3), intervention needed`, "ESCALATION");
          escalations++;
          changed = true;
        }

        if (changed) await g.save();
      } catch (err) {
        console.error(`[SLA] failed for ${g.grievanceId}:`, err.message);
      }
    }

    if (reminders || escalations) {
      console.log(`[SLA] checked ${open.length} open | reminders: ${reminders} | escalations: ${escalations}`);
    }
  } catch (err) {
    console.error("[SLA] checker failed:", err.message);
  } finally {
    running = false;
  }
};

// every minute
cron.schedule("* * * * *", runSlaCheck);
console.log("[SLA] checker scheduled (every minute)");