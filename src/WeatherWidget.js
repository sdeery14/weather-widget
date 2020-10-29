// WEATHER WIDGET Component by Sean Deery
//
// This weather widget shows the user the CURRENT WEATHER AND 7 DAY FORECAST, updated at least every 10 minutes.


// Import the useState and useEffect Hooks so we can set state within a function
import React, { useState, useEffect } from 'react';

// Import the React Bootstrap Components used
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';

// Import bootstrap css
import 'bootstrap/dist/css/bootstrap.min.css';


// Import Google Places Autocomplete
import PlacesAutocomplete from 'react-places-autocomplete';
import {
  geocodeByAddress,
  geocodeByPlaceId,
  getLatLng,
} from 'react-places-autocomplete';




// Component Function
function WeatherWidget() {


  // Axios instance for API requests
  const axios = require('axios');



  //
  // This section is for GETTING WEATHER DATA
  //

  // STATE variables for COORDINATES and WEATHER DATA
  const [latLon, setLatLon] = useState({"lat": 42.3601, "lon": -71.0589});
  const [weatherData, setWeatherData] = useState({});

  // EFFECT HOOK runs on mount and update, but only when the coordinates have changed
  useEffect(() => {

    // Asynchronously gets and sets the weather state
    async function getWeatherData() {
      try {
        const weather_response = await axios.get('https://api.openweathermap.org/data/2.5/onecall?lat='+latLon.lat+'&lon='+latLon.lon+'&units=imperial&appid='+process.env.REACT_APP_WEATHER_API_KEY);
        setWeatherData(weather_response.data);
      } catch (error) {
        console.error(error);
      }
    }

    // Gets the weather
    getWeatherData();

    // Gets the weather again
    const interval = setInterval(() => {
      getWeatherData();
    }, (1000*60*60*10));

    // Stops getting weather once the component is unmounted
    return () => clearInterval(interval);
  }, [latLon, axios]);









  //
  // This section handles GETTING THE CLIENTS LOCATION
  // 

  // STATE variable for the ADDRESS WEATHER IS BASED ON
  const [selectedAddress, setSelectedAddress] = useState("Boston, MA, USA"); // default Boston

  // EFFECT HOOK runs only on mount
  useEffect(() => {

    // Asynchronously gets and sets the client's location, and a city name for the location
    async function setClientLocationAsSelectedLocation() {

      // Checks if geolocation is enabled on the user's browser
      if (navigator.geolocation) {

        // Gets the client's coordinates and sets the state variables
        await navigator.geolocation.getCurrentPosition((position)=> {
          setLatLon({"lat": position.coords.latitude, "lon": position.coords.longitude});
        });

        // Gets an address string from Google based on coordinates to show the user, and sets it as the selected address state variable. 
        // If the request fails, selected address is set to a string of coordinates
        try {
          const address_response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=+'+latLon.lat+','+latLon.lon+'&result_type=locality&result_type=political&key='+process.env.REACT_APP_GOOGLE_API_KEY);
          setSelectedAddress(address_response.data.results[0].formatted_address);
        } catch (error) {
          console.error(error);
          setSelectedAddress("Latitude: " + latLon.lat + " Longitude: " + latLon.lon);
        }

      }

    }

    // Gets the client's location
    setClientLocationAsSelectedLocation();

  // Empty dependency array schedules this Effect Hook to be run only on mount
  }, []);









  //
  // This section handles controlling the ADDRESS SEARCH FIELD
  //

  // STATE VARIABLE for SEARCH ADDRESS INPUT
  const [searchAddress, setSearchAddress] = useState("");

  // Updates the search address state variable on every user input key stroke
  function handleChange(user_provided_address){
    setSearchAddress(user_provided_address);
  }
  
  // Updates the addresses and coordinates when the user selects a new address
  async function handleSelect(user_selected_address) {
    try {
      const results = await geocodeByAddress(user_selected_address);
      const latLng = await getLatLng(results[0]);
      setLatLon({"lat": latLng.lat, "lon": latLng.lng});
      setSelectedAddress(user_selected_address);
      setSearchAddress("");
    } catch(error) {
      console.error(error);
    }
    
  }



  //
  // This section handles FORMATTING DATES
  //

  // Used to format the current date and time like 'Wed 10/28 2:30 PM'
  function unixTimestampToCurrentFormat(unix_timestamp) {
    let date = new Date(unix_timestamp*1000);
    let weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let time = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true});
    if (time[0]==="0") {
      time = time.slice(1);
    }
    return weekdays[date.getDay()] + " " + (date.getMonth()+1) + "/" + date.getDate() + " " + time;
  }

  // Used to format the date like 'Wed 10/28' for the 7 day report
  function unixTimestampToDailyFormat(unix_timestamp) {
    let date = new Date(unix_timestamp*1000);
    let weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return weekdays[date.getDay()] + " " + (date.getMonth()+1) + "/" + date.getDate();
  }


  //
  // Component function RETURN 
  //

  return (
    Object.keys(weatherData).length>0 && 
      <Card className="WeatherWidget" style={{background: '#a8caff'}}>

        <Card.Body>
          <Row>
          {
            // CURRENT WEATHER
          }

            <Col lg="2">

              <Card style={{background: '#a8caff', border:'#a8caff'}}>
                <Card.Img 
                      variant="top" 
                      alt={weatherData.current.weather[0].description} 
                      src={"http://openweathermap.org/img/wn/"+weatherData.current.weather[0].icon+"@2x.png"} />
                <Card.Body>
                  <Card.Title>{unixTimestampToCurrentFormat(weatherData.current.dt)}</Card.Title>
                  <Card.Text>{weatherData.current.temp}° F</Card.Text>
                </Card.Body>
              </Card>
              
            </Col>

            <Col>

            {
              // SELECTED ADDRESS
            }

              <Row>
                <Col>
                  <Card style={{background: '#a8caff', border:'#a8caff'}}>
                    <Card.Body>
                      <Card.Title style={{textAlign:'center'}}>{selectedAddress}</Card.Title>
                    </Card.Body>
                  </Card>
                </Col>

                {
                  // ADDRESS SEARCH FIELD
                }

                <Col>
                  <Card style={{background: '#a8caff', border:'#a8caff'}}>
                    <Card.Body>
                      <PlacesAutocomplete
                        value={searchAddress}
                        onChange={handleChange}
                        onSelect={handleSelect}
                      >
                        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                          <div>
                            <input
                              {...getInputProps({
                                placeholder: 'Search Places ...',
                                className: 'location-search-input',
                              })}
                            />
                            <div className="autocomplete-dropdown-container">
                              {loading && <div>Loading...</div>}
                              {suggestions.map(suggestion => {
                                const className = suggestion.active
                                  ? 'suggestion-item--active'
                                  : 'suggestion-item';
                                // inline style for demonstration purpose
                                const style = suggestion.active
                                  ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                                  : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                return (
                                  <div
                                    {...getSuggestionItemProps(suggestion, {
                                      className,
                                      style,
                                    })}
                                  >
                                    <span>{suggestion.description}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </PlacesAutocomplete>
                      
                    </Card.Body>
                    
                  </Card>
                </Col>
              </Row>

              {
                // 7 DAY FORECAST
              }

              <Row>
                { weatherData.daily.slice(1).map((day_object, index) => {
                  return (
                    <Col key={index}>
                      <Card style={{background: '#a8caff', border:'#a8caff'}}>
                        <Card.Img variant="top" alt={day_object.weather[0].description} src={"http://openweathermap.org/img/wn/"+day_object.weather[0].icon+"@2x.png"} />
                        <Card.Body>
                          <Card.Title>{unixTimestampToDailyFormat(day_object.dt)}</Card.Title>
                          <Card.Text>{day_object.temp.day}°F</Card.Text>
                        </Card.Body>
                      </Card>
                      
                    </Col>
                  );
                })}
              </Row>
              
            </Col>

          </Row>

        </Card.Body>

      </Card>
    
  );
}

export default WeatherWidget;