import axios from "axios";
import { PRIORITIES } from "../constants.js";

// Department codes and category names MUST match what seed.js inserted.
const RULES = [
  { dept: "MUNICIPAL", category: "Roads and potholes", words: ["pothole", "road", "footpath", "speed breaker", "crater", "tar "] },
  { dept: "MUNICIPAL", category: "Garbage and sanitation", words: ["garbage", "trash", "waste", "dustbin", "sanitation", "stink", "dump"] },
  { dept: "MUNICIPAL", category: "Water supply and sewerage", words: ["water supply", "no water", "sewage", "sewer", "drain", "pipeline", "overflow", "tap"] },
  { dept: "MUNICIPAL", category: "Street lighting", words: ["street light", "streetlight", "lamp post", "dark street"] },
  { dept: "MUNICIPAL", category: "Encroachment", words: ["encroach", "illegal construction", "illegal shop", "footpath blocked"] },

  { dept: "POLICE", category: "Theft and property crime", words: ["theft", "stolen", "robbery", "burglary", "snatch", "thief", "stole"] },
  { dept: "POLICE", category: "Harassment and personal safety", words: ["harass", "stalk", "threat", "eve teasing", "molest", "unsafe", "assault"] },
  { dept: "POLICE", category: "Traffic violation", words: ["traffic", "red light", "wrong side", "parking", "challan", "rash driving"] },
  { dept: "POLICE", category: "Cyber-crime", words: ["cyber", "online fraud", "phishing", "hacked", "scam", "otp fraud", "upi fraud"] },
  { dept: "POLICE", category: "Noise and public nuisance", words: ["noise", "loud music", "loudspeaker", "nuisance", "drunk"] },

  { dept: "ELECTRICITY", category: "Power outage", words: ["power cut", "power outage", "no electricity", "no power", "blackout", "load shedding", "transformer"] },
  { dept: "ELECTRICITY", category: "Billing dispute", words: ["electricity bill", "bill", "overcharged", "wrong bill", "billing"] },
  { dept: "ELECTRICITY", category: "Meter fault", words: ["meter", "reading", "meter fault", "burnt meter"] },
  { dept: "ELECTRICITY", category: "New connection or load-change delay", words: ["new connection", "load change", "load enhancement", "connection pending"] },
  { dept: "ELECTRICITY", category: "Voltage fluctuation", words: ["voltage", "fluctuation", "low voltage", "high voltage", "appliance damaged"] },

  { dept: "HEALTH", category: "Hospital service quality", words: ["hospital", "ward", "treatment", "doctor not", "waiting hours", "dirty ward"] },
  { dept: "HEALTH", category: "Medicine or equipment shortage", words: ["medicine", "shortage", "equipment", "oxygen", "no stock"] },
  { dept: "HEALTH", category: "Staff misconduct", words: ["rude", "misbehav", "bribe", "nurse", "staff behaviour", "misconduct"] },
  { dept: "HEALTH", category: "Ambulance delay", words: ["ambulance", "108", "emergency vehicle"] },
  { dept: "HEALTH", category: "Health scheme or card issue", words: ["ayushman", "health card", "health scheme", "insurance card"] },

  { dept: "REVENUE", category: "Land records and mutation", words: ["land record", "mutation", "khasra", "property record", "jamabandi", "land dispute"] },
  { dept: "REVENUE", category: "Certificate delay", words: ["certificate", "income certificate", "caste certificate", "domicile"] },
  { dept: "REVENUE", category: "Pension or scheme benefit", words: ["pension", "widow", "old age", "scheme benefit", "scholarship"] },
  { dept: "REVENUE", category: "Ration and entitlement", words: ["ration", "ration card", "entitlement", "food grain"] },
];

const CRITICAL_WORDS = ["fire", "accident", "death", "died", "dying", "electrocut", "emergency", "fatal", "blast", "sparking", "unconscious", "life threat", "urgent"];
const HIGH_WORDS = ["injured", "danger", "days", "children", "elderly", "school", "flood", "overflow", "sewage", "blackout", "threat", "harass", "no water", "many people", "whole area"];
const LOW_WORDS = ["certificate", "information", "enquiry", "inquiry", "query", "how to", "status of", "update my"];

// Simple rules, used before the ML model exists and as a testing tool.
// Confidence: 0.8 for one matching word, 0.9 for two or more, 0.2 for none
// (so "something is wrong" lands in the CGC review queue).
const keywordClassify = (text) => {
  const t = ` ${String(text).toLowerCase()} `;

  let best = null;
  let bestHits = 0;
  for (const rule of RULES) {
    const hits = rule.words.filter((w) => t.includes(w)).length;
    if (hits > bestHits) {
      bestHits = hits;
      best = rule;
    }
  }

  let priority = "Medium";
  if (CRITICAL_WORDS.some((w) => t.includes(w))) priority = "Critical";
  else if (HIGH_WORDS.some((w) => t.includes(w))) priority = "High";
  else if (LOW_WORDS.some((w) => t.includes(w))) priority = "Low";

  if (!best) {
    return { department: null, category: null, priority, confidence: 0.2, source: "keyword" };
  }
  return {
    department: best.dept,
    category: best.category,
    priority,
    confidence: bestHits >= 2 ? 0.9 : 0.8,
    source: "keyword",
  };
};

// Main entry. Returns { department(code), category(name), priority, confidence, source }
// Switch to the real ML model by setting USE_ML=true in .env
const classifyGrievance = async (text) => {
  if (process.env.USE_ML !== "true") {
    return keywordClassify(text);
  }
  try {
    const { data } = await axios.post(`${process.env.ML_URL}/classify`, { text }, { timeout: 5000 });
    if (!data?.department || !data?.category) throw new Error("Bad ML response");
    return {
      department: data.department,
      category: data.category,
      priority: PRIORITIES.includes(data.priority) ? data.priority : "Medium",
      confidence: Number(data.confidence) || 0,
      source: "ml",
    };
  } catch (err) {
    // ML service down: confidence 0 sends the grievance to CGC review instead of crashing
    console.error("ML service failed:", err.message);
    return { department: null, category: null, priority: "Medium", confidence: 0, source: "keyword" };
  }
};

export { classifyGrievance, keywordClassify };