export const ADMIN_USER = {
  name: "Admin",
  email: "admin@n8n-course.com",
  password: "admin123",
  role: "admin" as const,
};

export const COURSE_DATA = {
  title: "Mastering n8n Automation",
  description:
    "A comprehensive course on building powerful workflow automations with n8n. Learn from basics to advanced integrations, and get certified.",
  thumbnail: "",
};

export const SECTIONS_DATA = [
  {
    title: "Getting Started with n8n",
    order: 1,
    lessons: [
      { title: "What is n8n?", videoUrl: "https://www.youtube.com/watch?v=_Wf0NikMyAA", description: "Introduction to n8n workflow automation platform and its key features.", explanation: "What is n8n?: n8n (pronounced 'en-eight-en') is a workflow automation tool that connects different applications and services to automate repetitive tasks.\nNode-based: Build automations by connecting nodes on a visual canvas. Each node represents a step (trigger or action).\nEvent-driven: Workflows can be triggered by webhooks, schedules, or manually.\nSelf-hostable: Run n8n on your own servers for complete data control.\nDeveloper-friendly: Built on Node.js, with support for custom JavaScript code.\nZapier: Best for non-technical users, simple automations, highest number of integrations\nMake: Middle ground - more visual canvas than Zapier, good for complex logic\nn8n: Best for developers and technical teams - maximum control and flexibility\nZapier/Make Pricing: Charge per task/operation\nn8n Cloud Pricing: Charge per workflow execution\nn8n Self-hosted: Free (fair-code license)\nChoose n8n for: Control, power, and customization\nIdeal for: Developers and technical teams\nCost-effective for: Complex, high-volume workflows", resources: [{ name: "WorkOS: n8n Guide", url: "https://workos.com/blog/n8n" }, { name: "Parseur: Zapier vs Make vs n8n", url: "https://parseur.com/blog/zapier-vs-make-vs-n8n" }], links: [{ name: "n8n Official Website", url: "https://n8n.io" }, { name: "n8n Documentation", url: "https://docs.n8n.io" }], duration: "18:00", order: 1 },
      { title: "Installing n8n", videoUrl: "https://www.youtube.com/watch?v=R_Q7P_Dq4yY", description: "Step-by-step guide to installing n8n on your local machine.", explanation: "Docker Installation: Install Docker Desktop on your computer. Open terminal and run: docker run -it --rm -p 5678:5678 n8nio/n8n. Access n8n at http://localhost:5678\nnpm Installation: Install Node.js first. Run: npm install n8n -g. Start with: n8n. Access at http://localhost:5678\nCloud Version: Visit n8n.io and sign up. Free tier available with limited features.\nInitial Setup: Create your first user account. Set up credentials for services you'll use. Explore the node library. Create your first workflow.\nConfiguration: Set environment variables for custom settings. Configure database for self-hosted. Enable HTTPS for production. Set up webhook URLs.", resources: [{ name: "Docker Desktop", url: "https://www.docker.com/products/docker-desktop" }, { name: "n8n Docker Hub", url: "https://hub.docker.com/r/n8nio/n8n" }], links: [{ name: "Installation Guide", url: "https://docs.n8n.io/hosting/installation/docker/" }], duration: "8:45", order: 2 },
      { title: "Your First Workflow", videoUrl: "https://www.youtube.com/watch?v=9L-5o0G-e-I", description: "Create your first automation workflow in n8n.", explanation: "Creating Workflow: Click New Workflow button. Name your workflow. Add first node (trigger). Connect action nodes. Test your workflow.\nNodes: Each node performs a specific action. Connect nodes to create flow. Nodes can transform data. Use expressions for dynamic values.\nTriggers: Manual Trigger - start manually. Schedule Trigger - run at specific times. Webhook Trigger - respond to HTTP requests.\nActions: Send Email, Create Spreadsheet Row, HTTP Request, Slack Message. Chain actions to build complex automations.\nTesting: Use Execute Once button. Check input/output of each node. Debug with console.log in Function nodes. Fix errors and retry.", resources: [{ name: "n8n Workflows", url: "https://docs.n8n.io/workflows/" }], links: [{ name: "Your First Workflow Tutorial", url: "https://docs.n8n.io/quickstart/your-first-workflow/" }], duration: "15:20", order: 3 },
    ],
  },
  {
    title: "Core Nodes & Operations",
    order: 2,
    lessons: [
      { title: "HTTP Request Node", videoUrl: "https://www.youtube.com/watch?v=kY67Z3wD8n0", description: "Learn to use the HTTP Request node to interact with APIs.", explanation: "HTTP Request: The HTTP Request node makes calls to any API endpoint. Supports GET, POST, PUT, DELETE methods.\nConfiguration: Enter the URL endpoint. Select HTTP method. Add headers for authentication. Add body for POST/PUT requests. Parse JSON response.\nAuthentication: Basic Auth - username and password. Bearer Token - for OAuth tokens. API Key - in header or query string. Custom headers for special auth.\nQuery Parameters: Add ?param=value to URL. Use expressions to dynamic values. Chain multiple parameters.\nError Handling: Continue on Fail option. Set timeout. Handle rate limits. Parse error responses.", resources: [{ name: "HTTP Request Node Docs", url: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n.nodes.httpRequest/" }], links: [{ name: "API Integration Guide", url: "https://docs.n8n.io/integrations/builtin/core-nodes/http-request/" }], duration: "12:00", order: 1 },
      { title: "Function & Code Nodes", videoUrl: "https://www.youtube.com/watch?v=x7A0sJk43C0", description: "Writing custom JavaScript in n8n workflows.", explanation: "Function Node: Write JavaScript to transform data. Access input items with items. Return modified items. Use all Node.js built-ins.\nCode Node: New improved version. Write modern JavaScript. Access console for debugging. Import external libraries. Better error handling.\nData Access: items[0].json - access JSON data. $json - shorthand. items[0].binary - access files. Navigate nested objects with dot notation.\nTransformation: Map arrays. Filter data. Merge objects. Add calculated fields. Format dates and numbers.\nBest Practices: Keep functions simple. Use comments. Test with small data. Handle errors gracefully. Return clean data.", resources: [{ name: "Code Node Guide", url: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n.nodes.code/" }], links: [{ name: "JavaScript Examples", url: "https://docs.n8n.io/code-examples/" }], duration: "14:30", order: 2 },
      { title: "IF & Switch Nodes", videoUrl: "https://www.youtube.com/watch?v=KshZ_c2_xO0", description: "Conditional logic and branching in workflows.", explanation: "IF Node: Splits workflow into two branches based on a condition. True output - condition met. False output - condition not met.\nConditions: String - contains, equals, starts with, ends with. Number - equals, greater than, less than, between. Boolean - is true, is false. Date - before, after, between.\nSwitch Node: Multi-branch logic. Add multiple conditions. Each condition goes to different output. Add default fallback output.\nNested Logic: Chain multiple IF nodes for complex conditions. Use AND/OR logic. Combine multiple conditions. Test each branch.\nUse Cases: Route data to different systems. Filter unwanted data. Create conditional notifications. Branch based on user input.", resources: [{ name: "IF Node Docs", url: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n.nodes.if/" }], links: [{ name: "Switch Node Docs", url: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n.nodes.switch/" }], duration: "11:15", order: 3 },
    ],
  },
  {
    title: "Working with Data",
    order: 3,
    lessons: [
      { title: "Data Transformation", videoUrl: "https://www.youtube.com/watch?v=XWkG85q0H0c", description: "Transform and manipulate data between nodes.", explanation: "Set Node: Add new properties to items. Rename existing keys. Remove unnecessary fields. Calculate values using expressions.\nMove to Node: Restructure JSON data. Flatten nested objects. Group by specific field. Convert array to object.\nTransformations: Split string to array. Join array to string. Format dates. Parse numbers. Handle null values.\nSpreadsheet Nodes: Read/Write CSV files. Read/Write Google Sheets. Convert between formats. Filter rows and columns.\nData Mapping: Match fields between systems. Rename for target system. Transform data types. Handle missing values.", resources: [{ name: "Set Node", url: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n.nodes.set/" }], links: [{ name: "Data Transformation Guide", url: "https://docs.n8n.io/data-transformation/" }], duration: "13:45", order: 1 },
      { title: "Working with JSON", videoUrl: "https://www.youtube.com/watch?v=1MwSoB0gnM4", description: "Parse, create, and manipulate JSON data in workflows.", explanation: "JSON Basics: All n8n data is JSON. Objects use {}. Arrays use []. Access with dot notation. Use expressions to navigate.\nParse JSON: Use Function node to parse. JSON.parse() converts string to object. Validate before parsing. Handle parse errors.\nCreate JSON: Build objects in Function node. Add properties dynamically. Use spread operator. Create nested structures.\nTransformations: Map array to new format. Filter JSON array. Merge multiple JSON objects. Extract specific values.\nCommon Patterns: Extract from API response. Transform for webhook output. Create payload for another API. Handle JSON from files.", resources: [{ name: "JSON Guide", url: "https://www.w3schools.com/js/js_json_intro.asp" }], links: [{ name: "n8n JSON Examples", url: "https://docs.n8n.io/data-transformation/" }], duration: "10:20", order: 2 },
      { title: "Error Handling", videoUrl: "https://www.youtube.com/watch?v=R_Q7P_Dq4yY", description: "Implement robust error handling in your automations.", explanation: "Error Workflows: Create dedicated error handling workflow. Trigger on workflow failure. Receive error details. Send notifications. Take corrective action.\nContinue on Fail: Use to skip failed items. Continue processing remaining items. Check which items failed. Log failures for review.\nRetry Logic: Set retry count (max 10). Configure interval between retries. Use exponential backoff. Handle transient errors.\nError Handling: Always validate input data. Check required fields exist. Use type checking. Set reasonable timeouts.\nMonitoring: Set up error alerts. Monitor workflow executions. Review error logs. Fix recurring issues.", resources: [{ name: "Error Handling Docs", url: "https://docs.n8n.io/error-handling/" }], links: [{ name: "Error Workflows", url: "https://docs.n8n.io/error-handling/error-workflows/" }], duration: "9:30", order: 3 },
    ],
  },
  {
    title: "Integrations",
    order: 4,
    lessons: [
      { title: "Google Sheets Integration", videoUrl: "https://www.youtube.com/watch?v=9L-5o0G-e-I", description: "Connect n8n with Google Sheets for data management.", explanation: "Authentication: Create Google Cloud project. Enable Google Sheets API. Create OAuth credentials. Add to n8n credentials.\nOperations: Read data from sheets. Append new rows. Update existing cells. Create new spreadsheets. Delete rows.\nSpreadsheet Structure: Sheet ID from URL. Use A1 notation for ranges. Handle multiple sheets. Work with headers.\nUse Cases: Track leads and customers. Collect form submissions. Create data backups. Generate reports.\nAutomation: Trigger on new form submission. Schedule periodic sync. Send email with sheet data. Create calendar events.", resources: [{ name: "Google Sheets API", url: "https://developers.google.com/sheets/api" }], links: [{ name: "n8n Google Sheets Node", url: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n.nodes.google.sheets/" }], duration: "16:00", order: 1 },
      { title: "Slack & Discord Bots", videoUrl: "https://www.youtube.com/watch?v=kY67Z3wD8n0", description: "Build chat bots and notifications with messaging platforms.", explanation: "Slack: Create Slack app in dev portal. Add bot token to n8n. Scopes for needed permissions. Post to channels or users.\nDiscord: Create Discord server. Make webhook URL. Configure embed messages. Send to channel on events.\nNotifications: Alert on form submission. Notify on new customer. Send daily reports. Error alerts to admin.\nInteractive: Use Slack buttons for actions. Handle interactive messages. Create conversation flows. Build approval workflows.\nBot Commands: Listen for /commands. Parse arguments. Return formatted response. Trigger workflows.", resources: [{ name: "Slack API", url: "https://api.slack.com/" }], links: [{ name: "n8n Slack Node", url: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n.nodes.slack/" }], duration: "14:00", order: 2 },
      { title: "Database Connections", videoUrl: "https://www.youtube.com/watch?v=x7A0sJk43C0", description: "Connect to MySQL, PostgreSQL, and MongoDB from n8n.", explanation: "MySQL/PostgreSQL: Install database. Get connection details. Create credentials in n8n. Use specific credentials node.\nMongoDB: Install MongoDB or use Atlas. Get connection string. Configure authentication. Select database.\nOperations: Select - query data. Insert - add new records. Update - modify existing. Delete - remove records.\nQuery Builder: Use visual query builder. Write raw SQL. Use parameters to prevent injection. Handle results.\nBest Practices: Use connection pooling. Close connections properly. Handle large datasets. Back up before major changes.", resources: [{ name: "MySQL Node", url: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n.nodes.mysql/" }], links: [{ name: "MongoDB Node", url: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n.nodes.mongodb/" }], duration: "12:45", order: 3 },
    ],
  },
  {
    title: "Advanced Techniques",
    order: 5,
    lessons: [
      { title: "Webhooks & Triggers", videoUrl: "https://www.youtube.com/watch?v=XWkG85q0H0c", description: "Set up webhooks and event-driven workflows.", explanation: "Webhook Triggers: Receive data from external apps. HTTP POST/GET support. Return custom response. Test with curl or Postman.\nTypes of Triggers: Webhook - external HTTP calls. Schedule - cron based. Manual - on demand. Event-based - file, email.\nWebhook Security: Add authentication header. Validate API key. Rate limiting. Use HMAC for verification.\nUse Cases: Receive form submissions. Payment notifications. External system triggers. Build REST API.\nProduction: Set production/test modes. Monitor webhook calls. Handle timeouts. Log all requests.", resources: [{ name: "Webhook Docs", url: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n.nodes.webhook/" }], links: [{ name: "Webhook Testing", url: "https://docs.n8n.io/quickstart/webhooks/" }], duration: "15:00", order: 1 },
      { title: "Sub-workflows", videoUrl: "https://www.youtube.com/watch?v=1MwSoB0gnM4", description: "Organize complex automations using sub-workflows.", explanation: "Why Sub-workflows: Reuse common logic. Break large workflows. Easier maintenance. Share between projects.\nExecute Workflow Node: Call another workflow. Pass input data. Receive output. Handle errors.\nSave as Template: Save reusable workflows. Import as template. Update in one place. Changes apply everywhere.\nBest Practices: Clear input/output documentation. Consistent naming. Error handling in subs. Version control.\nUse Cases: Common validation logic. Data transformation functions. Email sending templates. Error handling routines.", resources: [{ name: "Reusing Workflows", url: "https://docs.n8n.io/workflows/#reusing-workflows" }], links: [{ name: "Sub-workflows Guide", url: "https://docs.n8n.io/workflows/sub-workflows/" }], duration: "13:20", order: 2 },
      { title: "Scheduling & Cron", videoUrl: "https://www.youtube.com/watch?v=R_Q7P_Dq4yY", description: "Schedule recurring workflows with cron expressions.", explanation: "Schedule Trigger: Use cron expressions. Define specific times. Set intervals. Handle timezones.\nCron Format: Minute (0-59). Hour (0-23). Day of Month (1-31). Month (1-12). Day of Week (0-6).\nCommon Examples: Every hour: 0 * * *. Daily midnight: 0 0 * * *. Weekly Monday: 0 0 * * 1. Every 15 min: */15 * * * *.\nTime Zones: Configure in node settings. Default is UTC. Set your timezone. Consider daylight saving.\nUse Cases: Daily data sync. Weekly reports. Monthly billing. Hourly health checks.", resources: [{ name: "Cron Expression Guide", url: "https://crontab.guru/" }], links: [{ name: "Schedule Trigger", url: "https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n.nodes.schedule.trigger/" }], duration: "10:00", order: 3 },
    ],
  },
  {
    title: "Real-World Projects",
    order: 6,
    lessons: [
      { title: "Lead Generation Pipeline", videoUrl: "https://www.youtube.com/watch?v=9L-5o0G-e-I", description: "Build a complete lead generation and CRM automation.", explanation: "Project Overview: Automate lead capture. Store in CRM. Send follow-up emails. Alert sales team.\nWorkflow Steps: Form submission trigger. Validate lead data. Create contact in CRM. Send welcome email. Add to drip sequence. Notify sales via Slack.\nTools Used: Typeform or custom form. HubSpot or similar CRM. SendGrid or Gmail. Slack for notifications.\nKey Features: Lead scoring. Follow-up reminders. Task creation. Performance tracking.\nSetup: Configure each integration. Test each step. Monitor for issues. Optimize over time.", resources: [{ name: "CRM Integration", url: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n.nodes.hubspot/" }], links: [{ name: "Lead Management", url: "https://docs.n8n.io/use-cases/automations/lead-generation/" }], duration: "20:00", order: 1 },
      { title: "Social Media Scheduler", videoUrl: "https://www.youtube.com/watch?v=kY67Z3wD8n0", description: "Create an automated social media posting system.", explanation: "Project Overview: Schedule posts in advance. Queue content across platforms. Track engagement. Analyze performance.\nWorkflow Steps: Read from Google Sheet. Create content for each platform. Schedule posts. Track results. Report weekly.\nSupported Platforms: Twitter/X. LinkedIn. Facebook. Instagram (via business).\nFeatures: Content calendar. Image processing. Multi-platform posting. Engagement tracking.\nAutomation: Trigger when new row added. Calculate best posting time. Queue management. Failure handling.", resources: [{ name: "Social Media APIs", url: "https://developers.facebook.com/" }], links: [{ name: "Social Media Guide", url: "https://docs.n8n.io/use-cases/automations/social-media/" }], duration: "18:30", order: 2 },
      { title: "Data Pipeline & Reporting", videoUrl: "https://www.youtube.com/watch?v=x7A0sJk43C0", description: "Build an ETL pipeline with automated reporting.", explanation: "Project Overview: Extract from multiple sources. Transform and clean data. Load to data warehouse. Generate reports.\nETL Process: Extract - pull from APIs and databases. Transform - clean, aggregate, calculate. Load - store in destination.\nAutomation: Scheduled daily runs. Error handling and retry. Data validation. Alert on anomalies.\nReporting: Generate PDF reports. Email to stakeholders. Dashboard in Google Data Studio. Slack report channel.\nTools: MySQL for data warehouse. Python for transformations. Google Sheets for reports. Custom email templates.", resources: [{ name: "ETL Best Practices", url: "https://www.xplenty.com/blog/etl-best-practices/" }], links: [{ name: "Data Pipelines", url: "https://docs.n8n.io/use-cases/automations/data-pipelines/" }], duration: "22:00", order: 3 },
      { title: "Final Project Walkthrough", videoUrl: "https://www.youtube.com/watch?v=KshZ_c2_xO0", description: "Complete project combining all learned techniques.", explanation: "Project Overview: Build customer onboarding system. Combine all concepts learned. Create production-ready automation.\nComplete Workflow: Form collects info. Validation checks data. CRM creates contact. Email welcome sequence. Task assigned to team. Slack notification. Follow-up after 7 days.\nKey Takeaways: Plan workflow before building. Test thoroughly in staging. Handle errors gracefully. Monitor in production. Document for future reference.\nPutting It Together: Multiple trigger types. Complex transformations. Database operations. Email automation. Real-time notifications. Error handling. Monitoring.\nNext Steps: Build your own projects. Join n8n community. Explore advanced features. Share your automations.", resources: [{ name: "Complete Guide", url: "https://docs.n8n.io/" }], links: [{ name: "Advanced Features", url: "https://docs.n8n.io/advanced/ai/" }], duration: "25:00", order: 4 },
    ],
  },
];

export const EXAM_DATA = {
  title: "n8n Automation Certification Exam",
  description: "Test your n8n knowledge and get certified",
  passingScore: 70,
  timeLimit: 30,
};

export const QUESTIONS_DATA = [
  {
    question: "What is n8n?",
    options: ["A programming language", "A workflow automation tool", "A database", "A hosting service"],
    correctAnswer: 1,
    explanation: "n8n is a workflow automation tool that helps connect different applications and services to automate repetitive tasks.",
  },
  {
    question: "Which node is used to make HTTP requests?",
    options: ["Function Node", "HTTP Request Node", "IF Node", "Slack Node"],
    correctAnswer: 1,
    explanation: "The HTTP Request node is used to communicate with external APIs and services.",
  },
  {
    question: "What is a trigger in n8n?",
    options: ["A function that runs manually", "The starting point that starts a workflow", "An error handler", "A data transformation"],
    correctAnswer: 1,
    explanation: "A trigger is the starting point that initiates a workflow execution, such as a webhook or scheduled time.",
  },
  {
    question: "How do you handle errors in n8n?",
    options: ["Delete the workflow", "Use Continue on Fail and Error Workflows", "Restart n8n", "Ignore them"],
    correctAnswer: 1,
    explanation: "n8n provides error handling options like Continue on Fail and Error Workflows to handle issues gracefully.",
  },
  {
    question: "Which authentication methods are supported in HTTP Request?",
    options: ["Only Basic Auth", "Basic Auth, Bearer Token, API Key", "No authentication", "Only OAuth"],
    correctAnswer: 1,
    explanation: "The HTTP Request node supports multiple authentication methods including Basic Auth, Bearer Token, and API Key.",
  },
  {
    question: "What is the Function node used for?",
    options: ["Sending emails", "Writing custom JavaScript code", "Creating databases", "Designing UI"],
    correctAnswer: 1,
    explanation: "The Function node allows you to write custom JavaScript to transform data or implement custom logic.",
  },
  {
    question: "How do you schedule a workflow to run automatically?",
    options: ["Click schedule button", "Use Cron expression in Schedule Trigger", "Write a script", "Manually run it"],
    correctAnswer: 1,
    explanation: "The Schedule Trigger allows you to use Cron expressions to schedule automatic workflow execution.",
  },
  {
    question: "What is the Switch node used for?",
    options: ["To switch users", "To create conditional branches with multiple outputs", "To change node types", "To send messages"],
    correctAnswer: 1,
    explanation: "The Switch node creates multiple conditional branches, similar to a switch statement in programming.",
  },
  {
    question: "How can n8n connect to databases?",
    options: ["Through special cables", "Using database nodes (MySQL, PostgreSQL, MongoDB)", "Only through APIs", "It cannot connect to databases"],
    correctAnswer: 1,
    explanation: "n8n has built-in nodes for connecting to MySQL, PostgreSQL, MongoDB and other databases.",
  },
  {
    question: "What is the recommended way to install n8n for development?",
    options: ["Download from website", "Use Docker", "Compile from source", "Buy from app store"],
    correctAnswer: 1,
    explanation: "Docker is the recommended way to install n8n for development as it provides easy setup and isolation.",
  },
  {
    question: "What is a webhook in n8n?",
    options: ["A type of node", "An HTTP callback that triggers a workflow", "A database connector", "An email service"],
    correctAnswer: 1,
    explanation: "A webhook is an HTTP callback that triggers a workflow when external events occur.",
  },
  {
    question: "How do you transform data in n8n?",
    options: ["Use magic wand", "Use Set, Function nodes and expressions", "Import transformation file", "Use external tool"],
    correctAnswer: 1,
    explanation: "Data transformation in n8n is done using the Set node, Function node, and expressions.",
  },
  {
    question: "What is OAuth2 used for?",
    options: ["Writing code", "Secure authentication with external services", "Running workflows", "Creating databases"],
    correctAnswer: 1,
    explanation: "OAuth2 is a secure authentication protocol used to authorize access to external services like Google Sheets.",
  },
  {
    question: "Can n8n act as a backend API?",
    options: ["No, only as automation", "Yes, it can receive requests and return responses", "Only for small tasks", "No, it only reads data"],
    correctAnswer: 1,
    explanation: "n8n can serve as a backend API by using Webhook nodes as REST endpoints.",
  },
  {
    question: "What is the difference between n8n Cloud and Self-hosted?",
    options: ["No difference", "Cloud is hosted by n8n, Self-hosted runs on your own servers", "Cloud is free", "Self-hosted is more expensive"],
    correctAnswer: 1,
    explanation: "n8n Cloud is hosted and managed by n8n, while self-hosted runs on your own infrastructure with more control.",
  },
];