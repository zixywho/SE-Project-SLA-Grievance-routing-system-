import cron from "node-cron";
import { Grievance } from "../models/grievance.model.js";
import { notify, notifyRole } from "../services/notification.service.js";
import { ESCALATE_L2_AT } from "../constants.js";

// Runs every minute. Import this file once in src/index.js:  import "./jobs/slaChecker.js";
cron.schedule("* * * * *", async () => {
  try {
    // TODO 1: open = Grievance.find({ status: { $in: ["Assigned", "In Progress"] }, "sla.resolutionDue": { $exists: true } })
    // TODO 2: for each grievance g:
    //     total   = g.sla.resolutionDue - g.sla.startedAt
    //     elapsed = Date.now() - g.sla.startedAt
    //
    //   A) FIRST RESPONSE MISSED
    //      if !g.sla.firstResponseAt && !g.sla.reminderSent && now > g.sla.firstResponseDue:
    //         reminderSent = true; history "REMINDER_SENT"; notify g.assignedOfficer (type "REMINDER")
    //
    //   B) L3: elapsed >= total && g.escalationLevel < 3
    //         escalationLevel = 3; slaBreached = true; history "ESCALATED_L3"
    //         notifyRole("cgc", g, "... breached SLA", "ESCALATION")
    //
    //   C) L2 (use else-if after B): elapsed >= total * ESCALATE_L2_AT && g.escalationLevel < 2
    //         escalationLevel = 2; history "ESCALATED_L2"
    //         notifyRole("head", g, "... nearing SLA", "ESCALATION", g.classification.department)
    //
    //   await g.save()
    //
    // TODO 3: the "escalationLevel < N" checks stop the same escalation firing every minute. Keep them.
    // TODO 4: console.log how many grievances were checked (useful while demoing)
  } catch (err) {
    console.error("SLA checker failed:", err.message);
  }
});
