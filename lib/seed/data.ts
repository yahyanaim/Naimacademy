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
      { title: "What is n8n?", videoUrl: "https://www.youtube.com/watch?v=_Wf0NikMyAA", description: "Introduction to n8n workflow automation platform and its key features.", explanation: "What is n8n?: n8n (pronounced 'en-eight-en') is a workflow automation tool that connects different applications and services to automate repetitive tasks.\n\nNode-based: Build automations by connecting nodes on a visual canvas. Each node represents a step (trigger or action).\n\nEvent-driven: Workflows can be triggered by webhooks, schedules, or manually.\n\nSelf-hostable: Run n8n on your own servers for complete data control.\n\nDeveloper-friendly: Built on Node.js, with support for custom JavaScript code.\n\nComparison:\n- Zapier: Best for non-technical users, simple automations\n- Make: Middle ground - more visual canvas than Zapier\n- n8n: Best for developers and maximum control\n\nPricing:\n- Zapier/Make: Charge per task/operation\n- n8n Cloud: Charge per workflow execution\n- n8n Self-hosted: Free (fair-code license)", resources: [{ name: "WorkOS: n8n Guide", url: "https://workos.com/blog/n8n" }, { name: "Parseur: Zapier vs Make vs n8n", url: "https://parseur.com/blog/zapier-vs-make-vs-n8n" }], links: [{ name: "n8n Official Website", url: "https://n8n.io" }, { name: "n8n Documentation", url: "https://docs.n8n.io" }], duration: "18:00", order: 1 },
      { title: "Installing n8n", videoUrl: "https://www.youtube.com/watch?v=R_Q7P_Dq4yY", description: "Step-by-step guide to installing n8n on your local machine.", explanation: "Installation Methods:\n\n1. Docker (Recommended)\n- Install Docker Desktop\n- Run: docker run -it --rm -p 5678:5678 n8nio/n8n\n- Access at http://localhost:5678\n\n2. npm Installation\n- npm install n8n -g\n- Run: n8n\n- Access at http://localhost:5678\n\n3. Cloud Version\n- Sign up at n8n.io\n- Free tier available\n\nConfiguration:\n- Set credentials for integrations\n- Enable webhook callbacks\n- Configure execution timeout", duration: "8:45", order: 2 },
      { title: "Your First Workflow", videoUrl: "https://www.youtube.com/watch?v=9L-5o0G-e-I", description: "Create your first automation workflow in n8n.", explanation: "Creating Your First Workflow:\n\n1. Open n8n and click 'New Workflow'\n2. Add a trigger (e.g., Manual Trigger)\n3. Add an action node (e.g., Google Sheets)\n4. Connect nodes by dragging\n5. Test the workflow\n\nKey Concepts:\n- Nodes: Individual actions/steps\n- Connections: Data flow between nodes\n- Expressions: Dynamic values\n- Credentials: Authentication for services", duration: "15:20", order: 3 },
    ],
  },
  {
    title: "Core Nodes & Operations",
    order: 2,
    lessons: [
      { title: "HTTP Request Node", videoUrl: "https://www.youtube.com/watch?v=kY67Z3wD8n0", description: "Learn to use the HTTP Request node to interact with APIs.", explanation: "HTTP Request Node:\n\nThis node allows n8n to communicate with any API.\n\nConfiguration:\n- Method: GET, POST, PUT, DELETE, etc.\n- URL: The API endpoint\n- Headers: Authentication, content-type\n- Body: Request payload (JSON)\n\nAuthentication:\n- Basic Auth\n- Bearer Token\n- API Key\n\nUse Cases:\n- Fetch data from APIs\n- Send webhooks\n- Integrate with custom services", duration: "12:00", order: 1 },
      { title: "Function & Code Nodes", videoUrl: "https://www.youtube.com/watch?v=x7A0sJk43C0", description: "Writing custom JavaScript in n8n workflows.", explanation: "Function Nodes:\n\nUse JavaScript to transform data.\n\nKey Objects:\n- items: Input data\n- return: Output data\n- $json: Access JSON data\n\nCode Node (New):\n- Modern JavaScript support\n- Better debugging\n- Import external packages\n\nTips:\n- Use console.log for debugging\n- Always return array of items\n- Handle errors with try/catch", duration: "14:30", order: 2 },
      { title: "IF & Switch Nodes", videoUrl: "https://www.youtube.com/watch?v=KshZ_c2_xO0", description: "Conditional logic and branching in workflows.", explanation: "Conditional Logic:\n\nIF Node:\n- Splits flow into two paths\n- True: When condition is met\n- False: When condition fails\n\nSwitch Node:\n- Multiple conditions\n- Multiple output branches\n- Default fallback option\n\nConditions:\n- String: contains, equals, starts with\n- Number: greater than, less than, equals\n- Boolean: is true, is false", duration: "11:15", order: 3 },
    ],
  },
  {
    title: "Working with Data",
    order: 3,
    lessons: [
      { title: "Data Transformation", videoUrl: "https://www.youtube.com/watch?v=XWkG85q0H0c", description: "Transform and manipulate data between nodes.", explanation: "Data Transformation:\n\n- Rename keys\n- Filter arrays\n- Merge objects\n- Split strings\n- Format dates\n\nTools:\n- Set node: Add/modify properties\n- Move to node: Restructure data\n- Spreadsheet file: CSV/Excel handling\n\nCommon Transformations:\n- JSON to CSV\n- Array to string\n- Date formatting", duration: "13:45", order: 1 },
      { title: "Working with JSON", videoUrl: "https://www.youtube.com/watch?v=1MwSoB0gnM4", description: "Parse, create, and manipulate JSON data in workflows.", explanation: "JSON in n8n:\n\nAll data in n8n is JSON internally.\n\nOperations:\n- Parse: String to JSON\n- Stringify: JSON to string\n- Access: item.json.property\n- Create: Build new objects\n\nTips:\n- Use expressions to navigate\n- Use code node for complex parsing\n- Validate JSON structure", duration: "10:20", order: 2 },
      { title: "Error Handling", videoUrl: "https://www.youtube.com/watch?v=R_Q7P_Dq4yY", description: "Implement robust error handling in your automations.", explanation: "Error Handling:\n\n- Continue on Fail: Continue even if error\n- Error Workflow: Separate workflow for errors\n- Retry: Automatic retry attempts\n- Rollback: Revert changes on failure\n\nBest Practices:\n- Always validate input data\n- Set reasonable timeouts\n- Monitor workflow executions\n- Use error alerts", duration: "9:30", order: 3 },
    ],
  },
  {
    title: "Integrations",
    order: 4,
    lessons: [
      { title: "Google Sheets Integration", videoUrl: "https://www.youtube.com/watch?v=9L-5o0G-e-I", description: "Connect n8n with Google Sheets for data management.", explanation: "Google Sheets Integration:\n\nAuthentication:\n- OAuth2 or Service Account\n- Create credentials in Google Cloud\n\nOperations:\n- Read: Fetch data from sheets\n- Write: Append or update rows\n- Update: Modify specific cells\n- Create: New spreadsheet\n\nUse Cases:\n- Lead tracking\n- Data collection forms\n- Report generation", duration: "16:00", order: 1 },
      { title: "Slack & Discord Bots", videoUrl: "https://www.youtube.com/watch?v=kY67Z3wD8n0", description: "Build chat bots and notifications with messaging platforms.", explanation: "Messaging Integrations:\n\nSlack:\n- Send messages to channels\n- Interactive buttons\n- Bot commands\n- Workflow notifications\n\nDiscord:\n- Webhook messages\n- Embed formatting\n- Role mentions\n\nSetup:\n- Create Bot in platform\n- Get webhook URL\n- Configure in n8n", duration: "14:00", order: 2 },
      { title: "Database Connections", videoUrl: "https://www.youtube.com/watch?v=x7A0sJk43C0", description: "Connect to MySQL, PostgreSQL, and MongoDB from n8n.", explanation: "Database Integration:\n\nSupported Databases:\n- MySQL\n- PostgreSQL\n- MongoDB\n- SQLite\n\nOperations:\n- Select (Read)\n- Insert (Create)\n- Update (Modify)\n- Delete (Remove)\n\nBest Practices:\n- Use connection pooling\n- Handle large datasets\n- Secure credentials\n- Query optimization", duration: "12:45", order: 3 },
    ],
  },
  {
    title: "Advanced Workflows",
    order: 5,
    lessons: [
      { title: "Webhooks & Triggers", videoUrl: "https://www.youtube.com/watch?v=KshZ_c2_xO0", description: "Learn about different trigger types and webhooks.", explanation: "Triggers:\n\nWebhook Triggers:\n- Receive data from external apps\n- Real-time notifications\n- REST API endpoints\n\nScheduled Triggers:\n- Cron-based execution\n- Interval-based\n- Specific times\n\nOther Triggers:\n- File triggers\n- Email triggers\n- Custom triggers\n\nUse Cases:\n- Form submissions\n- Payment notifications\n- External app sync", duration: "13:30", order: 1 },
      { title: "API Building with n8n", videoUrl: "https://www.youtube.com/watch?v=XWkG85q0H0c", description: "Create your own APIs using n8n.", explanation: "Building APIs:\n\nn8n can serve as a backend:\n- Receive webhook requests\n- Process and transform data\n- Return JSON responses\n\nEndpoints:\n- GET: Fetch data\n- POST: Create data\n- PUT: Update data\n- DELETE: Remove data\n\nAuthentication:\n- API keys\n- Basic auth\n- Token-based", duration: "11:45", order: 2 },
      { title: "Building a Complete Automation", videoUrl: "https://www.youtube.com/watch?v=1MwSoB0gnM4", description: "Put everything together to build a production automation.", explanation: "Complete Automation Project:\n\n1. Plan the workflow\n2. Identify triggers and actions\n3. Set up error handling\n4. Test thoroughly\n5. Monitor and optimize\n\nExample Project:\n- Trigger: New form submission\n- Validate: Check required fields\n- Process: Transform data\n- Store: Save to database\n- Notify: Send confirmation\n- Alert: Error notification\n\nBest Practices:\n- Document your workflow\n- Use naming conventions\n- Version control\n- Regular maintenance", duration: "18:00", order: 3 },
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