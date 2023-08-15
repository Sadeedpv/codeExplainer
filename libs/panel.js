

const panel = `
    <h1>
        What do you want use to explain? Paste it here!!
    </h1>
    <div class="outer-div" >
    <textarea id="text" rows="10" cols="50" name="text" placeholder="Paste your code" ></textarea>
    <button id="submit">Submit</button>
    <div id="result"></div>
    </div>
    <style>
        .outer-div {
            display:flex;
            flex-direction: column;
            justify-content: center;
            align-items:flex-start;
            gap:15px
        }
        #text {
            height: 100%;
            background-color: #444445;
            color: #fff;
            font-size: 20px;
            border: 2px solid blue;
            border-radius: 5px;
            padding: 10px;
        }
        #submit {
            background-color: blue;
            color: #fff;
            padding: 10px 20px 10px 20px;
            margin-top: 20px;
            border-radius: 5px;
            border: none;
            font-size: 20px;
            cursor: pointer;
            transition: background-color 200ms ease-in;
        }
        #submit:hover{
            background-color: #544ce0;
        }
        #result {
            color:white;
            font-size: 20px;z
            margin-top: 20px;
        }
    </style>
    <script>
        // Import chatgpt
        const { Configuration, OpenAIApi } = require("openai");
        require("dotenv").config();

        const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);
        const text = document.getElementById("text");
        const submit = document.getElementById("submit");
        const result = document.getElementById("result");
        submit.addEventListener("click", async () => {
            const response = await openai.createCompletion({
                model: "GPT-3.5",
                prompt: "How are you today?",
                max_tokens:4000
            });
            console.log(response.data.choices[0].text);
        })
    </script>


`;

module.exports = panel;
