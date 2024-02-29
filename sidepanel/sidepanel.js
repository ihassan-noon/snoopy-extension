// global constants
const LS_KEY = "USER_EMAIL_ID";

// global variables (will be overwritten)
let selectedForm = null;
let assortmentFormElements = {
  snoopy_category: null,
  snoopy_country: null,
  snoopy_assortment: null,
  snoopy_competitor_url: null,
  snoopy_attachment: "none",
};
let othersFormElements = {
  snoopy_others: null,
};
let tabUrl = null;
let fileBlob = null;
let fileName = null;
let fileType = null;

// elements
const emailInput = document.getElementById("snoopy_user_email");
const emailClearBtn = document.getElementById("snoopy_user_email_edit");
const urlInput = document.getElementById("snoopy_competitor_url");
const fileInput = document.getElementById("snoopy_file");
const fileNameLabel = document.getElementById("snoopy_file_name");
const fileLabelContainer = document.getElementById("snoopy_file_container");
const mainRadioButtons = document.querySelectorAll('input[name="snoopy"]');
const attachmentRadioButtons = document.querySelectorAll(
  'input[name="snoopy_attachment"]'
);
const countryButtons = document.querySelectorAll(
  'input[name="snoopy_country"]'
);
const formSubmit = document.getElementById("snoopy_submit");

const validateNoonEmail = (email) => {
  var re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const domain = "@noon.com";
  // first test the email format
  // then proceed to test if it's from the right domain (Second argument is to check that the string ENDS with this domain, and that it doesn't just contain it)
  return (
    re.test(email) && email.indexOf(domain, email.length - domain.length) !== -1
  );
};

const isUrlValid = (userInput) => {
  var regex =
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
  return userInput.match(regex);
};

// form functions
const formValidator = () => {
  const emailVal = emailInput.value;
  const urlVal = urlInput.value;

  // validate the email and show error accordingly
  if (emailVal && !validateNoonEmail(emailVal)) {
    emailInput.classList.add("error-state");
  } else {
    emailInput.classList.remove("error-state");
  }

  // validate the URL and show error accordingly
  if (urlVal && !isUrlValid(urlVal)) {
    urlInput.classList.add("error-state");
  } else {
    urlInput.classList.remove("error-state");
  }

  // enable submit button when all the form elements are filled
  if (selectedForm === "assortment") {
    const values = [emailVal, ...Object.values(assortmentFormElements)];
    formSubmit.disabled = values.filter(Boolean).length !== values.length;
  }

  if (selectedForm === "others") {
    const values = [emailVal, ...Object.values(othersFormElements)];
    formSubmit.disabled = values.filter(Boolean).length !== values.length;
  }
};

