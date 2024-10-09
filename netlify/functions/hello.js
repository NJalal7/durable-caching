// hello there!
// 
// I'm a serverless function that you can deploy as part of your site.
// I'll get deployed to AWS Lambda, but you don't need to know that. 
// You can develop and deploy serverless functions right here as part
// of your site. Netlify Functions will handle the rest for you.

async function joke() {
    try {
        const response = await fetch("https://icanhazdadjoke.com/", {
          headers: {
            "Accept": "application/json" // Specify JSON format
          }
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const jokeData = await response.json();
        return jokeData.joke;
      } catch (error) {
        console.error("Failed to fetch joke:", error);
        return "Error: Could not retrieve a joke.";
      }
} 

exports.handler = async event => {
    const subject = await joke();
    return {
        statusCode: 200,
        body: subject,
        headers: {
			'Netlify-CDN-Cache-Control': 'public, durable, max-age=60, stale-while-revalidate=120'
		}
    }
}