$(document).ready(function () {
    var cities = JSON.parse(localStorage.getItem("cities"));
    cities = cities ? cities : ["Chicago"];
    renderButtons();

    $("#city-submit").on("click", function(event) {
        event.preventDefault();
        var userInput = $("#user-input");
        var city = userInput.val().trim();
        if (city === "") {
            return;
        }
        cities.push(city);
        if (cities.length > 8) {
            cities.shift();
        }
        userInput.val("");
        localStorage.setItem("cities", JSON.stringify(cities));
        localStorage.setItem("selected-city", city);
        renderButtons();
        displayCityInfo();
    });

    var defaultCity = "Chicago"
    displayCityInfo();

    function displayCityInfo() {
        var APIkey = "7e9f27d87eae3a70a91911b51bf6ac08";
        var selectedCity = localStorage.getItem("selected-city");
        selectedCity = selectedCity ? selectedCity : defaultCity;
        var queryURL = "https://api.openweathermap.org/data/2.5/find?q=" + 
            selectedCity + "&units=imperial&appid=" +
            APIkey;

        $.ajax({
            url: queryURL,
            method: "GET"
            })

            .then(function(response) {
                var iconCode = response.list[0].weather[0].icon;
                var iconURL = "https://openweathermap.org/img/w/" + iconCode + ".png";
                $("#city-name").html(response.list[0].name + moment().format(" (M  / D / YYYY) ") + "<img id='today-icon' src=" + iconURL + " alt='Weather icon'>");
                $("#today-temp").html("Temperature: " + response.list[0].main.temp + " &#8457;");
                $("#today-humid").text("Humidity: " + response.list[0].main.humidity + " %");
                $("#today-wind").text("Wind Speed: " + response.list[0].wind.speed + " MPH");
            
                var uvQuery = "https://api.openweathermap.org/data/2.5/onecall?lat=" +
                    response.list[0].coord.lat +
                    "&lon=" + 
                    response.list[0].coord.lon +
                    "&exclude=current,minutely,hourly&units=imperial&appid=" +
                    APIkey;
                
                $.ajax({
                    url: uvQuery,
                    method: "GET"
                })
                    
                    .then(function(response) {
                        $("#today-uv").text(response.daily[0].uvi);

                        if (response.daily[0].uvi < 3) {
                            $("#today-uv").removeClass("mid-uv");
                            $("#today-uv").removeClass("high-uv");
                            $("#today-uv").addClass("low-uv");
                        } else if (response.daily[0].uvi > 7) {
                            $("#today-uv").removeClass("low-uv");
                            $("#today-uv").removeClass("mid-uv");
                            $("#today-uv").addClass("high-uv");
                        } else {
                            $("#today-uv").removeClass("low-uv");
                            $("#today-uv").removeClass("high-uv");
                            $("#today-uv").addClass("mid-uv");
                        }

                        $("#day-display").empty();
                        
                        for (var i = 0; i < 5; i++) {
                            var futureForcast = $("<div>");
                            futureForcast.addClass("future-forcast");
                            var date = $("<h3>");
                            date.addClass("date");
                            var today = moment();
                            var tomorrow = today.add((i+1), 'days');
                            date.text(moment(tomorrow).format("M/D/YYYY"));
                            
                            var futureIconCode = response.daily[i+1].weather[0].icon;
                            var futureIconURL = "https://openweathermap.org/img/w/" + futureIconCode + ".png";
                            var forcastIcon = $("<img>");
                            forcastIcon.addClass("weather-icon");
                            forcastIcon.attr("src", futureIconURL);
                            forcastIcon.attr("alt", "weather icon");

                            var temp = $("<p>");
                            temp.addClass("temp");
                            temp.html("Temp: " + response.daily[i+1].temp.day + " &#8457;");

                            var humidity = $("<p>");
                            humidity.addClass("humidity");
                            humidity.text("Humidity: " + response.daily[i+1].humidity);
                            futureForcast.append(date, forcastIcon, temp, humidity);
                            $("#day-display").append(futureForcast);
                        }
                    });
            });
    }
   
    function renderButtons() {
        $(".saved-cities").empty();
        for (var i = 0; i < cities.length; i++) {
            var cityButton = $("<button>");
            cityButton.addClass("city-button");
            cityButton.attr("data-name", cities[i]);
            cityButton.attr("value", i);
            cityButton.text(cities[i]);
            $(".saved-cities").prepend(cityButton);
        }
    }

    $(document).on("click", ".city-button", function() {
        localStorage.setItem("selected-city", ($(this).attr("data-name")));
        displayCityInfo();
    });
});