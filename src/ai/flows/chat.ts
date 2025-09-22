
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
import { updateProfileInFirestore, saveResumeToFirestore } from '@/lib/firestore';

// Zod schema for a single message in the chat history
const MessageSchema = z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
});

// Zod schema for the chat flow input
const ChatInputSchema = z.object({
  history: z.array(MessageSchema),
  prompt: z.string(),
  profile: z.string().describe("The user's current professional profile data."),
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


// Tool to update the user's profile
const updateUserProfileTool = ai.defineTool(
    {
        name: 'updateUserProfile',
        description: 'Updates the user\'s professional profile. Use this when the user provides new information about their name, headline, summary, experience, skills, education, or contact information.',
        inputSchema: z.object({
            name: z.string().optional().describe("The user's full name."),
            headline: z.string().optional().describe("The user's professional headline (e.g., 'Senior Software Engineer')."),
            summary: z.string().optional().describe("A summary of the user's experience, skills, and accomplishments. This should be a comprehensive text blob."),
            phone: z.string().optional().describe("The user's phone number."),
        }),
        outputSchema: z.string(),
    },
    async (updates) => {
        // In a real app, you'd get the UID from the authenticated session.
        // For this mock, we assume a static UID or would need to pass it in.
        const mockUid = 'mock-user-id-from-session'; 
        await updateProfileInFirestore(mockUid, updates);
        return 'Profile updated successfully.';
    }
);


const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async ({ history, prompt, profile }) => {

    const llmResponse = await ai.generate({
      prompt: `The user's prompt is: ${prompt}.
               The user's current profile is: ${profile}.
               The chat history is: ${JSON.stringify(history)}`,
      model: 'googleai/gemini-2.5-flash',
      tools: [updateUserProfileTool],
      system: `You are a helpful AI career assistant. Your goal is to help the user build their professional profile and generate resumes.
               1. Engage in a friendly, natural conversation.
               2. If the user provides information that should be in their profile (like skills, experience, name, headline), use the updateUserProfileTool to save it. The 'summary' field should contain the bulk of their experience, skills, etc.
               3. If the user provides a job description and explicitly asks to create a resume, your primary goal is to extract the job description and a suitable title. Then, respond with ONLY a JSON object: {"isResumeRequest": true, "jobDescription": "...", "title": "..."}. Do not add any conversational text.
               4. For all other interactions, provide a conversational reply in the 'reply' field.
               `,
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
    
    if (output?.isResumeRequest && output.jobDescription) {
        const resumeResult = await generateResumeFromProfile({
            profileData: profile,
            jobDescription: output.jobDescription,
        });

        return {
            reply: "I've generated your resume! Here it is.",
            resumeContent: resumeResult.resumeContent,
            title: output.title,
            jobDescription: output.jobDescription,
        };
    }
    
    // If a tool was used, the reply might be empty. Formulate a response.
    const toolCalls = llmResponse.toolCalls;
    if (toolCalls && toolCalls.length > 0) {
        return { reply: "I've updated your profile with that information. What's next?" };
    }

    return { reply: output?.reply || "I'm not sure how to respond to that. Could you try rephrasing?" };
  }
);


export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}
