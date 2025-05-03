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

window.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SET_FORM_DATA':
      setFormData(payload);
      break;
    case 'TRIGGER_SAVE':
      sendSaveData();
      break;
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

// function imageUrlToBase64(url) {
//   return new Promise((resolve, reject) => {
//     const xhr = new XMLHttpRequest();
//     xhr.onload = function () {
//       const reader = new FileReader();
//       reader.onloadend = function () {
//         resolve(reader.result); // Base64 string
//       };
//       reader.onerror = reject;
//       reader.readAsDataURL(xhr.response);
//     };
//     xhr.onerror = reject;
//     xhr.open('GET', url);
//     xhr.responseType = 'blob';
//     xhr.send();
//   });
// }

// function imageToBase64(url) {
//   return new Promise((resolve, reject) => {
//     const xhr = new XMLHttpRequest();
//     xhr.onload = function () {
//       const reader = new FileReader();
//       reader.onloadend = function () {
//         const base64 = reader.result.split(',')[1]; // Extract only the Base64 part
//         console.log('Base64:', base64); // Log the Base64 string
//         resolve(base64);
//       };
//       reader.onerror = reject;
//       reader.readAsDataURL(xhr.response);
//     };
//     xhr.onerror = reject;
//     xhr.open('GET', url);
//     xhr.responseType = 'blob';
//     xhr.send();
//   });
// }

// function imageUrlToBase64SameOrigin(imageUrl) {
//   const img = new Image();
//   img.onload = function () {
//     const canvas = document.createElement('canvas');
//     canvas.width = this.naturalWidth;
//     canvas.height = this.naturalHeight;
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(this, 0, 0);
//   };
//   img.onerror = function () {
//     console.error('Error loading image:', imageUrl);
//     // callback(null);
//   };
//   img.crossOrigin = 'anonymous'; // Important for same-origin requests in some scenarios
//   img.src = imageUrl;
//   return imageUrl;
// }
