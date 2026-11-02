# Devpost Submission Package: PayAgent AI

> Use this document to copy and paste directly into the Devpost submission form for the **PayPal AI Hackathon**.

---

### 1. Basic Information
* **Project Name:** PayAgent AI
* **Tagline / Elevator Pitch:** Autonomous Agentic Commerce & Smart Escrow Protocol powered by PayPal Orders v2 and AG Grid Telemetry.
* **Track / Prize Categories Targeted:**
  * ⋆ 1st / 2nd / 3rd Place Overall
  * ⋆ Best Use of Agentic Commerce ($5,000)
  * ⋆ Best Use of PayPal + AI ($5,000)
  * ⋆ Best Use of AG Grid - 1st Place ($5,000)
  * ⋆ Best Use of Render ($1,000 credits)
  * ⋆ Most Impactful / Most Creative ($5,000)

---

### 2. Form Field Answers

#### Inspiration
The explosion of LLM agents (from coding assistants to automated procurement bots) has created a major unsolved financial paradox: **How can autonomous agents purchase tools, compute, and services without human operators handing them unrestricted credit card access?** 

Giving an autonomous agent a raw corporate credit card risks hallucinated overspends, adversarial prompt injection, and catastrophic financial leaks. We built **PayAgent AI** to give AI agents a compliant, safe, and verifiable payment rail using PayPal's trusted developer ecosystem and AG Grid's enterprise monitoring.

#### What it does
**PayAgent AI** is an intelligent agentic commerce gateway and command center:
1. **Natural Language Procurement:** Users or parent orchestrators instruct the agent in plain language (e.g. *"Procure 2 dedicated GPU instances for model training and register an AI domain under $150"*).
2. **Intent & Vendor Decomposition:** The agent evaluates multi-vendor pricing, selects optimal options, and generates structured purchase items.
3. **AI Anomaly Guard:** An adversarial protection model evaluates the request against budget caps, vendor legitimacy, and prompt injection patterns. If anomalous or high-risk, it locks the order for human compliance review.
4. **Programmatic PayPal Orders v2 Settlement:** When verified, it constructs and triggers PayPal Orders v2 (`/v2/checkout/orders`), enabling programmatic capture and settlement through PayPal's sandbox infrastructure.
5. **AG Grid Command Center:** Every agent action, transaction volume, anomaly score, and settlement status is visualized in a high-performance AG Grid table with custom status renderers, instant search, dynamic filter chips, and CSV compliance export.

#### How we built it
* **Backend:** Node.js, Express, and REST integrations with PayPal Developer Platform (OAuth 2.0 Client Credentials & Orders v2 API).
* **Frontend:** Responsive, dark-mode fintech interface built with Tailwind CSS, FontAwesome icons, and the official PayPal JS SDK.
* **Data Grid & Telemetry:** AG Grid Community v32 featuring custom column renderers (status badges, risk scores, formatted currencies), quick filtering, and CSV export.
* **Security Layer:** AI Anomaly Guard with heuristics for budget ceiling enforcement and adversarial prompt injection filtering.
* **Deployment:** Pre-configured `render.yaml` for instant zero-dependency deployment on Render.

#### Challenges we ran into
Handling the transition between non-deterministic AI decisions and deterministic financial APIs was our biggest technical challenge. We solved this by designing a strict two-phase commit protocol: AI reasoning generates a candidate plan schema, which is cryptographically validated and risk-scored before any PayPal Order payload is dispatched.

#### Accomplishments that we're proud of
* Complete end-to-end autonomous flow: From raw natural language prompt to a settled PayPal transaction reflected live in an AG Grid data grid in under 3 seconds.
* Clean, production-grade codebase with zero heavy frameworks, zero fragile dependencies, and an instant 10-second setup.
* Robust defense mechanisms that catch adversarial attempts to override spending caps or siphon funds.

#### What we learned
Building with PayPal's Orders v2 API highlighted the power of modern payment intent architecture for autonomous systems. Combining this with AG Grid's reactivity proved that complex agentic financial workflows can be made intuitive, auditable, and transparent for enterprise compliance teams.

#### What's next for PayAgent AI
* Support for recurring subscription negotiation and automated renewal management.
* Cryptographic multi-party computation (MPC) for team-based agent authorization.
* Deeper integration with PayPal Vault and Webhook event listeners for decentralized multi-agent swarms.

---

### 3. Demo Video Script (Under 3 Minutes)

* **[0:00 - 0:30] The Hook & Problem**
  > *"Meet PayAgent AI. As autonomous AI agents take over software engineering and operations, they need to buy things: cloud compute, domain names, API quotas. But you can't just give an LLM your credit card. That's where PayAgent AI comes in."*
* **[0:30 - 1:15] The Core Agentic Workflow**
  > *(Show screen)* *"Watch this: I type a simple goal — 'Procure 1 dedicated GPU A100 instance for model fine-tuning under budget $150'. PayAgent analyzes the goal, finds the verified vendor, and inspects the transaction with our AI Anomaly Guard. The risk score is 0.08, well below our threshold. The agent automatically prepares the PayPal Orders v2 payload."*
* **[1:15 - 1:55] PayPal Settlement**
  > *(Click Instant Autonomous Settle or PayPal button)* *"With one click, PayAgent calls PayPal's v2 checkout API, captures the funds via PayPal Sandbox, and immediately confirms settlement. Notice how our live metrics update instantly: volume, successful transactions, and risk index."*
* **[1:55 - 2:30] AG Grid Telemetry & Anomaly Guard**
  > *"Look at our AG Grid Command Center. Every transaction is tracked in real-time. We can filter by status, search by vendor, or inspect high-risk transactions. If a malicious prompt tries to override budget limits — like this 'Trigger Anomaly Guard' preset — the system immediately flags the high anomaly score and blocks payment rails until human review."*
* **[2:30 - 3:00] Conclusion & Why It Wins**
  > *"PayAgent AI combines the trust and security of the PayPal Developer Platform with the power of modern AI and AG Grid. Autonomous commerce is here, and it's safe. Thank you!"*
