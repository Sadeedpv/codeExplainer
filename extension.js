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

const errorMessage =
  "Something went wrong! Please make sure your API key is correct";
const failMessage = "Failed to get code Explanation!";

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
        let explanation = await getCodeExplanation(text);
        if (!explanation) {
          explanation = errorMessage;
        }
        showCodeExplanation(explanation);
      } catch (err) {
        vscode.window.showErrorMessage(failMessage);
        console.error(err);
      }
    }
  );
  context.subscriptions.push(panelDisposable);

  // Give explanation while hovering over a text
  if (hover === true) {
    let hoverDisposable = vscode.languages.registerHoverProvider(
      { scheme: "file", language: "*" },
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
              let explanation = await getHoverExplanation(lineText);
              if (!explanation) {
                explanation = errorMessage;
              }
              explanationCacheMap.set(lineText, explanation);
              return new vscode.Hover(explanation);
            } catch (err) {
              console.error(err);
              return new vscode.Hover(failMessage);
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
        <!DOCTYPE html>
        <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Code Explainer</title>
              <style>
                *{
                  margin:0;
                  padding:0;
                  box-sizing:border-box;
                }
                .outer-div {
                  display:flex;
                  justify-content:center;
                  flex-direction:column;
                  gap: 12px;
                  margin-top:15px;
                  padding:5px;
                }
                #input{
                  box-sizing: border-box;
                  border: none;
                  border-radius: 2px;
                  font-size: 16px;
                  background-color: white;
                  padding:10px;
                  outline:none;
                  background-color:#2e2d2d;
                  resize:none;
                  color:white;
                }
                #send-button{
                  
                    cursor: pointer;
                    outline: 0;
                    color: #fff;
                    background-color: #0857c9;
                    border-color: #0857c9;
                    display: inline-block;
                    font-weight: 400;
                    line-height: 1.2;
                    width:75%;
                    text-align: center;
                    border: 0.6px solid transparent;
                    padding: 7px 5px;
                    font-size: 13px;
                    border-radius: .25rem;
                    transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
                }
                #send-button:hover{
                    color: #fff;
                    background-color: #0b5ed7;
                    border-color: #0a58ca;
                }
                ::placeholder {
                    color: #c4c4c4;
                    opacity: 1; /* Firefox */
                }

                :-ms-input-placeholder { /* Internet Explorer 10-11 */
                color: #c4c4c4;
                }

                ::-ms-input-placeholder { /* Microsoft Edge */
                color: #c4c4c4;
                }
              </style>
              
          </head>
          <body>
            <div class='outer-div'>
              <textarea id="input" placeholder="Enter code" rows="2" cols="20"></textarea>
              <button id="send-button">Get Explanation</button>
            </div>
            <script>
              const vscode = acquireVsCodeApi();
              const button = document.getElementById('send-button');
              const input = document.getElementById('input');
              input.addEventListener('keypress', (event) =>{
                if (event.key === "Enter"){
                  // Send a message to the extension
                  event.preventDefault();
                  vscode.postMessage({ command: 'code', text: input.value });
                }
              })
              button.addEventListener('click', () => {
                // Send a message to the extension
                vscode.postMessage({ command: 'code', text: input.value });
              });
            </script>
          </body>
      `;
      webviewView.webview.onDidReceiveMessage(async (data) => {
        console.log(data);
        if (data.command === "code") {
          try {
            let explanation = await getCodeExplanation(data.text);
            if (!explanation) {
              explanation = errorMessage;
            }
            showCodeExplanation(explanation);            
          } catch (err) {
            console.error(err);
            vscode.window.showErrorMessage(failMessage);
          }
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
