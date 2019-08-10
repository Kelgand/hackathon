import React, { Component } from 'react';

//https://dog.ceo/dog-api/documentation/breed
//https://www.petfinder.com/developers/

const breeds = require("./breeds.js");

class App extends Component {
  constructor(){
    super();
    this.state = {
      dogBreeds: this.FormatBreeds(breeds),
      selectedBreed: null,
      hideContainer: false
    }
    this.clientID = "7MLsnrrSQhP1d6aA1NiSzz5HEmeK641Oqn4ExxJwr7tBBMAk8q";
    this.clientSecret = "RcXJvECjXRN7j7GMa6Jj8UmSFAH37JXvxfKohuSM";

    this.HideDogPictures = this.HideDogPictures.bind(this);
  }

  GetBreeds(){
    fetch('https://dog.ceo/api/breeds/list/all')
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      this.setState({
        breeds: this.FormatBreeds(JSON.stringify(myJson))
      });
    });
  }

  FormatBreeds(breedsObject){
    const breeds = breedsObject.message;
    let parsedBreeds = [];
    Object.keys(breeds).forEach( breed => {
      if(breeds[breed].length === 0){
        parsedBreeds.push(breed);
      } else {
        breeds[breed].map(subbreed => {
          parsedBreeds.push(`${breed}/${subbreed}`)
        })
      }
    })
    return parsedBreeds.sort();
  }

  SelectBreed(){
    this.setState({
      selectedBreed: document.getElementById("selectedBreed").value,
      hideContainer: false
    })
  }

  HideDogPictures(){
    this.setState({
      hideContainer: true
    })
  }
//
  render(){
    return(
      <div className="mainContainer">
        <div className="header">
          <h1>Adoptable Dog Finder</h1>
          <div>
            <DogSelector selectBreed={this.SelectBreed.bind(this)} dogBreeds={this.state.dogBreeds}/>
          </div>
        </div>
        <div>
          <DisplayRandomDogs breed={this.state.selectedBreed} hide={this.state.hideContainer} />
        </div>
        <div>
          <DogFinder breed={this.state.selectedBreed} HideDogPictures={() => {this.HideDogPictures()}} />
        </div>
      </div>
    )
  }
}

class DogSelector extends React.Component{
  render(){
    return (
      <div>
        <select id="selectedBreed" onChange={() => this.props.selectBreed()}>
          <option value={null} >Select a dog breed...</option>
          {
            this.props.dogBreeds.map(breed => {
              return (
                <option key={breed} value={breed}>{breed}</option>
              )
            })
          }
        </select>
      </div>
    )
  }
}

class DisplayRandomDogs extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      images: [],
      loadedBreed: null
    }

    this.GetRandomDogImages = this.GetRandomDogImages.bind(this);
  }

  GetRandomDogImages(breed){
    //return;
    if(!breed || this.state.loadedBreed === breed){
      return;
    } else {
      fetch(`https://dog.ceo/api/breed/${breed}/images/random/3`)
      .then(response => {
        return response.json();
      })
      .then(myJson => {
        console.log("Ran lookup");
        this.setState({
          images: myJson.message,
          loadedBreed: breed
        })
      });
    }
  }

  render(){

    this.GetRandomDogImages(this.props.breed);

    if(this.props.breed){
      return(
        <div>
          <div className={`dogPicturesContainer ${this.props.hide ? "hideContainer" : ""}`}>
            {
              this.state.images.map((image, index) => {
                return <img className="dogPicture" key={index} src={image} />
              })
            }
          </div>
        </div>
      )
    } else {
      return(
        <div className="infoText">
          Select a dog breed from the dropdown above to see some pictures of the breed! Once you find one you like, you can enter your ZIP code to find nearby dogs of that breed that are looking to be adopted.

          <div className="img">
            <img src="/puppy.jpeg" />
          </div>
        </div>
      )
    }
  }
}

class DogFinder extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      dogs: []
    }
  }

  SearchForAdoptableDogs(){
    console.log("Searching");
    this.props.HideDogPictures();
    let breed = this.props.breed.split("/").reverse().join(" ");
    const zipCode = document.getElementById("zipCode").value;
    const http = new XMLHttpRequest();
    const url = `/api/get?breed=${breed}&location=${zipCode}`;

    http.open("GET", url);
    http.send();

    http.onreadystatechange = (e) => {
      if(http.readyState == 4 && http.status === 200)
      this.setState({
        dogs: JSON.parse(http.responseText).animals
      });
    }
  }
  render(){
    if(!this.props.breed){
      return null
    }
    return (
      <div className="dogFinder">
        <p>
          Do you like this breed? Enter your ZIP code and click search to find dogs of this breed up for adoption in nearby animal shelters.
        </p>
        <div className="searchContainer">
          <input type="text" id="zipCode" />
          <button id="searchButton" onClick={() => this.SearchForAdoptableDogs()}>Find a new friend</button>
        </div>
        <div className="dogPanelsContainer">
          {
            this.state.dogs.map(dog => {
              return <DogInfoPanel key={dog.id} dog={dog} />
            })
          }
        </div>
      </div>
    )
  }
}

class DogInfoPanel extends React.Component{
  render(){
		let dog = this.props.dog;
    return (
      <div className="dogPanel">
        <h3>{dog.name}</h3>
        <div className="dogContentContainer">
          <img src={dog.photos[0] ? dog.photos[0].medium : "#"} />
					<div className="dogInfo">
						<span className="bold">Gender:</span> {dog.gender}<br />
						<span className="bold">Breed:</span> {`${dog.breeds.primary}${dog.breeds.secondary ? " / " + dog.breeds.secondary : ""}`}<br />
						<span className="bold">Age:</span> {dog.age}<br />
            <p>
							{dog.description}
						</p>
						<a href={dog.url}>
							<div className="moreInfoLink">
								Get More Info
							</div>
						</a>
					</div>
        </div>
      </div>
    )
  }
}

export default App;
