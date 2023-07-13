import Scrappey from "./wrapper/scrappey.js";

const initialize = new Scrappey("API_KEY_HERE");

async function run() {
    //Creates a session, this allows you to send multiple requests with the same browser tab open
    //You can also choose to not create a session for temporary one time requests
    //Setting a session string and proxy is optional, we automatically use our own residential proxies for you
    //This is included in the request price
    const createSession = await initialize.createSession({
        "session": "test",
        //"proxy": "http://username:password@ip:port"
    })

    //The unique session id that is used to identify the request for future use
    // (the browser tab is kept open for 4 minutes)
    const session = createSession.session

    //The fingerprint that is used to identify the session
    //This includes information like the user-agent, screen or language used
    const fingerprint = createSession.fingerprint

    console.log(`Found session ${session}`)

    //Don't know what data to use in the request? Check out our Request Builder
    //https://app.scrappey.com/#/builder
    //It will auotmatically generate the data for you with the input you provided
    const get = await initialize.get({
        session: session,
        url: 'https://httpbin.rs/get'
    })

    //Only successfull requests will take balance from your account
    //This can verified by looking at the solution verified field
    console.log(`Request was successful and took balance: ${get.solution.verified}`)

    //To only get the text from a response use get.solution.innerText
    //To also get all the HTML elements, use get.solution.response
    const responseData = get.solution.response
    console.log(`Found response`, responseData)

    //Sending a POST with a=b&c=b data format
    const post = await initialize.post({
        session: session,
        url: 'https://httpbin.rs/post',
        postData: "test=test&test2=test2",
    })

    //Sending a post with JSON data
    const jsonPost = await initialize.post({
        session: session,
        url: 'https://backend.scrappey.com/api/auth/login',
        customHeaders: {
            //HTTP1 is uppercase headers
            //HTTP2 is lowercase headers
            "content-type": "application/json"
        },
        postData: JSON.stringify({
            email: "testtest@test.nl",
            password: "password",
        })
    })

    //To get the text from a JSON request, use innerText instead of response
    console.log(jsonPost.solution.innerText)

}

run().then((data) => console.log(data)).catch((err) => console.error(err))

/**
 * Looking for more examples? Check out our examples below
 * 
 * Cookiejar example with custom cookies and headers
 * and using AI parse to get data from a website
 * 
 * {
  "cmd": "request.get",
  "url": "https://httpbin.rs/get",
  "customHeaders": {
    "auth": "test"
  },
  "cookiejar": [
    {
      "key": "cookiekey",
      "value": "cookievalue",
      "domain": "httpbin.rs",
      "path": "/"
    }
  ],
  "session": "86908d12-b225-446c-bb16-dc5c283e1d59",
  "autoparse": true,
  "properties": "parse using ai, product name",
  "proxy": "http://proxystring"
}
 *

Post example with cookiejar and custom headers
If you use a session, cookies are kept within the browser, then it's not needed
to add a cookiejar

{
  "cmd": "request.post",
  "url": "https://httpbin.rs/post",
  "postData": "{\"happy\":\"true}",
  "customHeaders": {
    "content-type": "application/json",
    "auth": "test"
  },
  "cookiejar": [
    {
      "key": "cookiekey",
      "value": "cookievalue",
      "domain": "httpbin.rs",
      "path": "/"
    }
  ],
  "session": "86908d12-b225-446c-bb16-dc5c283e1d59",
  "autoparse": true,
  "properties": "parse using ai, product name",
  "proxy": "http://proxystring"
}
 * 
 * 
 */