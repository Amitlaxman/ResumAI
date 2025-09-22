
'use server';
/**
 * @fileOverview A flow that compiles LaTeX content into a PDF file.
 *
 * - generatePdfFromLatex - A function that takes LaTeX and returns PDF data.
 * - GeneratePdfFromLatexInput - The input type for the generatePdfFromLatex function.
 * - GeneratePdfFromLatexOutput - The return type for the generatePdfFromLatex function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GeneratePdfFromLatexInputSchema = z.object({
  latexContent: z.string().describe('The LaTeX content to compile.'),
});
export type GeneratePdfFromLatexInput = z.infer<typeof GeneratePdfFromLatexInputSchema>;

const GeneratePdfFromLatexOutputSchema = z.object({
  pdfDataUri: z.string().describe("A data URI of the generated PDF file. Expected format: 'data:application/pdf;base64,<encoded_data>'."),
});
export type GeneratePdfFromLatexOutput = z.infer<typeof GeneratePdfFromLatexOutputSchema>;


const compileLatexTool = ai.defineTool(
    {
      name: 'compileLatex',
      description: 'Compiles a LaTeX string into a PDF and returns it as a base64 data URI.',
      inputSchema: z.object({ latex: z.string() }),
      outputSchema: z.object({ pdfDataUri: z.string() }),
    },
    async ({ latex }) => {
      try {
        const response = await fetch('https://pdf-compiler.vertex-ai.cloud.goog/compile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latex }),
        });
  
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`PDF compilation failed with status ${response.status}: ${errorBody}`);
        }
  
        const { pdf } = await response.json();
        return { pdfDataUri: `data:application/pdf;base64,${pdf}` };
      } catch (e: any) {
        console.error("Error compiling latex", e.message);
        // Return a valid but empty response
        return { pdfDataUri: '' };
      }
    }
  );
  

const generatePdfFromLatexFlow = ai.defineFlow(
  {
    name: 'generatePdfFromLatexFlow',
    inputSchema: GeneratePdfFromLatexInputSchema,
    outputSchema: GeneratePdfFromLatexOutputSchema,
  },
  async ({ latexContent }) => {
    
    // Instead of forcing a tool, we can just call it directly since that's all this flow does.
    const toolResponse = await compileLatexTool({ latex: latexContent });

    if (!toolResponse.pdfDataUri) {
        throw new Error('PDF generation failed. The compilation tool returned an empty response.');
    }
    
    return { pdfDataUri: toolResponse.pdfDataUri };
  }
);

export async function generatePdfFromLatex(input: GeneratePdfFromLatexInput): Promise<GeneratePdfFromLatexOutput> {
    return generatePdfFromLatexFlow(input);
}
