
'use server';
/**
 * @fileOverview A conversational AI flow for profile management and resume generation.
 * 
 * - chat - The main conversational entry point.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import { ai } from '@/ai/genkit';
import { generateResumeFromProfile } from './generate-resume-from-profile';
import { z } from 'zod';
import { getProfileFromFirestore, updateProfileInFirestore } from '@/lib/firestore';
import type { UserProfile } from '@/types';


// Zod schema for a single message in the chat history
const MessageSchema = z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
});

// Zod schema for the chat flow input
const ChatInputSchema = z.object({
  history: z.array(MessageSchema),
  prompt: z.string(),
  profile: z.string().describe("The user's current professional profile data as a JSON string."),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;


// Zod schema for the chat flow output
const ChatOutputSchema = z.object({
  reply: z.string().describe("The AI's textual reply to the user."),
  resumeContent: z.string().optional().describe("The generated resume in LaTeX format, if requested."),
  title: z.string().optional().describe("The title of the generated resume, if applicable."),
  jobDescription: z.string().optional().describe("The job description used for resume generation, if applicable."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;


const updateUserProfileTool = ai.defineTool(
    {
        name: 'updateUserProfile',
        description: "Update one or more sections of the user's professional profile. Use this when the user provides new information about their career, skills, or background. Always append new information to the existing content of a field, using the provided current profile data as context.",
        inputSchema: z.object({
            name: z.string().optional().describe("The user's full name."),
            headline: z.string().optional().describe("The user's professional headline (e.g., 'Senior Software Engineer')."),
            phone: z.string().optional().describe("The user's phone number."),
            links: z.array(z.object({ label: z.string(), url: z.string() })).optional().describe("An array of the user's links (e.g., portfolio, LinkedIn, GitHub)."),
            skills: z.string().optional().describe("An update or addition to the user's skills. Append to existing content."),
            experience: z.string().optional().describe("An update or addition to the user's work experience. Append to existing content."),
            education: z.string().optional().describe("An update or addition to the user's education. Append to existing content."),
            projects: z.string().optional().describe("An update or addition to the user's projects. Append to existing content."),
            extracurriculars: z.string().optional().describe("An update or addition to the user's extracurricular activities. Append to existing content."),
            honorsAndAwards: z.string().optional().describe("An update or addition to the user's honors and awards. Append to existing content."),
        }),
        outputSchema: z.string(),
    },
    async (updates, context) => {
        const { profile } = context as { profile: UserProfile };
        
        const profileUpdate: Partial<UserProfile> = {};

        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
                const existingValue = profile[key as keyof UserProfile];
                if (typeof existingValue === 'string' && existingValue) {
                    // @ts-ignore
                    profileUpdate[key] = `${existingValue}\n${value}`;
                } else {
                     // @ts-ignore
                    profileUpdate[key] = value;
                }
            }
        }
        
        await updateProfileInFirestore(profile.uid, profileUpdate);
        return "Profile successfully updated.";
    }
);


const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async ({ history, prompt, profile }) => {
    
    const parsedProfile = JSON.parse(profile) as UserProfile;

    const llmResponse = await ai.generate({
      prompt: `The user's prompt is: ${prompt}.`,
      model: 'googleai/gemini-2.5-flash',
      tools: [updateUserProfileTool],
      toolConfig: {
          context: {
              profile: parsedProfile // Pass the parsed profile as context to the tool
          }
      },
      system: `You are a helpful AI career assistant. Your goal is to help the user build their professional profile and generate resumes.
               1. Engage in a friendly, natural conversation.
               2. When the user provides information for their profile (like skills, experience, etc.), use the 'updateUserProfileTool'.
               3. IMPORTANT: When updating a text field (like experience, skills), you MUST combine the user's existing information from their profile with the new information they provide. Do NOT just pass the new information alone. Your tool will handle the logic of appending. You must call the tool with only the new information provided by the user.
               4. If the user provides a job description and explicitly asks to create a resume, your primary goal is to extract the job description and a suitable title. Then, respond with ONLY a JSON object: {"isResumeRequest": true, "jobDescription": "...", "title": "..."}. Do not add any conversational text.
               5. For all other interactions, provide a conversational reply in the 'reply' field.
               `,
      history: [...history, {role: 'assistant', content: `Here is the user's current profile: ${profile}`}],
      output: {
          schema: z.object({
              isResumeRequest: z.boolean().optional().describe('Set to true if the user is asking to generate a resume.'),
              jobDescription: z.string().optional().describe('The extracted job description for the resume.'),
              title: z.string().optional().describe('A suitable title for the resume (e.g., "Software Engineer at Google").'),
              reply: z.string().optional().describe('Your conversational reply.')
          })
      }
    });

    const output = llmResponse.output;
    
    // Handle resume generation requests
    if (output?.isResumeRequest && output.jobDescription) {
        const resumeResult = await generateResumeFromProfile({
            profileData: profile, // Pass the full JSON string
            jobDescription: output.jobDescription,
        });

        return {
            reply: "I've generated your resume! Here it is.",
            resumeContent: resumeResult.resumeContent,
            title: output.title,
            jobDescription: output.jobDescription,
        };
    }
    
    // Handle profile updates
    const toolCalls = llmResponse.toolCalls;
    if (toolCalls && toolCalls.length > 0) {
        // The tool now handles the database update directly.
        return { reply: "I've updated your profile with that information. What's next?" };
    }

    return { reply: output?.reply || "I'm not sure how to respond to that. Could you try rephrasing?" };
  }
);


export async function chat(input: ChatInput): Promise<ChatOutput> {
  return await chatFlow(input);
}
