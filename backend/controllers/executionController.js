import { executeUserQuery } from "../services/executionService.js";

export const handleExcecution= async(req,res)=>{
    try{
        const{query}= req.body;
        if(!query){
            return res.status(400).json({success:false, message:'SQL query is required'});
        }
        const data= await executeUserQuery(query);

        res.status(200).json({success:true, data});
    }
    catch(error){
        res.status(400).json({success:false, message:error.message});
    }
};

