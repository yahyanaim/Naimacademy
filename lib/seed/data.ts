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
      { title: "What is n8n?", videoUrl: "https://www.youtube.com/watch?v=1MwSoB0gnM4", description: "Introduction to n8n workflow automation platform and its key features.", duration: "10:30", order: 1 },
      { title: "Installing n8n", videoUrl: "https://www.youtube.com/watch?v=R_Q7P_Dq4yY", description: "Step-by-step guide to installing n8n on your local machine.", duration: "8:45", order: 2 },
      { title: "Your First Workflow", videoUrl: "https://www.youtube.com/watch?v=9L-5o0G-e-I", description: "Create your first automation workflow in n8n.", duration: "15:20", order: 3 },
    ],
  },
  {
    title: "Core Nodes & Operations",
    order: 2,
    lessons: [
      { title: "HTTP Request Node", videoUrl: "https://www.youtube.com/watch?v=kY67Z3wD8n0", description: "Learn to use the HTTP Request node to interact with APIs.", duration: "12:00", order: 1 },
      { title: "Function & Code Nodes", videoUrl: "https://www.youtube.com/watch?v=x7A0sJk43C0", description: "Writing custom JavaScript in n8n workflows.", duration: "14:30", order: 2 },
      { title: "IF & Switch Nodes", videoUrl: "https://www.youtube.com/watch?v=KshZ_c2_xO0", description: "Conditional logic and branching in workflows.", duration: "11:15", order: 3 },
    ],
  },
  {
    title: "Working with Data",
    order: 3,
    lessons: [
      { title: "Data Transformation", videoUrl: "https://www.youtube.com/watch?v=XWkG85q0H0c", description: "Transform and manipulate data between nodes.", duration: "13:45", order: 1 },
      { title: "Working with JSON", videoUrl: "https://www.youtube.com/watch?v=1MwSoB0gnM4", description: "Parse, create, and manipulate JSON data in workflows.", duration: "10:20", order: 2 },
      { title: "Error Handling", videoUrl: "https://www.youtube.com/watch?v=R_Q7P_Dq4yY", description: "Implement robust error handling in your automations.", duration: "9:30", order: 3 },
    ],
  },
  {
    title: "Integrations",
    order: 4,
    lessons: [
      { title: "Google Sheets Integration", videoUrl: "https://www.youtube.com/watch?v=9L-5o0G-e-I", description: "Connect n8n with Google Sheets for data management.", duration: "16:00", order: 1 },
      { title: "Slack & Discord Bots", videoUrl: "https://www.youtube.com/watch?v=kY67Z3wD8n0", description: "Build chat bots and notifications with messaging platforms.", duration: "14:00", order: 2 },
      { title: "Database Connections", videoUrl: "https://www.youtube.com/watch?v=x7A0sJk43C0", description: "Connect to MySQL, PostgreSQL, and MongoDB from n8n.", duration: "12:45", order: 3 },
      { title: "Email Automation", videoUrl: "https://www.youtube.com/watch?v=KshZ_c2_xO0", description: "Automate email sending and processing.", duration: "11:30", order: 4 },
    ],
  },
  {
    title: "Advanced Techniques",
    order: 5,
    lessons: [
      { title: "Webhooks & Triggers", videoUrl: "https://www.youtube.com/watch?v=XWkG85q0H0c", description: "Set up webhooks and event-driven workflows.", duration: "15:00", order: 1 },
      { title: "Sub-workflows", videoUrl: "https://www.youtube.com/watch?v=1MwSoB0gnM4", description: "Organize complex automations using sub-workflows.", duration: "13:20", order: 2 },
      { title: "Scheduling & Cron", videoUrl: "https://www.youtube.com/watch?v=R_Q7P_Dq4yY", description: "Schedule recurring workflows with cron expressions.", duration: "10:00", order: 3 },
    ],
  },
  {
    title: "Real-World Projects",
    order: 6,
    lessons: [
      { title: "Lead Generation Pipeline", videoUrl: "https://www.youtube.com/watch?v=9L-5o0G-e-I", description: "Build a complete lead generation and CRM automation.", duration: "20:00", order: 1 },
      { title: "Social Media Scheduler", videoUrl: "https://www.youtube.com/watch?v=kY67Z3wD8n0", description: "Create an automated social media posting system.", duration: "18:30", order: 2 },
      { title: "Data Pipeline & Reporting", videoUrl: "https://www.youtube.com/watch?v=x7A0sJk43C0", description: "Build an ETL pipeline with automated reporting.", duration: "22:00", order: 3 },
      { title: "Final Project Walkthrough", videoUrl: "https://www.youtube.com/watch?v=KshZ_c2_xO0", description: "Complete project combining all learned techniques.", duration: "25:00", order: 4 },
    ],
  },
];

