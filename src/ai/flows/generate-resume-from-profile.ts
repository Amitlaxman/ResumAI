'use server';
/**
 * @fileOverview Generates a resume from profile data and a job description.
 *
 * - generateResumeFromProfile - A function that generates a resume.
 * - GenerateResumeFromProfileInput - The input type for the generateResumeFromProfile function.
 * - GenerateResumeFromProfileOutput - The return type for the generateResumeFromProfile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResumeFromProfileInputSchema = z.object({
  profileData: z.string().describe('The user profile data including name, email, phone, and headline.'),
  jobDescription: z.string().describe('The job description for tailoring the resume.'),
});
export type GenerateResumeFromProfileInput = z.infer<typeof GenerateResumeFromProfileInputSchema>;

const GenerateResumeFromProfileOutputSchema = z.object({
  resumeContent: z.string().describe('The generated resume content in LaTeX format.'),
});
export type GenerateResumeFromProfileOutput = z.infer<typeof GenerateResumeFromProfileOutputSchema>;

export async function generateResumeFromProfile(input: GenerateResumeFromProfileInput): Promise<GenerateResumeFromProfileOutput> {
  return generateResumeFromProfileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResumeFromProfilePrompt',
  input: {schema: GenerateResumeFromProfileInputSchema},
  output: {schema: GenerateResumeFromProfileOutputSchema},
  prompt: `You are an AI resume writer. Generate a tailored resume in LaTeX format based on the user's profile data and the job description provided.

User Profile Data: {{{profileData}}}
Job Description: {{{jobDescription}}}

Ensure the resume is well-structured, highlights relevant skills and experience, and is optimized for the specific job description. Provide the complete LaTeX code for the resume.`,}
);

const generateResumeFromProfileFlow = ai.defineFlow(
  {
    name: 'generateResumeFromProfileFlow',
    inputSchema: GenerateResumeFromProfileInputSchema,
    outputSchema: GenerateResumeFromProfileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
