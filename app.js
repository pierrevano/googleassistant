// Define required packages
const express = require("express")
const bodyParser = require("body-parser")
const qs = require("qs")
const axios = require("axios")
const {
    actionssdk,
    SimpleResponse
} = require("actions-on-google")

// Create app instance
const app = actionssdk()

// Define MAIN intent to start a conversation
app.intent("actions.intent.MAIN", conv => {
    conv.ask("Bienvenue sur PROJECT_NAME");

    // Define body data
    const data = {
        "XXX": XXX
    };

    // Send POST request
    const options = {
        method: "POST",
        headers: {
            "accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            "charset": "utf-8"
        },
        data: qs.stringify(data),
        url: endpoint
    };

    return axios(options)
        .then(function(response) {
            // Get contextId key from response
            const b64string = response.data.values.contextId;
            // Decode contextId response and save it as conversation data
            conv.data.contextId = (Buffer.from(b64string, "base64")).toString("utf8");
        })
        .catch(function(error) {
            console.log(error);
        })
});

// Define TEXT intent to get user inputs
app.intent("actions.intent.TEXT", (conv, input) => {
    // Define body data with contextId
    const contextId = conv.data.contextId,
        data = {
            "userInput": input,
            "XXX": XXX
        };

    // Send POST request
    const options = {
        method: "POST",
        headers: {
            "accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            "charset": "utf-8"
        },
        data: qs.stringify(data),
        url: endpoint
    };

    return axios(options)
        .then(function(response) {
            // Get text key from response
            const b64string = response.data.values.text;
            // Decode response and remove html tags
            const answer = (Buffer.from(b64string, "base64")).toString("utf8")
                .replace(/:<hr class=\"split\">/g, ": ")
                .replace(/<br\/>|<hr class=\"split\">/g, ". ")
                .replace(/<[^>]*>/g, "");
            return answer;
        })
        .then(function(answer) {
            // Send answer to Google Assistant
            conv.ask(answer);
        })
        .catch(function(error) {
            console.log(error);
        })
});

// Define NO_INPUT intent when the Assistant doesn't receive any input from the user
app.intent("actions.intent.NO_INPUT", (conv) => {
    const repromptCount = parseInt(conv.arguments.get("REPROMPT_COUNT"));
    if (repromptCount === 0) {
        conv.ask("Que voulez-vous dire ?");
    } else if (repromptCount === 1) {
        conv.ask("Désolé je n'ai toujours pas compris, pouvez-vous répéter ?");
    } else if (conv.arguments.get("IS_FINAL_REPROMPT")) {
        conv.close("OK, réessayons plus tard.");
    }
});

// Define CANCEL intent to end a conversation
app.intent("actions.intent.CANCEL", (conv) => {
    conv.close("OK, à bientôt !");
});

// Start Express for Heroku deployment
const expressApp = express().use(bodyParser.json())
expressApp.post("/fulfillment", app)
expressApp.listen(process.env.PORT || 5000)