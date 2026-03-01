import { generateHint } from '../services/llmService.js';

export const getAssignmentHint = async (req, res) => {
    try {
        const { questionDescription, userQuery, schemaDetails } = req.body;

        if (!questionDescription || !schemaDetails) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing assignment context or schema details for the hint." 
            });
        }

        const hint = await generateHint(questionDescription, userQuery, schemaDetails);
        
        res.status(200).json({ 
            success: true, 
            data: hint 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};