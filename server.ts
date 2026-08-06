import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { JobPosting, ScreeningResult, EvaluationWeights } from './src/types';

// Initialize Express
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Google GenAI
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Gemini API calls will fail until provided in Secrets.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Screen a single candidate resume against a job description using Gemini
 */
app.post('/api/screen-resume', async (req, res) => {
  try {
    const { jobPosting, resumeText, fileName, fileData, weights } = req.body as {
      jobPosting: JobPosting;
      resumeText?: string;
      fileName?: string;
      fileData?: { data: string; mimeType: string };
      weights?: EvaluationWeights;
    };

    if (!jobPosting) {
      return res.status(400).json({ error: 'Job posting is required' });
    }
    if (!resumeText && !fileData) {
      return res.status(400).json({ error: 'Resume text or file data is required' });
    }

    const ai = getAIClient();

    const evaluationWeights = weights || {
      hardSkills: 40,
      softSkills: 20,
      experience: 30,
      education: 10,
    };

    const promptText = `
You are an expert HR Talent Specialist and Technical Recruiter.
Analyze the provided candidate resume against the Target Job Posting below.

TARGET JOB POSTING:
- Title: ${jobPosting.title}
- Department: ${jobPosting.department}
- Experience Level: ${jobPosting.experienceLevel} (Minimum ${jobPosting.minYearsExperience} years)
- Required Skills: ${jobPosting.requiredSkills.join(', ')}
- Preferred Skills: ${jobPosting.preferredSkills.join(', ')}
- Education Requirement: ${jobPosting.educationRequirement}
- Description: ${jobPosting.description}

EVALUATION WEIGHTS:
- Hard Skills: ${evaluationWeights.hardSkills}%
- Soft Skills & Culture Fit: ${evaluationWeights.softSkills}%
- Years & Quality of Relevant Experience: ${evaluationWeights.experience}%
- Education & Certifications: ${evaluationWeights.education}%

EVALUATION INSTRUCTIONS:
1. Extract candidate contact info (name, email, phone, location, current role, total years of experience).
2. Calculate overall match score (0 to 100) based on strict alignment with required skills, experience, and education.
3. Calculate sub-scores (0-100) for hardSkills, softSkills, experience, and education.
4. Categorize overall recommendation as one of: "Strong Hire", "Interview", "Potential Match", "Keep on File", or "Not a Match".
5. Write a concise executive summary (3-4 sentences).
6. List top key strengths with direct evidence from the resume.
7. List any required skills that are missing or lacking in depth.
8. Evaluate each required and preferred skill and mark as matched (true/false) with brief notes.
9. Flag any potential red flags or gaps (e.g. employment gaps, missing degree, unverified claims).
10. Extract work experience entries (title, company, duration, brief summary) and education.
11. Generate 2-3 tailored interview questions targeting weak spots or clarifying ambiguous areas.
`;

    const contentsParts: any[] = [];

    if (fileData && fileData.data) {
      contentsParts.push({
        inlineData: {
          mimeType: fileData.mimeType || 'application/pdf',
          data: fileData.data,
        },
      });
      contentsParts.push({ text: promptText });
    } else {
      contentsParts.push({
        text: `${promptText}\n\nCANDIDATE RESUME TEXT:\n${resumeText}`,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: { parts: contentsParts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidateName: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            location: { type: Type.STRING },
            currentRole: { type: Type.STRING },
            yearsOfExperience: { type: Type.NUMBER },
            overallScore: { type: Type.NUMBER, description: 'Overall score from 0 to 100' },
            recommendation: {
              type: Type.STRING,
              enum: ['Strong Hire', 'Interview', 'Potential Match', 'Keep on File', 'Not a Match'],
            },
            categoryScores: {
              type: Type.OBJECT,
              properties: {
                hardSkills: { type: Type.NUMBER },
                softSkills: { type: Type.NUMBER },
                experience: { type: Type.NUMBER },
                education: { type: Type.NUMBER },
              },
              required: ['hardSkills', 'softSkills', 'experience', 'education'],
            },
            executiveSummary: { type: Type.STRING },
            keyStrengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            missingRequiredSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            skillMatches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skill: { type: Type.STRING },
                  matched: { type: Type.BOOLEAN },
                  notes: { type: Type.STRING },
                },
                required: ['skill', 'matched'],
              },
            },
            redFlagsOrGaps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            extractedExperience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  company: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['title', 'company', 'duration'],
              },
            },
            extractedEducation: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  degree: { type: Type.STRING },
                  institution: { type: Type.STRING },
                  year: { type: Type.STRING },
                },
                required: ['degree', 'institution'],
              },
            },
            tailoredInterviewQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  focusArea: { type: Type.STRING },
                  expectedAnswerDetails: { type: Type.STRING },
                },
                required: ['question', 'focusArea'],
              },
            },
          },
          required: [
            'candidateName',
            'overallScore',
            'recommendation',
            'categoryScores',
            'executiveSummary',
            'keyStrengths',
            'skillMatches',
            'extractedExperience',
            'tailoredInterviewQuestions',
          ],
        },
      },
    });

    const responseText = response.text || '{}';
    const parsedData = JSON.parse(responseText);

    const result: ScreeningResult = {
      candidateId: req.body.candidateId || `cand-${Date.now()}`,
      candidateName: parsedData.candidateName || 'Unknown Candidate',
      email: parsedData.email || '',
      phone: parsedData.phone || '',
      location: parsedData.location || '',
      currentRole: parsedData.currentRole || 'N/A',
      yearsOfExperience: typeof parsedData.yearsOfExperience === 'number' ? parsedData.yearsOfExperience : 0,
      overallScore: Math.min(100, Math.max(0, Math.round(parsedData.overallScore || 50))),
      recommendation: parsedData.recommendation || 'Potential Match',
      categoryScores: {
        hardSkills: Math.min(100, Math.max(0, Math.round(parsedData.categoryScores?.hardSkills || 50))),
        softSkills: Math.min(100, Math.max(0, Math.round(parsedData.categoryScores?.softSkills || 50))),
        experience: Math.min(100, Math.max(0, Math.round(parsedData.categoryScores?.experience || 50))),
        education: Math.min(100, Math.max(0, Math.round(parsedData.categoryScores?.education || 50))),
      },
      executiveSummary: parsedData.executiveSummary || 'Screening complete.',
      keyStrengths: parsedData.keyStrengths || [],
      missingRequiredSkills: parsedData.missingRequiredSkills || [],
      skillMatches: parsedData.skillMatches || [],
      redFlagsOrGaps: parsedData.redFlagsOrGaps || [],
      extractedExperience: parsedData.extractedExperience || [],
      extractedEducation: parsedData.extractedEducation || [],
      tailoredInterviewQuestions: parsedData.tailoredInterviewQuestions || [],
      resumeText: resumeText || '(File upload)',
      fileName: fileName || 'Uploaded_Resume.pdf',
      screenedAt: new Date().toISOString(),
    };

    res.json(result);
  } catch (error: any) {
    console.error('Error screening resume:', error);
    res.status(500).json({
      error: 'Failed to screen resume',
      details: error.message || String(error),
    });
  }
});

