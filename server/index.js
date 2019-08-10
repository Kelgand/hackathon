/* eslint no-console: "off" */
const server = require('./server');
const request = require("request");
const testDogs = require("./../src/testDogs.js");

const PORT = process.env.PORT || 3000;

const clientID = "7MLsnrrSQhP1d6aA1NiSzz5HEmeK641Oqn4ExxJwr7tBBMAk8q";
const clientSecret = "RcXJvECjXRN7j7GMa6Jj8UmSFAH37JXvxfKohuSM";
let token = "";

const tokenGenerationURL = `https://api.petfinder.com/v2/oauth2/token?grant_type=client_credentials&client_id=${clientID}&client_secret=${clientSecret}`;

function GetToken(){
    request.post({
        headers: {'content-type' : 'application/x-www-form-urlencoded'},
        url:     tokenGenerationURL,
        body:    `grant_type=client_credentials&client_id=${clientID}&client_secret=${clientSecret}`
      }, function(err, response, body){
        if(err){
          console.log(err);
          setTimeout(GetToken, 1000 * 60);
        } else {
          token = JSON.parse(body).access_token;

          setTimeout(GetToken, JSON.parse(body).expires_in * 995);
        }
      });
}

server.get("/api/get", (req, res) => {
  let url = `https://api.petfinder.com/v2/animals?breed=${req.query.breed}&location=${req.query.location}`;
    request.get({
      headers: {"Authorization": `Bearer ${token}`},
      url: url
    }, (err, response, body) =>{
      if(err){
        res.send(err);
      } else {
        res.send(body);
      }
    })
})

server.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`)
    GetToken();
});
