let type = "Host";

document.getElementById("run").addEventListener("click", function () {
  const fileInput = document.getElementById("input-file");
  const file = fileInput.files[0];

  if (!file) {
    console.error("No se ha seleccionado ningún archivo");
    return;
  }

  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onload = function (event) {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(sheetData);
    if (type === "APX") {
      readAsAPX(sheetData);
    }

    if (type === "Host") {
      readAsHost(sheetData);
    }
  };
});

function readAsHost(sheetData) {
  //start readAsHost method
  let hasPagination = false;
  const notEmptyLines = sheetData.filter((x) => {
    return x.length !== 0 ? x : null;
  });
  //.map((row) => removeEmptyRows(row)); //better .map(removeEmpty) fp point free

  const formats = notEmptyLines.reduce(
    (currentFormats, currentLine, index, totalLines) => {
      if (
        currentLine.includes("Nombre") ||
        currentLine.includes("Nombre formato")
      ) {
        currentFormats.push(totalLines[index + 1][0]);
      }
      return currentFormats.map((format) => {
        if (format !== undefined) {
          return format;
        }
      });
    },
    []
  );

  function getFormatLastIndex(rows, firstIndex) {
    let lastIndexes = [];
    for (i = firstIndex; i < rows.length; i++) {
      if (rows[i].length < 5) {
        lastIndexes.push(i);
      }
    }
    return lastIndexes[0];
  }

  const firstFieldNamesIndexes = notEmptyLines.reduce(
    (currentIndexes, line, index) => {
      if (line[0] === "Nombre Arq") {
        currentIndexes.push(index + 1);
      }
      return currentIndexes;
    },
    []
  );
  if (formats.length > 2 && firstFieldNamesIndexes.length > 2) {
    hasPagination = true;
  }

  const lastFormatIndexes = [];
  lastFormatIndexes.push(
    getFormatLastIndex(notEmptyLines, firstFieldNamesIndexes[0])
  );
  lastFormatIndexes.push(
    getFormatLastIndex(notEmptyLines, firstFieldNamesIndexes[1])
  );

  if (hasPagination) {
    lastFormatIndexes.push(
      getFormatLastIndex(notEmptyLines, firstFieldNamesIndexes[2])
    );
  }
  //console.log(notEmptyLines);
  //console.log(lastFormatIndexes);

  const inputFields = notEmptyLines.slice(
    firstFieldNamesIndexes[0],
    lastFormatIndexes[0]
  );

  let paginationFields = null;
  let outputFields;

  if (hasPagination) {
    paginationFields = notEmptyLines.slice(
      firstFieldNamesIndexes[1],
      lastFormatIndexes[1]
    );
    outputFields = paginationFields.concat(
      notEmptyLines.slice(firstFieldNamesIndexes[2], lastFormatIndexes[2])
    );
  } else {
    outputFields = notEmptyLines.slice(
      firstFieldNamesIndexes[1],
      lastFormatIndexes[1]
    );
  }

  const inputFiles = notEmptyLines.splice(
    firstFieldNamesIndexes[0],
    lastFormatIndexes[0]
  );

  const ouput1 = notEmptyLines.splice(
    firstFieldNamesIndexes[1],
    lastFormatIndexes[1]
  );

  const output2 = notEmptyLines.splice(
    firstFieldNamesIndexes[2],
    lastFormatIndexes[2]
  );

  function removeEmptyRows(row) {
    for (let i = 0; i < row.length; i++) {
      if (!row[i] || row[i] === " " || row[i].length === 0) {
        row.splice(i, 1);
      }
    }
    return row;
  }
} // end of the readAsHost method

function readAsAPX(sheetData) {
  const splitIndexes = [];

  for (let i = 0; i < sheetData.length; i++) {
    if (
      sheetData[i].includes("Input Parameters") ||
      sheetData[i].includes("Output Parameters")
    ) {
      splitIndexes.push(i);
    }
  }

  const inputFields = sheetData.slice(splitIndexes[0] + 1, splitIndexes[1] - 1);

  const outputFields = sheetData.slice(splitIndexes[1] + 1);

  const allFields = inputFields
    .concat(outputFields)
    .filter((x) => Boolean(x[1]));

  const formattedFields = allFields.map(function toMappedFields(field) {
    const [empty, input_output, name, required, type, description] = field;
    return { name, description, type, input_output, required };
  });

  const finalFields = formattedFields.map((field) => {
    const outField = {};
    outField.name = field.name;
    outField.description = field.description
      .replaceAll("\r\n", " ")
      .replaceAll("\n", " ");
    outField.type = mapType(field.type, field.name);
    outField.input_output = mapInputOutput(field.input_output);
    outField.required = mapRequired(field.required);
    return outField;
  });

  function convertToCSV(arrayOfObjects) {
    if (arrayOfObjects.length === 0) return "";

    // Extract headers
    const headers = Object.keys(arrayOfObjects[0]);

    // Convert headers to CSV format
    const csvRows = [headers.join(",")];

    // Convert rows to CSV format
    arrayOfObjects.forEach((obj) => {
      const values = headers.map((header) =>
        JSON.stringify(obj[header], (key, value) =>
          value === null ? "" : value
        )
      );
      csvRows.push(values.join(","));
    });

    return csvRows.join("\n");
  }

  // Convert array of objects to CSV
  const csv = convertToCSV(finalFields);

  // Create a downloadable CSV file (optional)
  function downloadCSV(csv, filename = "data.csv") {
    const csvFile = new Blob([csv], { type: "text/csv" });
    const downloadLink = document.createElement("a");

    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  // Trigger download (optional)
  downloadCSV(csv);

  function mapInputOutput(inOut) {
    let outputInput = "input";
    if (inOut === "Output") {
      outputInput = "output";
    }
    return outputInput;
  }

  function mapRequired(required) {
    let req = "REQUIRED";
    if (required === "No") {
      req = "OPTIONAL";
    }
    return req;
  }

  function mapType(apxType, name) {
    switch (apxType) {
      case "DTO":
        return name[name.length - 1] == "]" ? "Array" : "Object";
      case "string":
        return "String";
      case "date":
      case "timestamp":
        return "Datetime";
      case "long":
      case "double":
        return "Number";
      case "boolean":
        return "Boolean";
      case "file":
        return "File";
      default:
        return null;
    }
  }
} // end of readAsAPX method
