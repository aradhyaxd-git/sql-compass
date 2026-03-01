import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI= new GoogleGenerativeAI(process.env.LLM_API_KEY);

export const generateHint= async(questionDescription, userQuery, schemaDetails)=>{
    const model= genAI.getModel('gemini-2.0-flash');

    const prompt= `
    You are an expert SQL tutor helping a student. 
        Assignment Context: ${questionDescription}
        Database Schema: ${schemaDetails}
        Student's Current Query: ${userQuery || "The student hasn't written anything yet."}

        Your task: Provide a helpful hint to guide the student toward the correct SQL query.
        CRITICAL RULES:
        1. DO NOT provide the complete, correct SQL query under any circumstances.
        2. Point out syntax errors or logical flaws in their current query.
        3. Suggest which SQL clauses (e.g., GROUP BY, JOIN, HAVING) they might need to use.
        4. Keep the hint concise, encouraging, and under 3 sentences.
    `;
    try{
        const res= await model.generateContent(prompt);
        return res.response.text();
    }
    catch(error){
        throw new Error("Failed to generate hint from LLM");
    }
};