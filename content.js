let intervalId = null;
let loopCount = 0;

let requestCount = 0;
let imageSearches = 0;
let submitClick = 0;


let intervalBetween = 3000;


function getAuthToken() {
  return new Promise((resolve, reject) => {
      chrome.storage.local.get('authToken', function(result) {
          if (chrome.runtime.lastError) {
              return reject(chrome.runtime.lastError);
          }
          resolve(result.authToken);
      });
  });
}
// hello sina from july 5th. if you are reading this, please continue fixing the function abov
// to get thee auth token asynchronly because anything else will just return a promise
// i hope you get that mclaren or gt3rs soon

// sina from july 6th speaking
// will work on it now
// thanks.

let globalAuthToken = null;

function updateAuthToken() {
    getAuthToken().then(token => {
        globalAuthToken = token;
        console.log("Auth token updated globally:", globalAuthToken);
    }).catch(error => {
        console.error("Error updating global auth token:", error);
    });
}

// Call updateAuthToken at app start or when needed
updateAuthToken();







let apiUrl = "https://examripper-288287396080.herokuapp.com/api/ask";

function findMatchingLabel(form, matchText) {
  const labels = form.querySelectorAll("label");
  const matchedLabel = Array.from(labels).find((label) => {
    const span = label.querySelector("span");
    return span && span.textContent.toLowerCase() === matchText.toLowerCase();
  });

  if (matchedLabel) {
    console.log("Matched Label:", matchedLabel.textContent);
  } else {
    console.log("No matching label found.");
  }
}

function processYellowBorder(form, matchText) {
  console.log("Processing Yellow Border");
  const elements = form.querySelectorAll(".ng-star-inserted, .sia-choice-letter");
elements.forEach((element) => {
  console.log(matchText)
  console.log(element)
    if (element.innerText.includes(matchText)) {
      console.log("Matched Span:");
      console.log(element);
      const parentDiv = element.closest("label");
      console.log(parentDiv)
      if (parentDiv) {
        console.log("Immediate Parent Div:");
        console.log(parentDiv);
        const firstRadio = parentDiv.querySelector('input[type="radio"]');
        console.log("First Radio Button:", firstRadio);
        if (firstRadio) {
          firstRadio.click();
          console.log(`Clicked radio button: ${firstRadio.name}`);
          setTimeout(() => {
            printAndClickSubmitButton(form);
          }, intervalBetween);
        }
      }
    } else {
      console.log("No matching span found.");
    }
  });
}

function sendFormData(form) {
  const images = form.querySelectorAll("img");
  const svgs = form.querySelectorAll("svg");
  if (images.length > 0 || svgs.length > 0) {
    apiUrl = "https://examripper-288287396080.herokuapp.com/imageDetermine";
    html2canvas(form, {
      useCORS: true,
      allowTaint: false,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      console.log(imgData)
      const data = {
        authToken: globalAuthToken,
        imgdata: imgData,
      };
      fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Sent request for the ", requestCount++, "th time");
          if (data.response) {
            processYellowBorder(form, data.response);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  } else {
    apiUrl = "https://examripper-288287396080.herokuapp.com/api/ask";
    const textContent = form.textContent.trim();
    const data = {
      text: textContent,
      authToken: globalAuthToken
    };
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Sent request for the ", requestCount++, "th time");
        if (data.response) {
          findMatchingLabel(form, data.response);
          processYellowBorder(form, data.response);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

function printAndClickSubmitButton(form) {
  const buttons = form.querySelectorAll("button");
  console.log("Submitting buttons for the", submitClick++, "th time")
  buttons.forEach((button) => {
    if (
      button.querySelector("span") &&
      button.querySelector("span").textContent.toUpperCase().includes("SUBMIT")
    ) {
      console.log(
        `Found and clicked Submit Button: ${
          button.querySelector("span").textContent
        }`
      );
      button.click();
      setTimeout(() => {
        checkForNextButton(form);
      }, 1800);
    }
  });
}

function checkForNextButton(form) {
  // Use querySelectorAll to consider all buttons within the form
  const buttons = form.querySelectorAll("button");
  let nextButtonFound = false;
  console.log(`Found ${buttons.length} button(s) in the form.`);
  console.log(buttons)

  buttons.forEach(button => {
    console.log(button)
    // Check if the button's text includes "NEXT"
    if (button.textContent.toUpperCase().includes("NEXT")) {
      console.log("Next Button found:", button.textContent);
      setTimeout(button.click(), intervalBetween)
      console.log("Clicked Next Button:", button.textContent);
      nextButtonFound = true;
    } else if (button.textContent.toUpperCase().includes("VIEW")) {
      clearInterval(intervalId);
    }
  });

  if (!nextButtonFound) {
    console.log("No Next Button found.");
  }
}

function printImagesInForm(form) {
  const images = form.querySelectorAll("img");
  console.log("Image Search Count:", imageSearches++);
  console.log(`Found ${images.length} image(s) in the form.`);
  images.forEach((img, index) => {
    console.log(`Image ${index + 1}: SRC=${img.src}, ALT=${img.alt}`);
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

  console.log("Received Message:", request);
  if (request.action === "startHighlighting") {
    loopCount = 0;
    imageSearches = 0;
    requestCount = 0; 

    
    console.log("starting");
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      
      
      intervalBetween = request.interval;
      document.querySelectorAll("form").forEach((form) => {
        console.log("loops ", loopCount);
        console.log("intervalID ", intervalId)
        const hasQuestionText = Array.from(form.querySelectorAll("*")).some(
          (el) => {
            return (
              el.textContent.includes("Question") &&
              el.textContent.includes("of")
            );
          }
        );
        if (hasQuestionText) {
          // check if there is an input in the form with the placeholder as "Answer here" if there is refresh the page
          const answerInput = form.querySelector('input[data-placeholder="Answer here"]');
          if (answerInput) {
            console.log("Answer input found. Refreshing page.");
            location.reload();
          }
          // check if form.innerHTML.includes("drag-source") if its true refresh the page
          if (form.innerHTML.includes("drag-source")) {
            console.log("Drag source found. Refreshing page.");
            location.reload();
          }
          

          

          const newColor =
            form.dataset.color === "2px solid red" ? "blue" : "red";
          form.dataset.color = `2px solid ${newColor}`;
          printImagesInForm(form);

          if (newColor === "blue") {
            sendFormData(form);
          }
        }
      });
      loopCount++;
    }, intervalBetween);
  } else if (request.action === "stopHighlighting") {
    clearInterval(intervalId);
    document.querySelectorAll("form").forEach((form) => {
      form.style.border = "";
    });
  }
});
