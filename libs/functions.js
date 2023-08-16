const vscode = require("vscode");

// Import chatgpt
const { Configuration, OpenAIApi } = require("openai");

// Obtain the api key from the user
const config = vscode.workspace.getConfiguration("code-explainer");
const apiKey = config.get("apiKey");

const configuration = new Configuration({
  apiKey: apiKey,
});

const openai = new OpenAIApi(configuration);

const getCodeExplanation = async (code) => {
  if (!apiKey) {
    vscode.window.showErrorMessage(
      "Please set your OpenAI API key in the extension settings."
    );
    return;
  }
  if (!code) {
    return "Please select the code you want to Explain";
  }
  vscode.window.showInformationMessage(`Waiting for Explanation...`);
  // Ask Chatgpt
  const explanation = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that explains code and gives suggestions.",
      },
      {
        role: "user",
        content: `${code}`,
      },
    ],
    temperature: 0.8,
  });

  vscode.window.showInformationMessage("Explanation Ready!");

  return explanation.data.choices[0].message.content;
};

const showCodeExplanation = (code) => {
  vscode.window.showInformationMessage("Waiting for explanation...");
  let panel = vscode.window.createWebviewPanel(
    "codeExplanation", // Id
    "Code Explanation", // Title
    vscode.ViewColumn.One, // Column
    {} // Options
  );
  panel.webview.html = `
  <div id="outer-div">${code}</div>
  <style>
    #outer-div {
      font-size: 1.5em;
      padding: 1em;
      word-wrap:break-word;
    }
  `;

  panel.onDidDispose(() => {
    panel.dispose();
  });
};

module.exports = {
  getCodeExplanation,
  showCodeExplanation,
};
