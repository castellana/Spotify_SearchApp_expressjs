require('dotenv').config()
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});
// Retrieve an access token
spotifyApi
.clientCredentialsGrant()
.then(data => spotifyApi.setAccessToken(data.body['access_token']))
.catch(error => console.log('Something went wrong when retrieving an access token', error));


app.use(express.static('public'))

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded ({extended: false}))

app.get('/', (req, res) => {
    res.render('index')
})


        
app.get('/artist-search', (req, res, next) => {
    // console.log('console: ', req.query.artistInput);
    
    spotifyApi.searchArtists(req.query.artistInput)
    .then(data => {
      // console.log('The received data from the API: ', data.body.artists);
      const artistResults = data.body.artists.items
      res.render('artist-search-results', {artistResults }) 
    })
    .catch(err => console.log('The error while searching artists occurred: ', err));

})


app.get('/albums/:artistId', (req, res, next) => {
    // console.log(' req.params: ',req.params)
  
  spotifyApi.getArtistAlbums(req.params.artistId)
    .then(data => {
      // console.log('Artist albums :', JSON.stringify(data.body)); Vemos que en data.body.items están los datos que necesitamos
      const albumsResults = data.body.items
    res.render('albums', {albumsResults }) 
  }), function(err) {
    console.error(err);
  };
});


app.get('/tracks/:albumId', (req, res, next) => {
  // console.log(' req.params für Tracks: ',req.params)

// Get tracks in an album
  spotifyApi.getAlbumTracks(req.params.albumId, { limit : 5, offset : 1 })

  .then(function(data) {
    // console.log(data.body);
    // console.log('tracks string:', JSON.stringify(data.body.items));
    const tracksResults = data.body.items
    res.render('tracks', {tracksResults})
  }, function(err) {
    console.log('Something went wrong!', err);
  });
});




app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));