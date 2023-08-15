const vscode = require("vscode");

// Import chatgpt
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const getCodeExplanation = async (code) => {
  let infoMessage = vscode.window.showInformationMessage(
    `Waiting for Explanation...`
  );
  // Ask Chatgpt
  const explanation = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that explains code.",
      },
      {
        role: "user",
        content: `${code}`,
      },
    ],
    temperature: 0.8,
  });

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
  panel.webview.html = `<pre>${code}</pre>`;

  panel.onDidDispose(() => {
    panel.dispose();
  });
};

module.exports = {
  getCodeExplanation,
  showCodeExplanation,
};