export const EXAM_DATA = {
  title: "n8n Automation Certification Exam",
  passingScore: 70,
  timeLimitMinutes: 30,
};

export const QUESTIONS_DATA = [
  { type: "multiple-choice" as const, question: "What is n8n primarily used for?", options: ["Web development", "Workflow automation", "Database management", "Video editing"], correctAnswer: 1, order: 1 },
  { type: "true-false" as const, question: "n8n is an open-source workflow automation tool.", options: ["True", "False"], correctAnswer: 0, order: 2 },
  { type: "multiple-choice" as const, question: "Which node is used to make API calls in n8n?", options: ["Function Node", "HTTP Request Node", "Set Node", "Merge Node"], correctAnswer: 1, order: 3 },
  { type: "true-false" as const, question: "n8n can only be self-hosted and has no cloud offering.", options: ["True", "False"], correctAnswer: 1, order: 4 },
  { type: "multiple-choice" as const, question: "What programming language is used in the Function node?", options: ["Python", "JavaScript", "Ruby", "Go"], correctAnswer: 1, order: 5 },
  { type: "multiple-choice" as const, question: "Which node is used for conditional logic in n8n?", options: ["Merge Node", "IF Node", "Set Node", "HTTP Node"], correctAnswer: 1, order: 6 },
  { type: "true-false" as const, question: "Webhooks in n8n can trigger workflows from external events.", options: ["True", "False"], correctAnswer: 0, order: 7 },
  { type: "multiple-choice" as const, question: "What is a sub-workflow in n8n?", options: ["A broken workflow", "A workflow called by another workflow", "A workflow template", "A debug mode"], correctAnswer: 1, order: 8 },
  { type: "multiple-choice" as const, question: "Which format is most commonly used for data exchange in n8n?", options: ["XML", "CSV", "JSON", "YAML"], correctAnswer: 2, order: 9 },
  { type: "true-false" as const, question: "n8n supports scheduling workflows using cron expressions.", options: ["True", "False"], correctAnswer: 0, order: 10 },
  { type: "multiple-choice" as const, question: "What is the purpose of the Set node?", options: ["Delete data", "Set or modify data fields", "Send emails", "Create databases"], correctAnswer: 1, order: 11 },
  { type: "multiple-choice" as const, question: "How does n8n handle errors in workflows?", options: ["It ignores them", "Error Trigger node and try/catch patterns", "Automatic retry only", "Email notifications only"], correctAnswer: 1, order: 12 },
  { type: "true-false" as const, question: "n8n workflows can only be triggered manually.", options: ["True", "False"], correctAnswer: 1, order: 13 },
  { type: "multiple-choice" as const, question: "Which of these is NOT a valid n8n trigger?", options: ["Webhook", "Cron Schedule", "Manual", "CSS Selector"], correctAnswer: 3, order: 14 },
  { type: "multiple-choice" as const, question: "What does the Merge node do?", options: ["Splits data into multiple outputs", "Combines data from multiple inputs", "Deletes duplicate data", "Formats data as CSV"], correctAnswer: 1, order: 15 },
];
