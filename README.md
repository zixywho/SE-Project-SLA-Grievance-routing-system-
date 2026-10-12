# ER Diagram -> https://app.eraser.io/workspace/gBDPSXOxe3UKPf4bfdgx?origin=share

# Smart Grievance Redressal System

An intelligent grievance management platform that automatically classifies citizen complaints, routes them to the appropriate department, monitors resolution deadlines, and escalates overdue complaints to higher authorities.

## 1. Problem Statement

Citizens often struggle to identify the correct department for reporting public issues such as damaged roads, sanitation problems, water supply disruptions, and other civic concerns. As a result, complaints may be misrouted, delayed, or left unresolved without proper accountability.

Traditional grievance systems may also lack transparent tracking, deadline enforcement, and a structured escalation mechanism.

## 2. Project Overview

The **Smart Grievance Redressal System** provides a unified platform where citizens can submit complaints in natural language without needing to know which department is responsible.

The system uses machine learning to classify complaints, assigns them to suitable officers, enforces Service Level Agreement (SLA) deadlines, and automatically escalates unresolved complaints.

Citizens can track their complaints using a unique grievance ID, while officers and administrators can monitor progress through role-based dashboards.

## 3. Key Features

- **Role-Based Authentication:** Provides separate access and permissions for citizens, officers, department heads, CGC officers, and administrators.
- **Complaint Submission:** Allows citizens to submit complaints with a title, description, location, and optional supporting evidence.
- **Automatic Complaint Classification:** Predicts the appropriate department, category, and priority using machine learning.
- **Confidence-Based Review:** Routes low-confidence predictions to the Central Grievance Cell (CGC) for manual verification.
- **Intelligent Assignment:** Assigns complaints to the appropriate department and selects the least-loaded eligible officer.
- **Complaint Reassignment:** Allows incorrectly routed complaints to be rejected or reassigned.
- **SLA Monitoring:** Calculates response and resolution deadlines based on complaint priority.
- **Automatic Escalation:** Escalates complaints to higher authorities when predefined SLA thresholds are reached.
- **Complaint Tracking:** Enables citizens to view complaint status and a complete history of actions.
- **Notifications:** Generates in-app notifications for important complaint updates and escalation events.
- **Analytics and Reports:** Tracks complaint volumes, department-wise status, SLA compliance, and average resolution time.

## 4. User Roles

| Role | Responsibilities |
|---|---|
| Citizen | Submit complaints and track their progress |
| Officer | Handle assigned complaints and update their status |
| Department Head | Monitor departmental complaints and receive deadline alerts |
| CGC Officer | Review uncertain classifications and handle escalated complaints |
| Admin | Manage departments, users, roles, and SLA rules |

## 5. Complaint Processing Workflow

1. **Submission:** A citizen submits a complaint in natural language.
2. **Classification:** The ML model predicts the department, category, priority, and confidence score.
3. **Confidence Check:** High-confidence predictions proceed automatically, while uncertain predictions are sent for CGC review.
4. **Assignment:** The complaint is routed to the appropriate department and assigned to an eligible officer based on workload.
5. **SLA Initialization:** Response and resolution deadlines are calculated according to the applicable SLA rules.
6. **Monitoring:** A background job periodically checks complaint deadlines and escalation conditions.
7. **Escalation:** Complaints approaching or exceeding defined thresholds trigger alerts or escalation to higher authorities.
8. **Resolution:** The officer updates the complaint status and records the resolution.
9. **Tracking and Reporting:** The citizen can view status updates, while authorized personnel can monitor performance and SLA compliance.

## 6. Machine Learning and Confidence-Based Routing

The classification component analyzes the complaint text and predicts:

- **Department:** The responsible administrative department.
- **Category:** The specific type of issue.
- **Priority:** The urgency of the complaint.
- **Confidence Score:** A value between 0 and 1 representing the model's confidence in its prediction.

Complaints with confidence scores above a configured threshold can be routed automatically. Complaints below the threshold are sent to the CGC for manual review.

Corrections made by CGC officers can be stored as labelled feedback for future model training and evaluation.

## 7. SLA Management and Escalation

The Service Level Agreement (SLA) defines the expected response and resolution time for complaints based on their priority.

The system maintains separate response and resolution deadlines and monitors them using a background job.

The escalation mechanism includes:

- **Level 1:** The assigned officer handles the complaint.
- **Level 2:** The department head is alerted when a configured escalation threshold is reached.
- **Level 3:** The complaint is escalated to the Central Grievance Cell when the applicable escalation condition is met.

SLA durations and escalation thresholds are configurable. Short deadlines can be used for demonstrations and testing.

## 8. Example Complaint Lifecycle

**Complaint:** "Huge pothole near the market; a bike fell into it."

| Stage | Example Outcome |
|---|---|
| Grievance ID | GRV-0001 |
| Predicted department | Municipal |
| Predicted category | Roads |
| Predicted priority | High |
| Classification confidence | 0.91 (91%) |
| Assignment | Eligible officer with the lowest pending workload |
| SLA | Demo response deadline: 2 minutes; resolution deadline: 6 minutes |
| Escalation | Department head and CGC according to configured thresholds |
| Final outcome | Resolution recorded in complaint history |

If the model's confidence were only 0.40 (40%), the complaint would be sent for CGC review before normal departmental routing.

*The values above are illustrative examples for demonstration, not fixed production SLA policies.*

## 9. Transparency and Analytics

The platform maintains a history of important complaint events, including submission, classification, assignment, status changes, review actions, escalations, and resolution.

Reports can provide insights into:

- Total complaints and their current statuses
- Department-wise complaint distribution
- SLA compliance and overdue complaints
- Average response and resolution times
- Escalation frequency and workload distribution

These insights help administrators identify bottlenecks and improve grievance handling.

## 10. Project Objectives

- Provide citizens with a single point of entry for public grievances.
- Reduce incorrect complaint routing through automated classification.
- Improve accountability through deadline monitoring and escalation.
- Increase transparency through complaint tracking and action history.
- Support data-driven administrative decisions through analytics.
- Use human feedback to improve future classification performance.

## 11. Technology Stack

The technology stack will be documented here as the implementation evolves.

- **Backend:** ..
- **Database:** ..
- **Machine Learning:** ..
- **Frontend:** ..

## 12. Setup and Installation

Setup instructions will be added as the backend, database, machine learning component, and frontend are integrated.

## 13. Future Enhancements

- Improve classification performance using reviewed complaint data.
- Add more advanced dashboards and reporting.
- Extend notification channels where required.
- Improve workload balancing and escalation policies.
- Evaluate the classifier on real-world or representative complaint datasets.