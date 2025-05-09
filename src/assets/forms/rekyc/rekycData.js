const reqInputs = [
  'entity-mailing-address',
  'entity-mailing-address-shopBidg',
  'entity-mailing-address-roadName',
  'entity-mailing-address-landmark',
  'entity-mailing-address-city',
  'entity-mailing-address-pincode',
  'entity-mailing-address-state',
  'entity-mailing-address-country',
  'entity-mailing-address-telOff',
  'entity-mailing-address-extNo',
  'entity-mailing-address-faxNo',
  'entity-mailing-address-telR',
  'entity-mailing-address-mobNo',
  'entity-mailing-address-emailID',
  'entity-contact-address-sameAsMailingAddress',
  'entity-contact-address-shopBidg',
  'entity-contact-address-roadName',
  'entity-contact-address-landmark',
  'entity-contact-address-city',
  'entity-contact-address-pincode',
  'entity-contact-address-state',
  'entity-contact-address-country',
  'entity-contact-address-owned',
  'entity-contact-address-rentedLeased',
];

function sendSaveData() {
  window.parent.postMessage(
    {
      type: 'SAVE_DATA',
      source: 'kyc-form',
      payload: data || { message: 'nothing loaded yet' },
    },
    '*',
  );
}

function setFormData(payload) {
  const originalData = payload.originalData || {};
  const editedData = payload.editedData || {};

  const hasMailingAddress = !!originalData?.entityDetails?.mailingAddress;

  const updatedOriginalData = {
    ...originalData,
    entityDetails: {
      ...originalData.entityDetails,
      registeredOfficeAddress: originalData.entityDetails?.registeredOfficeAddress || {},
      mailingAddress: hasMailingAddress
        ? originalData.entityDetails.mailingAddress
        : { ...(originalData.entityDetails?.registeredOfficeAddress || {}) },
    },
  };

  data = {
    ...payload,
    originalData: updatedOriginalData,
    editedData: editedData,
  };

  renderAll();
}

function checkAllReqInputFilled() {
  let firstEmptyInput = null;
  let allInputsFilled = true;

  reqInputs.forEach((inputId) => {
    isCheckedAllReqInputFilled = true;
    const inputElement = document.getElementById(inputId);
    if (!inputElement) {
      console.warn(`Missing input: ${inputId}`);
      allInputsFilled = false;
      return;
    }

    const isFilled = inputElement.value?.trim() !== '';

    if (!isFilled) {
      inputElement.style.setProperty('border-bottom', '1px solid red', 'important');
      console.log('missed input', inputId);
      allInputsFilled = false;

      if (!firstEmptyInput) {
        firstEmptyInput = inputElement;
      }
    } else {
      inputElement.style.removeProperty('border-bottom');
    }
  });

  if (allInputsFilled) {
    console.log('All required inputs are filled.');
  } else {
    console.log('Some required inputs are missing.');
    if (firstEmptyInput) firstEmptyInput.focus();
  }
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Tab' && isCheckedAllReqInputFilled) {
    const current = document.activeElement;

    const unfilledInputs = reqInputs
      .map((id) => document.getElementById(id))
      .filter((el) => el?.value?.trim() === '');

    if (unfilledInputs.length === 0) return; // All filled, allow default

    const currentIndex = unfilledInputs.indexOf(current);

    e.preventDefault();

    if (currentIndex === -1 || currentIndex === unfilledInputs.length - 1) {
      // Not in list or last item — loop to first unfilled
      unfilledInputs[0].focus();
    } else {
      // Move to next unfilled
      unfilledInputs[currentIndex + 1].focus();
    }
  }
});

window.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SET_FORM_DATA':
      setFormData(payload);
      break;
    case 'TRIGGER_SAVE':
      sendSaveData();
      break;
    case 'CHECK_ALL_REQ_INPUT_FILLED':
      checkAllReqInputFilled();
    default:
      break;
  }
});

function getByPath(obj, pathArray) {
  return pathArray.reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    if (typeof key === 'object' && key.findById !== undefined) {
      return Array.isArray(acc) ? acc.find((item) => item.ausId === key.findById) : undefined;
    }
    return acc[key];
  }, obj);
}

function setByPath(obj, pathArray, value) {
  pathArray.reduce((acc, key, index) => {
    if (index === pathArray.length - 1) {
      // Handling special case for finding by ID
      if (typeof key === 'object' && key.findById !== undefined) {
        const item = acc.find((item) => item.ausId === key.findById);
        if (item) item[pathArray[index + 1]] = value; // Set the value on the specific field
      } else {
        acc[key] = value;
      }
    } else {
      if (typeof key === 'object' && key.findById !== undefined) {
        const item = acc.find((item) => item.ausId === key.findById);
        if (item) return item;
        else return {};
      }
      if (!acc[key]) acc[key] = {};
      return acc[key];
    }
  }, obj);
}

function deleteByPath(obj, pathArray) {
  if (pathArray.length === 0) return;
  const lastKey = pathArray[pathArray.length - 1];
  const parent = pathArray.slice(0, -1).reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    if (typeof key === 'object' && key.findById !== undefined) {
      return Array.isArray(acc) ? acc.find((item) => item.ausId === key.findById) : undefined;
    }
    return acc[key];
  }, obj);

  if (parent && parent[lastKey] !== undefined) {
    delete parent[lastKey];
  }
}

function decideColor(pathArray) {
  const status = getByPath(data.editedData, pathArray);

  if (status === 'modified') return '#D97706';
  if (status === 'own') return '#4b4b4d'; // filled by user
  return '#01327E'; // pre-filled untouched
}

function attachInputTracking(inputElement, pathArray) {
  // Set initial color on initial render based on the path data
  const initialColor = decideColor(pathArray);
  inputElement.style.setProperty('color', initialColor, 'important');

  inputElement.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    const originalValue = getByPath(data.originalData, pathArray);
    const existingEditedStatus = getByPath(data.editedData, pathArray);

    // if (originalValue === undefined || originalValue === null || originalValue === '') {
    //   if (value) {
    //     setByPath(data.editedData, pathArray, 'own');
    //   } else {
    //     deleteByPath(data.editedData, pathArray);
    //   }
    // } else {
    //   if (value !== originalValue) {
    //     setByPath(data.editedData, pathArray, 'modified');
    //   } else {
    //     deleteByPath(data.editedData, pathArray);
    //   }
    // }

    if (originalValue === undefined || originalValue === null || originalValue === '') {
      if (value) {
        setByPath(data.editedData, pathArray, 'own');
      } else {
        deleteByPath(data.editedData, pathArray);
      }
    } else {
      if (value !== originalValue) {
        // Only update to 'modified' if not already marked as 'own'
        if (existingEditedStatus !== 'own') {
          setByPath(data.editedData, pathArray, 'modified');
        }
      } else {
        // If value matches original, remove any editedData
        if (existingEditedStatus !== 'own') {
          deleteByPath(data.editedData, pathArray);
        }
      }
    }

    // Always update the originalData directly
    setByPath(data.originalData, pathArray, value);

    // Dynamically update color using setProperty
    const color = decideColor(pathArray);
    inputElement.style.setProperty('color', color, 'important');
  });
}

function camelToTitleCase(input) {
  return input
    .replace(/([a-z])([A-Z])/g, '$1 $2') // insert space before capital letters
    .replace(/^./, (char) => char.toUpperCase()); // capitalize first letter
}
