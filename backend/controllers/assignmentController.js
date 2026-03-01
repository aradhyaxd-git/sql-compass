import Assignment from "../models/Assignment.js";

export const getAllAssignments= async(req,res)=>{
    try{
        const assignments= await Assignment.find({}).select('title difficulty description');
        res.status(200).json({success:true, data:assignments});
    }
    catch(error){
        res.status(500).json({success:false, message:error.message});
    }
};

export const getAssignmentById= async(req,res)=>{
    try{
        const {id}= req.params;
        const assignment= await Assignment.findById(id);

        if(!assignment){
            return res.status(404).json({success:false, message:'Assignment not found'});
        }
        res.status(200).json({success:true, data:assignment});
    }
    catch(error){
        res.status(500).json({success:false, message:error.message});
    }
};
    