const osrmTextInstructions = require('osrm-text-instructions')('v5');
const axios = require('axios');

async function getInstructions() {
    const start_longlat = "-91.5538787841797,36.52919379243747";
    const end_longlat = "-91.4934539794922,36.53634125776826";

    const openstreetmap_url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${start_longlat};${end_longlat}?overview=full&alternatives=false&steps=true`;

    const response = await axios.get(openstreetmap_url);
    const route = response.data;

    // Get the distance and time of the route
    const distance = (route.routes[0].distance / 1609.34).toFixed(2);
    const time = Math.ceil(route.routes[0].duration / 60);

    console.log(`Distance: ${distance} miles`);
    console.log(`Time: ${time} minutes`);

    const legs = route.routes[0].legs;

    legs.forEach(function(leg) {
        leg.steps.forEach(function(step) {
            const distance = (step.distance / 1609.34).toFixed(2);
            const instruction = osrmTextInstructions.compile('en', step)
            console.log(`(${distance} miles): ${instruction}`)
        });
    });
}

getInstructions().then(instructions => {
    console.log("done");
}).catch(error => {
    console.error(error);
});

module.exports = {
    getInstructions
}