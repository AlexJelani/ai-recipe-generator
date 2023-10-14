import { Configuration, OpenAIApi } from 'openai';
import svgImage from './src/assets/loading.svg'
// import loading from "./src/assets/loading.svg?url"
// If you intend to use the URL of that asset, use /assets/loading.svg?url.

// Check if the browser is Chrome (Chrome has a window.chrome object)
const isChrome = 'chrome' in window;

// Check if the browser is Microsoft Edge
const isEdge = navigator.userAgent.includes("Edg");

// Select the footer element
const footer = document.querySelector("footer");

// If the browser is Chrome, add the specific CSS properties
if (isChrome) {
  footer.style.position = "fixed";
  footer.style.bottom = "0";
  footer.style.width = "100%";
  // Add any additional styles specific to Chrome here
} else {
  // For other browsers, keep the existing CSS styles
  footer.style.backgroundColor = "var(--dark)";
  footer.style.color = "var(--light)";
  footer.style.padding = ".8em";
  footer.style.fontSize = ".7em";
  footer.style.textAlign = "center";
}

// If the browser is IE, add specific styles for section
if (isEdge) {
  const section = document.querySelector("section");
  section.style.margin = "170px auto";
  section.style.backgroundColor = "var(--light)";
  section.style.borderRadius = "var(--border-rad-lg)";
  section.style.padding = ".25em 1em";
  section.style.boxShadow = "0px 1px 18px 3px var(--dark)";
  section.style.maxWidth = "420px";
}



const setupInputContainer = document.getElementById('setup-input-container');
const recipeText = document.getElementById('recipe-text');


const configuration = new Configuration({
  apiKey: import.meta.env.VITE_OPEN_KEY,
});
const openai = new OpenAIApi(configuration);


document.getElementById("send-btn").addEventListener("click", () => {
  const setupTextarea = document.getElementById('setup-textarea');
  if (setupTextarea.value) {
    const userInput = setupTextarea.value;

    // Log the start of the function
    console.log("Send button clicked. User input:", userInput);

    setupInputContainer.innerHTML = `<img src="${svgImage}" class="loading" id="loading" alt="">`;
    recipeText.innerText = `Ok, just wait a second while my digital brain digests that...`;

    // Log the start of fetchBotReply and fetchRecipeTitle
    console.log("Fetching bot reply and recipe title...");

    fetchBotReply(userInput);
    fetchRecipeTitle(userInput);
  }
});


async function fetchBotReply(outline) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    /*
    1. Refactor this prompt to use examples of an outline and an
       enthusiastic response. Be sure to keep the length of your
       examples reasonably short, say 20 words or so.
    */
    prompt: `Generate a short message to enthusiastically say that the ingredient or list of ingredients sounds interesting and that you need some minutes to think about it.
    ###
    outline: Banana.
    message: I'll need to think about that. A recipe with bananas sounds yummy!
     I'll find a yummy recipe that uses bananas for  you in just a moment!
    ###
    outline: Avocado, Lime, and Cilantro.
    message: Avocado, lime, and cilantro? Sounds like a fresh and zesty combination. Let me brainstorm a flavorful recipe for you in just a moment!

    ###
    outline: Spinach and Feta Cheese.
    message: Spinach and feta cheese, a classic duo! I need a moment to think up a savory dish that'll make your taste buds dance.

    ###
    outline: ${outline}
    message: 
    `,
    max_tokens: 60,
  });
  recipeText.innerText = response.data.choices[0].text.trim();
  console.log(response);
}

async function fetchRecipeTitle(ingredients) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate an engaging, delicious recipe title based on the ingredient or ${ingredients}  given by the user.`,
    max_tokens: 25,
  });
  const title = response.data.choices[0].text.trim();
  document.getElementById('recipe-title').innerText = title;
  fetchRecipeDescription(title);
  fetchIngredients(title);

  // Call fetchImagePrompt here with the recipe title
  fetchImagePrompt(title);

}

async function fetchRecipeDescription(title) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate a short description of the recipe from the ${title}. The title is for 
    a recipe which will be quick and simple to make`,
    max_tokens: 60,
    temperature: 0.7,
  });
  document.getElementById('recipe-description').innerText = response.data.choices[0].text.trim();
}

async function fetchIngredients(title) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Based on the ${title} display list of ingredients and the measurements for the recipe. It
    should have 5 to 7 ingredients or less. `,
    max_tokens: 80,
  });

  const ingredients = response.data.choices[0].text.trim();
  console.log(response);
  document.getElementById('recipe-ingredients').innerText = ingredients;
  fetchRecipe(ingredients); // Call fetchRecipe here to display instructions
}

async function fetchRecipe(ingredients) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Based on the ingredients: ${ingredients} show instructions for a very quick and simple recipe.`,
    max_tokens: 250,
  });

  const recipe = response.data.choices[0].text.trim();
  document.getElementById('recipe-instructions').innerText = recipe;
  console.log(response);
}

async function fetchImagePrompt(title){
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Give a short description of an image based on the ${title}. 
    The description should be rich in visual detail but contain no names`,
      temperature:0.7,
    max_tokens:100
  })
  fetchImageUrl(response.data.choices[0].text.trim())
}

async function fetchImageUrl(imagePrompt){
  const response = await openai.createImage({
    prompt: `${imagePrompt}There should be no text in this image.`,
    n:1,
    size: '256x256',
    response_format:"url"
  })
  document.getElementById('output-img-container').innerHTML = `<img src="${response.data.data[0].url}" alt="">`
  setupInputContainer.innerHTML = `<button id="view-pitch-btn" class="view-pitch-btn">View Recipe</button>`
  document.getElementById('view-pitch-btn').addEventListener('click', ()=>{
    document.getElementById('setup-container').style.display = 'none'
    document.getElementById('output-container').style.display = 'flex'
    recipeText.innerText = `Here's a delicious recipe for you! Enjoy!`
  })
}
