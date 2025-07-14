const mongoose = require('mongoose');
const { Schema } = mongoose;

// Service Schema
const serviceSchema = new Schema({
    vehicle: {
        type: Schema.Types.ObjectId,    // Refers to the Vehicle model
        ref: 'vehicle',                 // Links this service to a specific vehicle
        required: true,
    },
    serviceType: {
        type: String,
        required: true,                 // Type of service, e.g., oil change, tire rotation
        enum: ['oil change', 'tire rotation', 'brake repair', 'engine check', 'other'],  // List of predefined service types
    },
    serviceDate: {
        type: Date,
        required: true,                 // Date when the service was performed
        default: Date.now,              // Defaults to the current date if not provided
    },
    description: {
        type: String,
        required: true,                 // Description of what was done during the service
    },
    mileage: {
        type: Number,
        required: true,                 // Vehicle's mileage at the time of service
        min: 0,                         // Mileage cannot be negative
    },
    nextServiceDue: [{
        serviceType: {
            type: String,
            enum: ['oil change', 'tire rotation', 'brake repair', 'engine check', 'other'],  // Service type for which next due is set
            required: true,
        },
        dueDate: {
            type: Date,                 // Date when the next service is due for this specific type
            required: true,
        }
    }],
    cost: {
        type: Number,                   // The cost of the service
        required: true,
        min: 0,                         // The cost should not be negative
    },
    isCompleted: {
        type: Boolean,
        default: false, // Set to false by default
    },
    reminderDate:{
        type: Date,
    }                   // Date when a reminder should be sent for the next service
}, { timestamps: true });               // Automatically adds 'createdAt' and 'updatedAt' timestamps

// Create the Service model
const Service = mongoose.model('service', serviceSchema);

module.exports = Service;
