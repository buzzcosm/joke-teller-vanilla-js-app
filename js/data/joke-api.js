export async function getJoke(lang) {
  let joke = '';
  
  const apiUrl = `https://v2.jokeapi.dev/joke/Any?lang=${lang}`;
  
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data.setup) {
      joke = `${data.setup} ... ${data.delivery}`;
    } else {
      joke = data.joke;
    }
    return joke;
  } catch (error) {
    console.error('Whoops, joke fetch failed!', error);
  }
}