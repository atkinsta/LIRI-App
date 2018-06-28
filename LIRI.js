require("dotenv").config();
let keys = require("./keys");
let Twitter = require("twitter");
let Spotify = require("node-spotify-api");
let request = require("request");

let client = new Twitter(keys.twitter); //This is a bit sketchy, have to make sure you use the right case for Twitter and Spotify. 
let username = { screen_name: "atkinsta_dev" }; //Used in twitter requests.
let spotify = new Spotify(keys.spotify);

let command = process.argv[2];
let term = "";
let type = "";
if (command === "spotify-this") {               //Allows the user to choose what they would like to "spotify". Track, album, or artist
    if (process.argv[3] === "artist" ||
        process.argv[3] === "album" ||
        process.argv[3] === "track") {
        type = process.argv[3];
        term = process.argv.slice(4).join(" ");
    }
    else {
        type = "track";
        term = process.argv.slice(3).join(" ")
    }
}
else
    term = process.argv.slice(3).join(" ");

switch (command) { //Switch function to determine what function we call and what we return to command line. 
    case "help":
        console.log("\nValid commands: \n\nmy-tweets \nspotify-this [artist OR album OR track] [your search term] \nmovie-this [your search term] \n____________________________");
        break;
    case "my-tweets":
        console.log("\nI will log tweets");
        twitterCall();
        break;
    case "spotify-this":
        console.log("\nI will look up this artist, album, or track.\n");
        spotifyCall(type, term);
        break;
    case "movie-this":
        console.log("\nI will look up this movie\n", term);
        break;
    default:
        console.log("\nInvalid command or search, pass 'help' as an argument to see the available commands.\n")
        break;
};

function twitterCall() {
    client.get("statuses/user_timeline", username, function (error, tweets) {
        if (error) {
            console.log(error);
        }
        else {
            tweets.forEach(tweet => {
                console.log("\n" + tweet.created_at + "\n" + tweet.text) + "\n";
            });
        }
    });
}

function spotifyCall(type, search) {
    if (search === "")
        console.log("Please add a type and search term to your spotify-this. \nIf no type is included, it will default to track");
    else {
        spotify.search({ type: type, query: search }, function (err, data) {
            if (err)
                console.log(err)
            else {
                switch (type){
                    case "artist":
                        var info = data.artists.items[0];                        //Using var here instead of let because info is still in the same block (let is block scope) for every case.
                        console.log("Info for %s \n - - - - - - - - -", search); //var is function scope so its allowed. 
                        console.log("Name: %s \nGenres: %s \nPopularity: %i \nURL: %s\n", 
                                    info.name, info.genres.join(", "), info.popularity, info.external_urls.spotify);
                        break;
                    case "album":
                        var info = data.albums.items[0];
                        console.log("Info for %s \n - - - - - - - - - ", search);
                        console.log("Album Name: %s \nArtist's Name: %s \nReleased: %s \nURL: %s \n",
                                    info.name, info.artists[0].name, info.release_date, info.external_urls.spotify);
                        break;
                    case "track":
                        var info = data.tracks.items[0];
                        console.log("Info for %s \n - - - - - - - - - -", search);
                        console.log("Track Name: %s \nArtist's Name: %s \nAlbum: %s \nTrack Number: %i \nReleased: %s \nURL: %s \n",
                                    info.name, info.artists[0].name, info.album.name, info.track_number, info.album.release_date, info.external_urls.spotify);
                        break;
                }
            }
        });
    }
}