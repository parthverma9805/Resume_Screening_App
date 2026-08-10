import { JobPosting, Candidate } from '../types';

export const INITIAL_JOBS: JobPosting[] = [
  {
    id: 'job-1',
    title: 'Senior Full Stack Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA (Hybrid)',
    employmentType: 'Full-time',
    experienceLevel: 'Senior',
    minYearsExperience: 5,
    educationRequirement: "Bachelor's in Computer Science or equivalent practical experience",
    requiredSkills: [
      'React',
      'TypeScript',
      'Node.js',
      'REST APIs / GraphQL',
      'PostgreSQL or MongoDB',
      'Cloud Architecture (AWS/GCP)',
      'CI/CD Pipelines'
    ],
    preferredSkills: [
      'Next.js',
      'Tailwind CSS',
      'LLM / Generative AI Integration',
      'System Architecture Design',
      'Docker & Kubernetes'
    ],
    description: `We are looking for a Senior Full Stack Engineer to lead the architecture and build of our next-generation AI platform. In this role, you will design scalable web applications, implement real-time APIs, and collaborate closely with product managers and AI researchers.

Key Responsibilities:
- Design and implement end-to-end features in React, TypeScript, and Node.js.
- Architect high-performance backend microservices and database schemas.
- Integrate LLM APIs and modern AI agents into user workflows.
- Mentor junior engineers and enforce high code quality standard via PR reviews and tests.`,
    createdAt: new Date().toISOString()
  },
  {
    id: 'job-2',
    title: 'AI Product Manager',
    department: 'Product Management',
    location: 'Remote',
    employmentType: 'Full-time',
    experienceLevel: 'Lead',
    minYearsExperience: 4,
    educationRequirement: "Bachelor's degree in Business, CS, or related field (MBA preferred)",
    requiredSkills: [
      'Product Strategy',
      'User Research & Discovery',
      'Agile / Scrum',
      'LLM / AI Product Experience',
      'Data Analytics & Metrics',
      'Stakeholder Management'
    ],
    preferredSkills: [
      'Technical background in CS',
      'SQL / Product Analytics tools (Amplitude, Mixpanel)',
      'A/B Testing Methodology',
      'Roadmapping in Jira/Linear'
    ],
    description: `We are seeking an experienced AI Product Manager to drive the product strategy and execution for our AI-assisted productivity tools. You will bridge technical engineering teams and customer needs to ship magical AI features.

Key Responsibilities:
- Define vision, strategy, and quarterly roadmap for AI features.
- Conduct qualitative customer interviews and quantitative product telemetry analysis.
- Write detailed PRDs and user stories for engineering squads.
- Evaluate AI model accuracy, latency, and output quality against user benchmarks.`,
    createdAt: new Date().toISOString()
  },
  {
    id: 'job-3',
    title: 'Senior Data Scientist (ML/NLP)',
    department: 'Data & AI',
    location: 'New York, NY',
    employmentType: 'Full-time',
    experienceLevel: 'Senior',
    minYearsExperience: 4,
    educationRequirement: "Master's or PhD in Computer Science, Statistics, or Data Science",
    requiredSkills: [
      'Python',
      'PyTorch or TensorFlow',
      'Natural Language Processing (NLP)',
      'Large Language Models (LLMs)',
      'SQL & Data Pipelines',
      'Feature Engineering & Model Evaluation'
    ],
    preferredSkills: [
      'LangChain / LlamaIndex / Agent Frameworks',
      'RAG Architecture',
      'Fine-tuning Hugging Face Transformers',
      'MLOps (MLflow, Weights & Biases)'
    ],
    description: `Join our AI Lab as a Senior Data Scientist specializing in NLP and generative AI. You will build and deploy state-of-the-art information extraction and document analysis models.

Key Responsibilities:
- Develop advanced NLP algorithms for unstructured text parsing and sentiment scoring.
- Design Retrieval-Augmented Generation (RAG) pipelines for enterprise data.
- Optimize LLM prompt techniques and fine-tune open-weight models for specialized tasks.
- Monitor model performance in production and mitigate hallucinations or biases.`,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_CANDIDATES: Candidate[] = [];
