import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['Easy', 'Medium', 'Hard']
    },
    description: {
        type: String,
        required: true
    },
    schemaDetails: {
        type: String, 
        required: true 
    }
}, {
    timestamps: true
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;