const mongoose = require('mongoose');
const { Schema } = mongoose;

// Vehicle Schema
const vehicleSchema = new Schema({
    licensePlate: {
        type: String,
        required: true,
        unique: true, // Ensure no duplicate license plates
        trim: true,
    },
    manufacturer: {
        type: String,
        required: true,
        trim: true, // To remove extra spaces
    },
    model: {
        type: String,
        required: true,
        trim: true,
    },
    purchaseYear: {
        type: Number,
        required: true,
        min: 1900, // Ensure valid year
        max: new Date().getFullYear(), // Ensure it’s not a future year
    },
    color: {
        type: String,
        required: true,
        trim: true,
    },
    vin: { // Vehicle Identification Number
        type: String,
        unique: true, // VIN should be unique
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'user', // Reference to the owner (assuming you have a User model)
    },
    serviceHistory: [{
        type: Schema.Types.ObjectId,
        ref: 'service', // Reference to the Service model (if you have one for tracking services)
    }],
    lastServiced: {
        type: Date,
    },
    mileage: {
        type: Number,
        required: true,
        min: 0, // Mileage should not be negative
    },
    registrationDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'sold'],
        default: 'active',
    },
}, { timestamps: true });

// Create the Vehicle model
const Vehicle = mongoose.model('vehicle', vehicleSchema);

module.exports = Vehicle;
