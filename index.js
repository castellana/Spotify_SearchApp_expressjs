//De la página www.npmjs.com/package/spotify-web-api-node cogemos algunas líneas.
//as soon as possible we have to use: require('dotenv').config()
require('dotenv').config()
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const SpotifyWebApi = require('spotify-web-api-node');

app.use(express.static('public'))
app.set('view engine', 'ejs')

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});
// Retrieve an access token
spotifyApi
.clientCredentialsGrant()
.then(data => spotifyApi.setAccessToken(data.body['access_token']))
.catch(error => console.log('Something went wrong when retrieving an access token', error));


app.get('/', (req, res) => {
    res.render('index')
})

        
app.get('/artist-search', (req, res, next) => {
  // console.log(req)
    // console.log('console: ', req.query.artistInput);
    
    spotifyApi.searchArtists(req.query.artistInput)
    .then(data => {
      // console.log('The received data from the API: ', data.body.artists);
      //res.end()
      const artistResults = data.body.artists.items
      const artistNextPage = data.body.artists.next
      res.render('artist-search-results', {artistResults, artistNextPage }) 
    })
    .catch(err => console.log('The error while searching artists occurred: ', err));

})

// /XYZ.... -> params
// con los dos puntos cogemos todo lo que haya detrás de albums/
app.get('/albums/:artistId/:offset', (req, res) => {
    // console.log(' req.params: ',req.params)
  
  spotifyApi.getArtistAlbums(req.params.artistId, { limit:20, offset: req.params.offset * 20}, )
    .then(data => {
      // console.log('Artist albums :', JSON.stringify(data.body)); Vemos que en data.body.items están los datos que necesitamos
      const albumsResults = data.body.items
    res.render('albums', {albumsResults, site: (req.params.offset *1) + 1 }) 
  }), function(err) {
    console.error(err);
  };
});


app.get('/tracks/:Id', (req, res) => {
  // console.log(' req.params für Tracks: ',req.params)

// Get tracks in an album
  spotifyApi.getAlbumTracks(req.params.Id, { limit : 5, offset : 0 })

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