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

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    jobId: 'job-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    status: 'shortlisted',
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    fileName: 'Alex_Rivera_FullStack_Resume.pdf',
    resumeText: `ALEX RIVERA
San Francisco, CA | alex.rivera@example.com | github.com/alexrivera-dev

SUMMARY:
Senior Full Stack Engineer with 6 years of experience building scalable web applications and SaaS platforms. Specialist in React, TypeScript, Node.js, and cloud deployments on GCP/AWS. Proven track record of shipping AI integrations and leading agile sprint teams.

WORK EXPERIENCE:
Lead Software Engineer | CloudScale Tech (2022 - Present)
- Architected high-throughput microservices in Node.js and TypeScript handling 5M+ daily requests.
- Led frontend redesign using React, Next.js, and Tailwind CSS, improving core web vitals by 45%.
- Integrated OpenAI & Gemini API pipelines for automated document summarization, driving 30% user growth.
- Configured CI/CD automation with GitHub Actions, Docker containers, and Cloud Run.

Full Stack Software Engineer | DevPulse Inc (2019 - 2022)
- Built real-time collaborative dashboard using React, WebSocket, and PostgreSQL.
- Authored RESTful APIs and optimized database queries, reducing average API response times from 350ms to 80ms.
- Mentored 4 junior developers and established automated unit testing standards with Jest and Cypress (85%+ code coverage).

EDUCATION:
B.S. in Computer Science | University of California, Berkeley (2015 - 2019)
GPA: 3.8/4.0

TECHNICAL SKILLS:
Languages: TypeScript, JavaScript, Python, SQL, HTML/CSS
Frontend: React, Next.js, Redux, Tailwind CSS, Vite
Backend: Node.js, Express, REST APIs, GraphQL, PostgreSQL, MongoDB, Redis
Cloud & DevOps: GCP, AWS, Docker, CI/CD, Git, Kubernetes`,
    screeningResult: {
      candidateId: 'cand-1',
      candidateName: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      currentRole: 'Lead Software Engineer at CloudScale Tech',
      yearsOfExperience: 6,
      overallScore: 94,
      recommendation: 'Strong Hire',
      categoryScores: {
        hardSkills: 96,
        softSkills: 90,
        experience: 95,
        education: 92
      },
      executiveSummary: 'Alex is an exceptional fit for the Senior Full Stack Engineer position. With 6 years of hands-on experience spanning React, TypeScript, Node.js, GCP/AWS, and real-world LLM API integrations, Alex directly matches every required skill and preferred qualification.',
      keyStrengths: [
        'Exceeds required experience (6 years vs 5 years minimum).',
        'Direct experience integrating Generative AI / LLM pipelines into production.',
        'Strong full-stack mastery across React, TypeScript, Node.js, and PostgreSQL.',
        'Proven leadership experience mentoring engineers and establishing testing standards.'
      ],
      missingRequiredSkills: [],
      skillMatches: [
        { skill: 'React', matched: true, notes: 'Extensive use in React & Next.js production builds' },
        { skill: 'TypeScript', matched: true, notes: 'Primary language across 6 years of work' },
        { skill: 'Node.js', matched: true, notes: 'Built high-throughput backend microservices handling 5M requests/day' },
        { skill: 'REST APIs / GraphQL', matched: true, notes: 'Authored RESTful APIs and microservice endpoints' },
        { skill: 'PostgreSQL or MongoDB', matched: true, notes: 'Hands-on production usage with both PostgreSQL and Redis' },
        { skill: 'Cloud Architecture (AWS/GCP)', matched: true, notes: 'Deploys on GCP, Docker, and Cloud Run' },
        { skill: 'CI/CD Pipelines', matched: true, notes: 'GitHub Actions and Docker automation expert' },
        { skill: 'LLM / Generative AI Integration', matched: true, notes: 'Built Gemini & OpenAI document summarization pipelines' }
      ],
      redFlagsOrGaps: [],
      extractedExperience: [
        {
          title: 'Lead Software Engineer',
          company: 'CloudScale Tech',
          duration: '2022 - Present',
          description: 'Architected Node.js microservices (5M+ daily requests), led React frontend redesign, integrated Gemini AI pipelines.'
        },
        {
          title: 'Full Stack Software Engineer',
          company: 'DevPulse Inc',
          duration: '2019 - 2022',
          description: 'Built real-time collaborative React dashboard, optimized PostgreSQL queries (reduced latencies by 75%).'
        }
      ],
      extractedEducation: [
        {
          degree: 'B.S. in Computer Science',
          institution: 'University of California, Berkeley',
          year: '2015 - 2019'
        }
      ],
      tailoredInterviewQuestions: [
        {
          question: 'Can you walk us through the architecture of the LLM/Gemini document summarization pipeline you built at CloudScale Tech? How did you handle latency and rate limits?',
          focusArea: 'AI Integration & Performance',
          expectedAnswerDetails: 'Candidate should describe asynchronous queueing, caching mechanisms, structured output validation, and fallback mechanisms for API failures.'
        },
        {
          question: 'How do you approach database schema design and index optimization when scaling a PostgreSQL service under high concurrency?',
          focusArea: 'Backend System Design',
          expectedAnswerDetails: 'Candidate should explain query explain plans, indexing strategies, connection pooling, and horizontal scaling strategies.'
        }
      ],
      screenedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
    }
  },
  {
    id: 'cand-2',
    jobId: 'job-1',
    name: 'Maya Lin',
    email: 'maya.lin@example.com',
    phone: '+1 (555) 987-6543',
    location: 'Seattle, WA',
    status: 'interview',
    uploadedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    fileName: 'Maya_Lin_Resume.pdf',
    resumeText: `MAYA LIN
Seattle, WA | maya.lin@example.com | linkedin.com/in/mayalin-dev

SUMMARY:
Frontend Engineer transitioning to Full Stack role. 4 years of solid React and TypeScript development experience with Angular and Node.js backend integration. Passionate about sleek UI engineering, performance optimization, and AI user interfaces.

WORK EXPERIENCE:
Senior Frontend Developer | Apex UI Systems (2022 - Present)
- Developed enterprise React design system components used across 12 product lines.
- Optimized bundle sizes and lazy-loading, boosting site speed by 35%.
- Implemented state management using Redux Toolkit and React Query.

Software Engineer | NextGen Solutions (2020 - 2022)
- Built interactive customer dashboards using Angular and TypeScript.
- Created lightweight Express.js API endpoints for data ingestion.
- Worked with MongoDB database schemas for user preference storage.

EDUCATION:
B.S. in Software Engineering | Washington State University (2016 - 2020)

SKILLS:
Frontend: React, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, Angular
Backend: Node.js, Express.js (Basic), MongoDB
Tools: Git, Vite, Webpack, Figma, Jest`,
    screeningResult: {
      candidateId: 'cand-2',
      candidateName: 'Maya Lin',
      email: 'maya.lin@example.com',
      phone: '+1 (555) 987-6543',
      location: 'Seattle, WA',
      currentRole: 'Senior Frontend Developer at Apex UI Systems',
      yearsOfExperience: 4,
      overallScore: 78,
      recommendation: 'Potential Match',
      categoryScores: {
        hardSkills: 75,
        softSkills: 85,
        experience: 72,
        education: 85
      },
      executiveSummary: 'Maya is a very strong Frontend Specialist with 4 years of React and TypeScript expertise. While slightly lighter on senior backend architecture (Express/MongoDB basics vs 5+ years required full-stack depth), she has excellent UI design skills and software engineering foundation.',
      keyStrengths: [
        'Outstanding React & TypeScript skill proficiency.',
        'Proven design system and frontend performance optimization record.',
        'Clear team collaboration experience.'
      ],
      missingRequiredSkills: [
        'PostgreSQL (has MongoDB experience)',
        'CI/CD Pipelines (not explicitly mentioned)',
        'Cloud Architecture (AWS/GCP)'
      ],
      skillMatches: [
        { skill: 'React', matched: true, notes: 'Built component libraries used across 12 product lines' },
        { skill: 'TypeScript', matched: true, notes: 'Primary language across 4 years' },
        { skill: 'Node.js', matched: true, notes: 'Basic Express.js API creation' },
        { skill: 'PostgreSQL', matched: false, notes: 'Only has MongoDB experience' },
        { skill: 'Cloud Architecture', matched: false, notes: 'Lacks AWS/GCP infrastructure experience' }
      ],
      redFlagsOrGaps: [
        'Has 4 years experience total, falling slightly short of 5-year senior benchmark.',
        'Limited backend architectural depth; heavily frontend weighted.'
      ],
      extractedExperience: [
        {
          title: 'Senior Frontend Developer',
          company: 'Apex UI Systems',
          duration: '2022 - Present',
          description: 'Developed enterprise React design systems, optimized bundle size.'
        },
        {
          title: 'Software Engineer',
          company: 'NextGen Solutions',
          duration: '2020 - 2022',
          description: 'Built Angular dashboards and Express/MongoDB endpoints.'
        }
      ],
      extractedEducation: [
        {
          degree: 'B.S. in Software Engineering',
          institution: 'Washington State University',
          year: '2016 - 2020'
        }
      ],
      tailoredInterviewQuestions: [
        {
          question: 'We noticed your experience is heavily focused on frontend React. How comfortable are you writing complex server-side APIs and managing database transactions in PostgreSQL?',
          focusArea: 'Full Stack Depth',
          expectedAnswerDetails: 'Assess eagerness and capacity to ramp up on backend services, ORM frameworks, and SQL relational databases.'
        }
      ],
      screenedAt: new Date(Date.now() - 3600000 * 18).toISOString()
    }
  },
  {
    id: 'cand-3',
    jobId: 'job-2',
    name: 'David Chen',
    email: 'david.chen@example.com',
    phone: '+1 (555) 345-6789',
    location: 'Austin, TX',
    status: 'shortlisted',
    uploadedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    fileName: 'David_Chen_PM_Resume.pdf',
    resumeText: `DAVID CHEN
Austin, TX | david.chen@example.com

SUMMARY:
Lead AI Product Manager with 6 years of product leadership shipping machine learning and LLM features. Technical CS background with proven track record of growing user engagement by 40%+ through AI automation.

EXPERIENCE:
Senior Product Manager - AI & Search | TechGlobal Inc (2021 - Present)
- Spearheaded the launch of an AI semantic search assistant powered by LLMs, serving 2M+ active users.
- Defined product roadmap, user flows, and success metrics (precision/recall, response time, CSAT).
- Conducted 50+ customer user research sessions to refine prompt templates and UX design.
- Partnered with 12 ML engineers and data scientists in 2-week Agile sprints.

Product Manager | SaaS Metrics Co (2018 - 2021)
- Managed core analytics platform, implementing SQL dashboards and custom Amplitude tracking.
- Led cross-functional squad of 6 developers and designers.

EDUCATION:
B.S. in Computer Science | University of Texas at Austin (2014 - 2018)

SKILLS:
Product: Roadmap Design, PRDs, Customer Interviews, Agile/Scrum, Jira, Linear
AI/Tech: LLM Product Workflows, Prompt Engineering, SQL, Python (Basic), Amplitude, Mixpanel, A/B Testing`,
    screeningResult: {
      candidateId: 'cand-3',
      candidateName: 'David Chen',
      email: 'david.chen@example.com',
      phone: '+1 (555) 345-6789',
      location: 'Austin, TX',
      currentRole: 'Senior Product Manager - AI & Search at TechGlobal Inc',
      yearsOfExperience: 6,
      overallScore: 92,
      recommendation: 'Strong Hire',
      categoryScores: {
        hardSkills: 95,
        softSkills: 92,
        experience: 90,
        education: 88
      },
      executiveSummary: 'David is an ideal fit for the AI Product Manager position. He possesses a BS in Computer Science and 6 years of product experience, specifically leading LLM search products used by 2M+ users.',
      keyStrengths: [
        'Direct experience launching production LLM features to millions of users.',
        'Technical CS degree allows seamless communication with ML engineers.',
        'Strong quantitative analytics skill set (SQL, Amplitude, A/B testing).'
      ],
      missingRequiredSkills: [],
      skillMatches: [
        { skill: 'Product Strategy', matched: true, notes: 'Led AI search strategy for 2M users' },
        { skill: 'LLM / AI Product Experience', matched: true, notes: 'Direct LLM semantic search product owner' },
        { skill: 'User Research & Discovery', matched: true, notes: '50+ customer research interviews' },
        { skill: 'SQL / Product Analytics', matched: true, notes: 'Built custom Amplitude tracking and SQL queries' }
      ],
      redFlagsOrGaps: [],
      extractedExperience: [
        {
          title: 'Senior Product Manager - AI & Search',
          company: 'TechGlobal Inc',
          duration: '2021 - Present',
          description: 'Spearheaded AI semantic search assistant serving 2M+ active users.'
        }
      ],
      extractedEducation: [
        {
          degree: 'B.S. in Computer Science',
          institution: 'University of Texas at Austin',
          year: '2014 - 2018'
        }
      ],
      tailoredInterviewQuestions: [
        {
          question: 'How did you evaluate AI output quality and handle hallucinations during the rollout of the semantic search assistant?',
          focusArea: 'AI Quality Metrics & Product Design',
          expectedAnswerDetails: 'Candidate should detail feedback loops, human-in-the-loop evaluation, and fallback search behaviors.'
        }
      ],
      screenedAt: new Date(Date.now() - 3600000 * 10).toISOString()
    }
  }
];
