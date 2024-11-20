chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "grabText") {
    const textContent = document.body.innerText;
    chrome.runtime.sendMessage({ action: "textGrabbed", text: textContent });
  }
});
