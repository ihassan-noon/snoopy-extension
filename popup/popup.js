// global variables (will be overwritten)
let selectedForm = null;
let assortmentFormElements = {
  snoopy_category: null,
  snoopy_country: null,
  snoopy_assortment: null,
  snoopy_competitor: null,
};
let othersFormElements = {
  snoopy_others: null,
};

// elements
const formSubmit = document.getElementById("snoopy_submit");
const radioButtons = document.querySelectorAll('input[name="snoopy"]');

// event handlers
const handleInput = (event, selectedForm) => {
  // The form field that triggered the event
  const { name, value } = event.target;

  // assign the variables to the relevant obj
  switch (name) {
    case "snoopy_category":
      assortmentFormElements = {
        ...assortmentFormElements,
        snoopy_category: value,
      };
      break;
    case "snoopy_country":
      assortmentFormElements = {
        ...assortmentFormElements,
        snoopy_country: value,
      };
      break;
    case "snoopy_assortment":
      assortmentFormElements = {
        ...assortmentFormElements,
        snoopy_assortment: value,
      };
      break;
    case "snoopy_competitor":
      assortmentFormElements = {
        ...assortmentFormElements,
        snoopy_competitor: value,
      };
      break;
    case "snoopy_others":
      othersFormElements = {
        ...othersFormElements,
        snoopy_others: value,
      };
      break;

    default:
      break;
  }

  // enable submit button when all the form elements are filled
  if (selectedForm === "assortment") {
    const values = Object.values(assortmentFormElements);
    formSubmit.disabled = values.filter(Boolean).length !== values.length;
  }

  if (selectedForm === "others") {
    const values = Object.values(othersFormElements);
    formSubmit.disabled = values.filter(Boolean).length !== values.length;
  }
};

const handleRadioClick = () => {
  // disable form button on radio change
  formSubmit.disabled = true;
  const formAssortment = document.getElementById("assortment-form");
  const radioAssortment = document.getElementById("assortment-radio");
  const formOthers = document.getElementById("others-form");
  const radioOthers = document.getElementById("others-radio");

  formAssortment.style.display = radioAssortment.checked ? "block" : "none";
  formOthers.style.display = radioOthers.checked ? "block" : "none";
  selectedForm = radioAssortment.checked
    ? "assortment"
    : radioOthers.checked
    ? "others"
    : null;

  const formElement = document.getElementById(
    selectedForm ? `${selectedForm}-form` : null
  );

  if (formElement)
    formElement.addEventListener("input", (event) =>
      handleInput(event, selectedForm)
    );
};

const handleClick = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, async (tabs) => {
    const screenshotUrl = await chrome.tabs.captureVisibleTab();
    const url = tabs[0].url;

    let formObj = null;

    if (selectedForm === "assortment") {
      const values = Object.values(assortmentFormElements);

      if (values.filter(Boolean).length === values.length) {
        formObj = {
          ...assortmentFormElements,
          screenshot: screenshotUrl,
          pageUrl: url,
        };
      }
    }

    if (selectedForm === "others") {
      const values = Object.values(othersFormElements);

      if (values.filter(Boolean).length === values.length) {
        formObj = {
          ...othersFormElements,
          screenshot: screenshotUrl,
          pageUrl: url,
        };
      }
    }

    if (formObj) {
      console.log("formObj", formObj);
    } else {
      console.log("err", formObj);
    }
  });
};

// when the popup HTML has loaded
window.addEventListener("load", () => {
  // register event listeners
  radioButtons.forEach((radio) => {
    radio.addEventListener("click", handleRadioClick);
  });
  formSubmit.addEventListener("click", handleClick);
});