// event handlers
const handleInput = (event) => {
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
    case "snoopy_competitor_url":
      assortmentFormElements = {
        ...assortmentFormElements,
        snoopy_competitor_url: value,
      };
      break;
    case "snoopy_attachment":
      assortmentFormElements = {
        ...assortmentFormElements,
        snoopy_attachment:
          value === "file" ? (fileInput.files[0] ? "file" : null) : value,
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

  formValidator();
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
    formElement.addEventListener("input", (event) => handleInput(event));
};

const handleAttachmentRadioClick = (e) => {
  const fileContainer = document.getElementById("file-container");
  const radioManual = document.getElementById("file-attachment");
  const radioVal = e.target.value;

  fileContainer.style.display = radioManual.checked ? "flex" : "none";
  // reset the snoopy_attachment value &  for "file" state
  if (radioVal === "file") {
    resetFileInput();
  }
};

const resetFileInput = () => {
  // add both title and innerHTML (title for smeantic tooltip)
  fileNameLabel.innerHTML = fileLabelContainer.title = "Choose a file";
  fileInput.value = null;

  // update the object
  delete assortmentFormElements.snoopy_file;
  assortmentFormElements = {
    ...assortmentFormElements,
    snoopy_attachment: null,
  };
};

const humanFileSize = (size) => {
  var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return (
    (size / Math.pow(1024, i)).toFixed(2) * 1 +
    " " +
    ["B", "kB", "MB", "GB", "TB"][i]
  );
};

// test validity of file types (image only)
const isValidImageType = (type) => ["image/jpeg", "image/png"].includes(type);

const handleFile = (e) => {
  let innerFileName = String(e.target.value).split("\\").pop();
  let fileObj = e.target.files[0];
  const fileSize = fileObj.size / 1024 / 1024; // in MiB
  const fileType = fileObj.type;
  const readableFileSize = humanFileSize(fileObj.size); // get the file size in readable format

  if (!isValidImageType(fileType)) {
    alert("Only JPEG/PNG types are accepted!");
    // and then reset file input state
    resetFileInput();
    // break here
    return;
  }

  if (fileObj && fileSize <= 2) {
    if (innerFileName)
      fileNameLabel.innerHTML =
        fileLabelContainer.title = `[${readableFileSize}] ${innerFileName}`;
    assortmentFormElements = {
      ...assortmentFormElements,
      snoopy_attachment: "file",
      snoopy_file: fileObj,
    };
    getBase64(fileObj);
    // validate form
    formValidator();
  } else {
    alert(
      `File size should not exceed 2MB, selected file size is ${readableFileSize}!`
    );
    // and then reset file input state
    resetFileInput();
  }
};

const getBase64 = (file) => {
  var reader = new FileReader();
  var ts = new Date();

  reader.readAsDataURL(file);
  reader.onload = function () {
    fileBlob = reader.result.split(",")[1]; // extracy only the file data part
    fileType = file.type;
    fileName = ts.toJSON() + "_" + file.name;
  };
  reader.onerror = function (error) {
    console.log("File Reader Error: ", error);
    fileBlob = null;
    fileType = null;
    fileName = null;
  };
};

// const getImageFile = (type) => {
//   if (["none", "file"].includes(type)) return "N/A";
//   if (type === "none") return "N/A";
//   if (type === "file") return fileInput.files[0];
//   // TODO: need to re-enable aftre bug fixes from Google
//   // if (type === "screenshot") return getCapture();
//   return null;
// };

const getCapture = () => {
  return new Promise((resolve) => {
    chrome.tabs.captureVisibleTab((dataUrl) => resolve(dataUrl));
  });
};

const getCountry = async (url) => {
  const regex = /(?:https?:\/\/([^\/?\s#]+))?\/([^\/?\s#]*)(?:[\?#].*)?/g;
  const matches = regex.exec(url);
  const matchedCountry = matches[2] ?? null;

  if (matchedCountry.includes("uae")) return "AE";
  if (matchedCountry.includes("saudi")) return "SA";
  if (matchedCountry.includes("egypt")) return "EG";
  return null;
};

const handleFormSubmit = async () => {
  const emailInputValue = emailInput.value;
  const urlInputValue = urlInput.value;

  // re-check email input value (just in case)
  if (!emailInputValue) {
    alert("Email Address is a required field!");
    return;
  }

  // re-check the email & URL and trigger error if invalid
  if (
    (emailInputValue && !validateNoonEmail(emailInputValue)) ||
    (urlInputValue && !isUrlValid(urlInputValue))
  ) {
    alert("Found some errors! Please resolve them to continue...");
    formValidator();
    return;
  }

  try {
    // add loading state & disable button
    formSubmit.innerText = "Loading...";
    formSubmit.classList.add("loading-state");
    formSubmit.disabled = true;

    let formObj = null;

    if (selectedForm === "assortment") {
      const values = Object.values(assortmentFormElements);

      if (values.filter(Boolean).length === values.length) {
        formObj = {
          ...assortmentFormElements,
          snoopy_user: emailInputValue,
          image_file: fileBlob
            ? JSON.stringify({
                file_blob: fileBlob,
                file_type: fileType,
                file_name: fileName,
              })
            : null,
          page_url: tabUrl,
        };
      }
    }

    if (selectedForm === "others") {
      const values = Object.values(othersFormElements);

      if (values.filter(Boolean).length === values.length) {
        formObj = {
          ...othersFormElements,
          snoopy_user: emailInputValue,
          image_file: fileBlob
            ? JSON.stringify({
                file_blob: fileBlob,
                file_type: fileType,
                file_name: fileName,
              })
            : null,
          page_url: tabUrl,
        };
      }
    }

    if (formObj) {
      // const formData = new FormData();
      // formData.append("image_file", imageUrl);
      // Object.entries(formObj).map(([k, v]) => formData.append(k, v));

      await fetch(
        "https://script.google.com/a/macros/noon.com/s/AKfycbxNf_zOekY19Eun6Mkau2AylIuGj01PoWzhdt3b5XJEo5wyzonNCpBCudaMvD42IBBufQ/exec",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formObj),
        }
      )
        .then((res) => res.text())
        .then((finalRes) => {
          formSubmit.classList.remove("loading-state");
          if (finalRes == 200) {
            formSubmit.innerText = "Done";
            formSubmit.classList.add("done-state");
            // on success, store the email address in chrome.storage
            chrome.storage.local.set({ [LS_KEY]: emailInputValue });
          } else {
            formSubmit.innerText = "Try again!";
            formSubmit.classList.add("error-state");
          }
        });
    } else {
      console.log("Form Object Error : ", formObj);
      formSubmit.classList.add("error-state");
    }
  } catch (e) {
    console.log("Something went wrong: ", e);
  } finally {
    // disable loading state and enable button
    setTimeout(() => {
      formSubmit.classList.remove("loading-state");
      formSubmit.classList.remove("done-state");
      formSubmit.classList.remove("error-state");
      formSubmit.innerText = "Submit";
      formSubmit.disabled = false;
    }, 6000);
    // trigger this to check if email is stored
    loadEmailFromStorage();
  }
};

const loadEmailFromStorage = () => {
  chrome.storage.local.get().then((result) => {
    const lsEmailValue = result[LS_KEY];

    // if email value is found in chrome.storage, set the value on input and disable it (to prevent accidental input)
    if (lsEmailValue != null) {
      emailInput.value = lsEmailValue;
      emailInput.disabled = true;
      // show the button
      emailClearBtn.style.display = "block";
    } else {
      emailInput.disabled = false;
      // show the button
      emailClearBtn.style.display = "none";
    }
  });
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
  formSubmit.addEventListener("click", handleFormSubmit);
  fileInput.addEventListener("change", handleFile);
  // trigger the form validator on email input changes
  emailInput.addEventListener("input", formValidator);
  // trigger the form validator on URL input changes
  urlInput.addEventListener("input", formValidator);
  emailClearBtn.addEventListener("click", (e) => {
    e.preventDefault();
    // clear the email value and enable the input
    emailInput.value = null;
    emailInput.disabled = false;
    emailClearBtn.style.display = "none";
  });
  // load email on load
  loadEmailFromStorage();

  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    tabUrl = tabs[0].url;
    if (tabUrl) {
      countryButtons.forEach(async (country) => {
        const defaultCountry = await getCountry(tabUrl);
        if (country.getAttribute("value") === defaultCountry) {
          country.checked = true;
          assortmentFormElements = {
            ...assortmentFormElements,
            snoopy_country: defaultCountry,
          };
        }
      });
    }
  });
});
