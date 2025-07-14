const {Router}=require("express");
const router=Router();
const Vehicle=require("../models/vehicle");
const Service=require("../models/service");

const calculateNextServiceDate = (serviceType, serviceDate) => {
    let nextServiceDate;

    // Define intervals for different service types
    const serviceIntervals = {
        'oil change': 6 * 30 * 24 * 60 * 60 * 1000, // 6 months in milliseconds
        'tire rotation': 12 * 30 * 24 * 60 * 60 * 1000, // 12 months in milliseconds
        'brake repair': 18 * 30 * 24 * 60 * 60 * 1000, // 18 months in milliseconds
        'engine check': 12 * 30 * 24 * 60 * 60 * 1000, // 12 months in milliseconds
        'other': 6 * 30 * 24 * 60 * 60 * 1000 // Default to 6 months
    };

    // Get interval for the service type
    const interval = serviceIntervals[serviceType] || serviceIntervals['other'];

    // Calculate next service date
    nextServiceDate = new Date(serviceDate.getTime() + interval);

    return nextServiceDate;
};





router.get("/",(req,res)=>{
    res.render("service",{
        user:req.user
    });
})
router.get('/book', async (req, res) => {
    try{
        const user=req.user;
        const vehicles = await Vehicle.find({ owner: req.user._id }); // Fetch vehicles owned by the user
    res.render('bookService', { vehicles,
        user: req.user
     });  // Pass vehicles to the view
    }catch(error ){
        return res.redirect("/user/signin");
    }
   
});

// Route to get all services for the logged-in user (userId fetched from cookies)
router.get('/services', async (req, res) => {
    try {
        // Get userId from cookies
        const user = req.user;

        if (!user) {
            return res.redirect("/user/signin");
        }

        // Find all vehicles belonging to the user
        const vehicles = await Vehicle.find({ owner: req.user._id });

        if (!vehicles.length) {
            return res.render('allServices', { services: [], message: 'No vehicles registered.', user:req.user });
        }

        // Fetch all services related to the user's vehicles
        const services = await Service.find({ vehicle: { $in: vehicles } })
                                      .populate('vehicle') // Optional: Populate vehicle details
                                      .exec();

        // Render the services to the view (EJS template rendering)
        res.render('allServices', { services ,user:req.user});

    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).send('An error occurred while fetching services.');
    }
});

router.get("/serviceHistory", async (req, res) => {
    if (!req.user) {
        return res.redirect("/user/signin");
    }

    try {
        // Get the user's vehicles
        const vehicles = await Vehicle.find({ owner: req.user._id });

        if (!vehicles || vehicles.length === 0) {
            return res.render("serviceHistory", { message: "No registered vehicles", user: req.user });
        }

        // Get the IDs of the user's vehicles
        const vehicleIds = vehicles.map(vehicle => vehicle._id);

        // Fetch completed services for the user's vehicles only
        const completedServices = await Service.find({ 
            vehicle: { $in: vehicleIds }, 
            isCompleted: true 
        }).populate('vehicle');

        // Render the service history with only the user's services
        res.render('serviceHistory', { services: completedServices, user: req.user });
    } catch (error) {
        console.error("Error fetching completed services:", error);
        res.status(500).json({ error: "Failed to fetch completed services. Please try again." });
    }
});


router.post('/book', async (req, res) => {
    try {
        // Get userId from cookies
        const user = req.user;

        if (!user) {
            return res.status(400).send('User not logged in.');
        }
        const { vehicleId, serviceType, description, mileage, serviceDate, cost } = req.body;
         const serviceDateObj = new Date(serviceDate);
         let nextServiceDate=calculateNextServiceDate(serviceType,serviceDateObj);
         const service = await Service.create({
            vehicle: vehicleId,
            serviceType,
            description,
            mileage,
            serviceDate,
            nextServiceDue: [{
                serviceType: serviceType,
                dueDate: nextServiceDate,
            }],
            cost,
        })
          // Update the vehicle's service history
          await Vehicle.findByIdAndUpdate(
            vehicleId,
            { 
              $push: { serviceHistory: service._id }, // Add the service ID to serviceHistory array
              $set: { mileage: mileage }       // Update the vehicle's mileage
            },
            { new: true }
          );
          

        res.render("service",{user:req.user}) // Respond with the created service
    }
    catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).send('An error occurred while fetching services.');
    }

});

router.post('/services/setReminder', async (req, res) => {
    const { serviceId, reminderDate } = req.body;

    try {
        // Update the service with the reminder date
        const service = await Service.findByIdAndUpdate(serviceId, {
            $set: { reminderDate: new Date(reminderDate) }
        }, { new: true });

        // Fetch the updated list of services to render the page
        const services = await Service.find({isCompleted:false}).populate('vehicle');
        
        res.render('allServices', { services, user: req.user }); // Re-render with updated data
    } catch (error) {
        console.error('Error setting reminder:', error);
        res.status(500).json({ error: 'Failed to set reminder. Please try again.' });
    }
});

router.post("/services/isDone" ,async(req,res)=>{
    const {serviceId}=req.body;
    
    try{
        
        const service=await Service.findByIdAndUpdate(serviceId,{$set:{isCompleted:true}}, {new:true});
        const services = await Service.find({isCompleted:false}).populate('vehicle');
        res.render("allServices", {
            services,   // Pass the updated list of services to the view
            user: req.user // Pass user information
        });
        
    }catch(error){
        console.error("Error marking service as done:", error);
        res.status(500).json({ error: "Failed to mark service as done. Please try again." });
    }

})

module.exports=router;