/**
 * Candidate Q&A Assistant Endpoint
 */
app.post('/api/candidate-qa', async (req, res) => {
  try {
    const { jobPosting, screeningResult, question } = req.body as {
      jobPosting: JobPosting;
      screeningResult: ScreeningResult;
      question: string;
    };

    if (!jobPosting || !screeningResult || !question) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const ai = getAIClient();

    const prompt = `
You are an expert recruitment assistant analyzing candidate "${screeningResult.candidateName}" for the position of "${jobPosting.title}".

JOB DETAILS:
- Title: ${jobPosting.title}
- Required Skills: ${jobPosting.requiredSkills.join(', ')}
- Minimum Experience: ${jobPosting.minYearsExperience} years

CANDIDATE ANALYSIS SUMMARY:
- Overall Score: ${screeningResult.overallScore}% (${screeningResult.recommendation})
- Hard Skills: ${screeningResult.categoryScores.hardSkills}% | Experience: ${screeningResult.categoryScores.experience}%
- Current Role: ${screeningResult.currentRole}
- Executive Summary: ${screeningResult.executiveSummary}
- Strengths: ${screeningResult.keyStrengths.join('; ')}
- Missing Skills: ${screeningResult.missingRequiredSkills.join('; ') || 'None'}
- Gaps/Red Flags: ${screeningResult.redFlagsOrGaps.join('; ') || 'None'}
- Resume Text: ${screeningResult.resumeText || 'Not provided'}

RECRUITER QUESTION:
"${question}"

Provide a direct, insightful, and professional answer evaluating the candidate based on their resume and job requirements. Use bullet points where appropriate.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Error in candidate Q&A:', error);
    res.status(500).json({ error: 'Failed to answer candidate query', details: error.message });
  }
});

/**
 * AI Job Description Generator
 */
app.post('/api/generate-jd', async (req, res) => {
  try {
    const { title, department, keyNotes } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Job title is required' });
    }

    const ai = getAIClient();

    const prompt = `
Generate a comprehensive professional Job Posting for the role of "${title}" in the "${department || 'General'}" department.
Key Notes / Desired Criteria: ${keyNotes || 'Standard industry standards for this role'}.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            department: { type: Type.STRING },
            location: { type: Type.STRING },
            employmentType: { type: Type.STRING, enum: ['Full-time', 'Part-time', 'Contract', 'Remote'] },
            experienceLevel: { type: Type.STRING, enum: ['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Executive'] },
            minYearsExperience: { type: Type.NUMBER },
            educationRequirement: { type: Type.STRING },
            requiredSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            preferredSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            description: { type: Type.STRING },
          },
          required: [
            'title',
            'department',
            'location',
            'employmentType',
            'experienceLevel',
            'minYearsExperience',
            'educationRequirement',
            'requiredSkills',
            'preferredSkills',
            'description',
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json(parsedData);
  } catch (error: any) {
    console.error('Error generating job description:', error);
    res.status(500).json({ error: 'Failed to generate job description', details: error.message });
  }
});

// Setup Vite Development or Static Production middleware
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
