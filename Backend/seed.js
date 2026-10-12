import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]); // same DNS fix as index.js
import mongoose from "mongoose";
import { Department } from "./src/models/department.model.js";
import { Category } from "./src/models/category.model.js";
import { SlaRule } from "./src/models/slaRule.model.js";
import { User } from "./src/models/user.model.js";
import { Counter } from "./src/models/counter.model.js";

const DATA = [
  { name: "Municipal Corporation", code: "MUNICIPAL", categories: [
    "Roads and potholes", "Garbage and sanitation", "Water supply and sewerage",
    "Street lighting", "Encroachment"] },
  { name: "Police", code: "POLICE", categories: [
    "Theft and property crime", "Harassment and personal safety", "Traffic violation",
    "Cyber-crime", "Noise and public nuisance"] },
  { name: "Electricity", code: "ELECTRICITY", categories: [
    "Power outage", "Billing dispute", "Meter fault",
    "New connection or load-change delay", "Voltage fluctuation"] },
  { name: "Health and Family Welfare", code: "HEALTH", categories: [
    "Hospital service quality", "Medicine or equipment shortage", "Staff misconduct",
    "Ambulance delay", "Health scheme or card issue"] },
  { name: "Revenue and Social Welfare", code: "REVENUE", categories: [
    "Land records and mutation", "Certificate delay", "Pension or scheme benefit",
    "Ration and entitlement"] },
];

// DEMO values in minutes so escalation is visible live.
// For production use e.g. Critical 240 / 1440.
const SLA = [
  { priority: "Critical", firstResponseMinutes: 1, resolutionMinutes: 4 },
  { priority: "High", firstResponseMinutes: 2, resolutionMinutes: 6 },
  { priority: "Medium", firstResponseMinutes: 3, resolutionMinutes: 10 },
  { priority: "Low", firstResponseMinutes: 4, resolutionMinutes: 15 },
];

const PASSWORD = "Password@123";

const run = async () => {
  await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
  console.log("Connected, seeding...");

  await Promise.all([
    Department.deleteMany({}), Category.deleteMany({}), SlaRule.deleteMany({}),
    User.deleteMany({}), Counter.deleteMany({}),
  ]);

  await SlaRule.insertMany(SLA);

  const users = [
    { name: "Admin", email: "admin@gov.test", role: "admin" },
    { name: "CGC Officer", email: "cgc@gov.test", role: "cgc" },
    { name: "Test Citizen 1", email: "citizen1@test.com", mobile: "9000000001", role: "citizen" },
    { name: "Test Citizen 2", email: "citizen2@test.com", mobile: "9000000002", role: "citizen" },
  ];

  for (const d of DATA) {
    const dept = await Department.create({ name: d.name, code: d.code });
    await Category.insertMany(
      d.categories.map((name) => ({ name, department: dept._id }))
    );
    const c = d.code.toLowerCase();
    users.push(
      { name: `${d.name} Head`, email: `head.${c}@gov.test`, role: "head", department: dept._id },
      { name: `${d.name} Officer 1`, email: `officer1.${c}@gov.test`, role: "officer", department: dept._id, jurisdiction: "Central" },
      { name: `${d.name} Officer 2`, email: `officer2.${c}@gov.test`, role: "officer", department: dept._id, jurisdiction: "Central" }
    );
  }

  for (const u of users) await User.create({ ...u, password: PASSWORD }); // create() runs the bcrypt hook

  console.log(`Done: ${DATA.length} departments, ${users.length} users, ${SLA.length} SLA rules.`);
  console.log(`All seeded users have password: ${PASSWORD}`);
  await mongoose.connection.close();
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});