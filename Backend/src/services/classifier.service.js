import axios from "axios";

// Returns: { department: "MUNICIPAL", category: "Roads and potholes",
//            priority: "High", confidence: 0.91, source: "ml" | "keyword" }
const classifyGrievance = async (text) => {
  // TODO 1 (do first): keywordClassify(text) so you can build the whole flow without ML
  // TODO 2 (later): POST `${process.env.ML_URL}/classify` with { text } using axios, timeout 5000
  //         return { ...data, source: "ml" }
  // TODO 3: if the ML service is down or errors: return
  //         { department: null, category: null, priority: "Medium", confidence: 0, source: "keyword" }
  //         so the grievance goes to CGC review instead of crashing
  throw new Error("classifyGrievance not implemented yet");
};

// Simple rules for the early phase
const keywordClassify = (text) => {
  // TODO: lowercase the text and check keywords, e.g.
  //   "pothole" | "road"      -> MUNICIPAL / Roads and potholes
  //   "garbage" | "sewage"    -> MUNICIPAL / Garbage and sanitation
  //   "theft" | "stolen"      -> POLICE / Theft and property crime
  //   "bill" | "meter"        -> ELECTRICITY / Billing dispute
  //   "power cut" | "outage"  -> ELECTRICITY / Power outage
  //   "hospital" | "ambulance"-> HEALTH / ...
  //   "pension" | "certificate"-> REVENUE / ...
  // priority rules: "fire", "accident", "death", "urgent" -> Critical; else Medium
  // confidence: 0.9 on a keyword match, 0.2 if nothing matched
  throw new Error("keywordClassify not implemented yet");
};

export { classifyGrievance, keywordClassify };
