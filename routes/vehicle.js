const {Router}=require("express");
const Vehicle = require("../models/vehicle");
const router=Router();

router.get("/",(req,res)=>{
    
    res.render("vehicle",{user:req.user});
})

router.get("/vehicles", async (req, res) => {
    try {
        // Get userId from cookies
        const user = req.user;

        if (!user) {
            return res.redirect("/user/signin");
        }

        // Find all vehicles belonging to the user
        const vehicles = await Vehicle.find({ owner: req.user._id });

        if (!vehicles.length) {
            return res.render('allVehicles', { vehicles:vehicles, message: 'No vehicles registered.', user:req.user });
        }

    
        
        // Render the services to the view (EJS template rendering)
        res.render('allVehicles', { vehicles ,user:req.user});

    } catch (error) {
        console.error('Error fetching vehicls:', error);
        res.status(500).send('An error occurred while fetching services.');
    }
});

router.get("/vehicles/:id",async(req,res)=>{
    const vehicleId=req.params.id;
    try{
        const vehicle=await Vehicle.findById(vehicleId);
        if(!vehicle){
            return res.status(404).send('Vehicle not found.');
        }
        res.render("vehicleInfo",{vehicle,user:req.user});
        }catch(error){
            console.error('Error fetching vehicle:', error);
            res.status(500).send('An error occurred while fetching vehicle.');
        }
});
router.get("/addVehicle",(req,res)=>{
    if(!req.user)
    {
        return res.redirect("/user/signin");
    }
    res.render("addVehicle",{user:req.user});
})



router.post("/addVehicle", async (req, res) => {
    const {
        licensePlate,
        vin,
        manufacturer,
        model,
        purchaseYear,
        color,
        mileage,
        registrationDate,
        lastServiced
    } = req.body;

    // Check if all required fields are provided
    if (!licensePlate || !vin || !manufacturer || !model || !purchaseYear || !color || !mileage || !registrationDate) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const vehicle = await Vehicle.create({
            licensePlate,
            vin,
            manufacturer,
            model,
            purchaseYear,
            color,
            mileage,
            registrationDate,
            lastServiced,
            owner: req.user ? req.user._id : null, // Set owner to null if user is not authenticated
        });

        // return res.status(201).json(vehicle); // Respond with the created vehicle
        return res.render("vehicle",{user:req.user});
    } catch (error) {
        return res.status(500).json({ error: "Failed to add vehicle. Please try again." });
    }
});



module.exports=router;