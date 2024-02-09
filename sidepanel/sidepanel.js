// global variables (will be overwritten)
let selectedForm = null;
let assortmentFormElements = {
  snoopy_category: null,
  snoopy_country: null,
  snoopy_assortment: null,
  snoopy_competitor: null,
  snoopy_attachment: null,
};
let othersFormElements = {
  snoopy_others: null,
};
let tabUrl = null;

// elements
const formSubmit = document.getElementById("snoopy_submit");
const fileInput = document.getElementById("snoopy_file");
const mainRadioButtons = document.querySelectorAll('input[name="snoopy"]');
const attachmentRadioButtons = document.querySelectorAll(
  'input[name="snoopy_attachment"]'
);
const countryButtons = document.querySelectorAll(
  'input[name="snoopy_country"]'
);

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
    case "snoopy_attachment":
      assortmentFormElements = {
        ...assortmentFormElements,
        snoopy_attachment: value,
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

const handleMainRadioClick = () => {
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

const handleAttachmentRadioClick = () => {
  const fileContainer = document.getElementById("file-container");
  const radioManual = document.getElementById("file-attachment");

  fileContainer.style.display = radioManual.checked ? "flex" : "none";
};

const handleClick = async () => {
  const screenshotUrl = await chrome.tabs.captureVisibleTab();

  let formObj = null;

  if (selectedForm === "assortment") {
    const values = Object.values(assortmentFormElements);

    if (values.filter(Boolean).length === values.length) {
      formObj = {
        ...assortmentFormElements,
        screenshot: screenshotUrl,
        pageUrl: tabUrl,
      };
    }
  }

  if (selectedForm === "others") {
    const values = Object.values(othersFormElements);

    if (values.filter(Boolean).length === values.length) {
      formObj = {
        ...othersFormElements,
        screenshot: screenshotUrl,
        pageUrl: tabUrl,
      };
    }
  }

  if (formObj) {
    console.log("formObj", formObj);
  } else {
    console.log("err", formObj);
  }
};

const handleFile = (e) => {
  let fileName = String(e.target.value).split('\\').pop();
  const label = document.getElementById("snoopy_file_label");

  if (fileName) label.innerHTML = fileName;
};

const getCountry = (url) => {
  const regex = /(?:https?:\/\/([^\/?\s#]+))?\/([^\/?\s#]*)(?:[\?#].*)?/g;
  const matches = regex.exec(url);
  const matchedCountry = matches[2] ?? null;

  if (matchedCountry.includes("uae")) return "AE";
  if (matchedCountry.includes("saudi")) return "SA";
  if (matchedCountry.includes("egypt")) return "EG";
  return null;
};

// when the popup HTML has loaded
window.addEventListener("load", () => {
  // register event listeners
  mainRadioButtons.forEach((radio) => {
    radio.addEventListener("click", handleMainRadioClick);
  });
  attachmentRadioButtons.forEach((radio) => {
    radio.addEventListener("click", handleAttachmentRadioClick);
  });
  formSubmit.addEventListener("click", handleClick);
  fileInput.addEventListener("change", handleFile);

  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    tabUrl = tabs[0].url;

    if (tabUrl) {
      countryButtons.forEach((country) => {
        const defaultCountry = getCountry(tabUrl);
        if (country.getAttribute("value") === defaultCountry)
          country.checked = true;
      });
    }
  });
});
