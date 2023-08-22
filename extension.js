// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
// Import the functions
const {
  getCodeExplanation,
  showCodeExplanation,
  getHoverExplanation,
} = require("./libs/functions");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * This is a cache map to store the data loaded from ChatGPT since flickering of the mouse could break the extension
 */

const explanationCacheMap = new Map();

// Push hover feature only if hover option is turned on in the configuration
const config = vscode.workspace.getConfiguration("code-explainer");
const hover = config.get("hover");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "code-explainer" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "code-explainer.hello-world",
    function () {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage(`Hello World from Code Explainer!`);
    }
  );

  context.subscriptions.push(disposable);

  // Create a sidepanel
  let panelDisposable = vscode.commands.registerCommand(
    "code-explainer.explain",
    async function () {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("The editor is empty or not active");
        return;
      }
      // Get the code inside the editor
      const document = editor.document;
      const selection = editor.selection;
      const text = document.getText(selection);

      try {
        const explanation = await getCodeExplanation(text);
        showCodeExplanation(explanation);
      } catch (err) {
        vscode.window.showErrorMessage("Failed to get code explanation");
        console.error(err);
      }
    }
  );
  context.subscriptions.push(panelDisposable);

  // Give explanation while hovering over a text
  if (hover === true) {
    let hoverDisposable = vscode.languages.registerHoverProvider(
      { scheme: "file", language: "javascript" },
      {
        async provideHover(document, position) {
          const lineText = document.lineAt(position.line).text;
          if (lineText) {
            if (
              explanationCacheMap.has(lineText) &&
              explanationCacheMap.get(lineText) !== null
            ) {
              return Promise.resolve(
                new vscode.Hover(explanationCacheMap.get(lineText))
              );
            }

            if (explanationCacheMap.get(lineText) === null) {
              return new Promise((resolve) => {
                let interval = setInterval(() => {
                  if (
                    explanationCacheMap.has(lineText) &&
                    explanationCacheMap.get(lineText) !== null
                  ) {
                    clearInterval(interval);
                    resolve(
                      new vscode.Hover(explanationCacheMap.get(lineText))
                    );
                  }
                }, 100);
              });
            }

            explanationCacheMap.set(lineText, null);
            try {
              const explanation = await getHoverExplanation(lineText);
              explanationCacheMap.set(lineText, explanation);
              return new vscode.Hover(explanation);
            } catch (err) {
              console.error(err);
              return new vscode.Hover("Failed to get code explanation");
            }
          }
        },
      }
    );

    context.subscriptions.push(hoverDisposable);
  }

  // Input box on the sidebar
  let sideBar = vscode.window.registerWebviewViewProvider("code-explainer", {
    resolveWebviewView: (webviewView) => {
      webviewView.webview.options = {
        enableScripts: true,
      };
      webviewView.webview.html = `
      <div>
        <input id="input" />
        <button id="send-button">Send Message</button>
      </div>
      <script>
        const vscode = acquireVsCodeApi();
        const button = document.getElementById('send-button');
        const input = document.getElementById('input');
        button.addEventListener('click', () => {
          // Send a message to the extension
          vscode.postMessage({ command: 'code', text: input.value });
        });
      </script>
      `;
      webviewView.webview.onDidReceiveMessage(async (data) => {
        console.log(data);
        if (data.command === "code") {
          let explanation = await getCodeExplanation(data.text);
          showCodeExplanation(explanation);
        }
      });
    },
  });
  context.subscriptions.push(sideBar);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
