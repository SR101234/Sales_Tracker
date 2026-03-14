
// import { GoogleGenAI } from "@google/genai";
// import { SIPTransaction, SalesAgent, PerformanceStats } from "../types";

// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// export const analyzePerformance = async (
//   agents: SalesAgent[],
//   transactions: SIPTransaction[],
//   stats: PerformanceStats[]
// ) => {
//   const prompt = `
//     As a senior sales analyst for a Mutual Fund Distribution firm, analyze the following performance data and provide:
//     1. A summary of overall team performance.
//     2. Identification of the top-performing agent.
//     3. Insights on SIP trends (New vs Closed vs Relogins).
//     4. Actionable recommendations to improve conversion and meeting targets.

//     Agents Data: ${JSON.stringify(agents)}
//     Transaction History: ${JSON.stringify(transactions)}
//     Calculated Performance Stats: ${JSON.stringify(stats)}

//     Please provide the response in a structured Markdown format with clear headings.
//   `;

//   try {
//     const response = await ai.models.generateContent({
//       model: 'gemini-3-flash-preview',
//       contents: prompt,
//     });
//     return response.text;
//   } catch (error) {
//     console.error("Gemini Analysis Error:", error);
//     return "Failed to generate AI insights. Please check your API key or connection.";
//   }
// };

// export const fetchSchemesByAMC = async (amcName: string): Promise<string[]> => {
//   const prompt = `Provide a list of the top 10 most popular and current mutual fund schemes offered by ${amcName}. 
//   Return only the names of the schemes, one per line, without any numbering or additional text.`;

//   try {
//     const response = await ai.models.generateContent({
//       model: 'gemini-3-flash-preview',
//       contents: prompt,
//       config: {
//         tools: [{ googleSearch: {} }],
//       },
//     });

//     const text = response.text || "";
//     // Clean up the response to get a clean array of scheme names
//     return text
//       .split('\n')
//       .map(line => line.trim())
//       .filter(line => line.length > 5); // Filter out short/empty lines
//   } catch (error) {
//     console.error("Error fetching schemes:", error);
//     return [];
//   }
// };
