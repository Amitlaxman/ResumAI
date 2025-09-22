

'use server';
/**
 * @fileOverview Generates a resume from profile data and a job description.
 *
 * - generateResumeFromProfile - A function that generates a resume.
 * - GenerateResumeFromProfileInput - The input type for the generateResumeFromProfile function.
 * - GenerateResumeFromProfileOutput - The return type for the generateResumeFrom-profile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { latexTemplate } from '@/lib/latexTemplate';

const GenerateResumeFromProfileInputSchema = z.object({
  profileData: z.string().describe('The user profile data including name, email, phone, and headline.'),
  jobDescription: z.string().describe('The job description for a an open role.'),
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
  prompt: `You are an expert resume writer. Your task is to generate a professional resume in LaTeX format.
You will be provided with a base LaTeX template and the user's profile data and a job description.
Your response should ONLY contain the LaTeX code for the resume, starting with \\documentclass and ending with \\end{document}.

Here is the LaTeX template you MUST use. Pay close attention to the available commands like \\resumeheader, \\resumecontact, \\section, \\entry, \\singlelineentry, \\desc, and \\bullets.

Template:
${latexTemplate}

Now, take the following user profile and job description and generate a complete, tailored resume in LaTeX format.
Make sure to replace the placeholder content in the template with the user's actual information.
The user's contact details (email, phone, website, etc.) should go in the \\resumecontact section.
The user's name should go in the \\resumeheader section.
The user's professional summary, skills, experience, education, and projects should be organized into appropriate sections using the \\section, \\entry, \\singlelineentry, \\desc, and \\bullets commands.

User Profile Data:
{{{profileData}}}

Job Description:
{{{jobDescription}}}

Generate the full LaTeX code for the resume now.
`,
});

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

