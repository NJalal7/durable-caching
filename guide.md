# Implement Durable Caching on API Responses Using Serverless Functions

Netlify’s Durable Cache is a game-changer for optimizing API performance. With the addition of a `durable` directive in the cache-control header, you can keep your content fresh and responsive without latency.

We’ll demonstrate this using a fun example: serving up random dad jokes. By the end, you’ll know how to implement durable caching on API responses for faster, more efficient content delivery.

## TL;DR
In this guide, you'll learn how to implement durable caching for API responses using serverless functions, enabling efficient content delivery across all edge nodes.

## Framework Support
There is no specific framework (or set of frameworks) for which this guide is intended. You can take the principles and apply them to any framework you choose. 

> Note: Some web frameworks, like [Astro](https://developers.netlify.com/guides/how-to-do-advanced-caching-and-isr-with-astro/) or [Remix](https://developers.netlify.com/guides/how-to-do-isr-and-advanced-caching-with-remix/), give developers full control of caching headers. Other frameworks control some or all caching headers on behalf of developers. Currently, Netlify is working on updating our framework support for Next.js and Nuxt to automatically use the durable cache.

## Requirements
There are two requirements for this guide:

* Use a Netlify Project or get started using a [template](https://github.com/netlify/examples). 
* Use [Netlify Dev](https://docs.netlify.com/cli/local-development/) for a better development experience when working with Netlify Functions.

> Demo!
This guide walks through the general process of implementing durable caching with references to a demo site. If you’d like to see the full code, visit the [demo repository](https://github.com/NJalal7/durable-caching).

## Create Serverless Function 

Who doesn’t love a good dad joke? Let's create a serverless function that serves one on command. The joke response will be cached such that the response for a given `:slug` does not change unless the cache is purged. 

```js
async function joke() {
    const response = await fetch("https://icanhazdadjoke.com/", {
        headers: {
        "Accept": "application/json" 
        }
    });
    const jokeData = await response.json();
    return jokeData.joke;
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
```

The `Netlify-CDN-Cache-Control` header is key to enable to implement durable caching in this example.

> Using the Netlify CLI provides a better development experience by allowing you to to see caching in action in production.

## Durable Caching

Firstly, let’s enable Netlify’s Durable Cache using the `durable` directive. By default, each edge node only stores a local cache and would need to re-invoke the serverless function for each request. Adding the `durable` directive allows Netlify to cache the serverless function's response globally, making it available across all edge nodes.

Next, we’ll optimize for revalidation with the `stale-while-revalidate` directive. This directive allows edge nodes to serve a stale version of the cached content if the cache has expired while revalidating the content in the background. This ensures that your users never experience delays, even if the data might not always be perfectly fresh. You control how much staleness is acceptable.

However, using both `durable` and `stale-while-revalidate` in the `Cache-Control` header could lead to conflicts with browser caching, resulting in multiple revalidation requests. To mitigate this, we’ll use the `Netlify-CDN-Cache-Control` header, which is specifically recognized by CDN providers like Netlify and ignored by browsers. This separation helps to avoid conflicts, particularly if Netlify is used behind another CDN.

Additionally, this CDN-only header is beneficial when deploying new content. While Netlify’s CDN automatically purges old files on deployment, browsers may still use outdated cached versions. To address this, we modify the Cache-Control header to ensure browsers always check for the latest version from the server while Netlify handles the caching and revalidation globally.

This is how we are implementing durable caching in this example:

```js
	headers: {
		'Netlify-CDN-Cache-Control': 'public, durable, max-age=60, stale-while-revalidate=120'
	}
```

Here, the use of `public` allows caching by any user, `durable` caches across edge nodes globally, `max-age` specifies how long (in seconds) the resource should be cached, and `stale-while-revalidate` serves a stale response while refreshing the cache in the background.

## Purge By Cache

When deploying new content, Netlify automatically purges the cache, ensuring users receive the latest version of your API responses. You can also manually purge the cache via the Netlify CLI with:

```bash
netlify deploy --clearCache
```

## Next Steps

Congrats! You’ve created a serverless function that serves up dad jokes and made sure it runs super fast with durable caching. Now you won’t be fetching the same jokes over and over—unless that’s your style (we don’t judge). 

Explore more ways to optimize your serverless functions by diving into the [Netlify docs](https://docs.netlify.com/platform/caching).
