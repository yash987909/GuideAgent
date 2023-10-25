function getTransitOptions(origin, destination, departureTime) {
    const encodedOrigin = encodeURIComponent(origin);
    const encodedDestination = encodeURIComponent(destination);
    console.log(encodedOrigin);
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodedOrigin}&destination=${encodedDestination}&mode=transit&departure_time=${departureTime}&key=AIzaSyAA6D24iAsqQzEeXFGk2V16Pz7yDwCWqUI`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const transitOptions = [];
            console.log(data);
            data.routes.forEach(route => {
                route.legs.forEach(leg => {
                    leg.steps.forEach(step => {
                        if (step.travel_mode === 'TRANSIT') {
                            const transitDetails = {
                                agency: step.transit_details.agency_name,
                                route_number: step.transit_details.line.short_name,
                                departure_time: step.transit_details.departure_time.text
                            };
                            transitOptions.push(transitDetails); 
                        }
                    });
                });
            });

            console.log(transitOptions);
        })
        .catch(error => console.error('Error:', error));
}

const origin = "Vasant Nagar, Ognaj, Ahmedabad, Gujarat, India";
const destination = "Silver Oak College Of Engineering And Technology Class Room, Gota, Ahmedabad, Gujarat, India";
const departureTime = "now";

getTransitOptions(origin, destination, departureTime);