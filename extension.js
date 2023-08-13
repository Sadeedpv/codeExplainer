// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "code-explainer" is now active with side panel on left!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "code-explainer.hello-world",
    function () {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from Code Explainer!");
    }
  );

  context.subscriptions.push(disposable);

  // Create a sidepanel
  let panelDisposable = vscode.commands.registerCommand(
    "code-explainer.explain",
    function () {
      // Create and show panel
      let panel = undefined;

      if (!panel) {
        panel = vscode.window.createWebviewPanel(
          "codeExplainer", // Identifies the type of the webview. Used internally
          "Code Explainer", // Title of the panel displayed to the user
          vscode.ViewColumn.One, // Editor column to show the new webview panel in.
          { enableScripts: true } // Webview options. More on these later.
        );
        // Load content into the panel
        panel.webview.html = "<h1>Hello from the WebView Panel!</h1>";

        // Undispose the panel
        panel.onDidDispose(() => {
          panel = undefined;
        });
      }
    }
  );
	context.subscriptions.push(panelDisposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
