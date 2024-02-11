document.addEventListener("DOMContentLoaded", function () {
  const tooltips = document.querySelectorAll(".tooltip");
  const defaultColors = ["#ff7f7e", "#ffbf7f", "#feff7f", "#7eff80", "#7fffff", "#807fff"];

  tooltips.forEach((tooltip, index) => {
    const defaultColor = defaultColors[index];
    const colorPicker = tooltip.querySelector(".color-picker");

    createColorPicker(colorPicker, (color) => {
      tooltip.parentNode.style.backgroundColor = color ? color.toHEXA().toString() : "";
    }, defaultColor);
  });

  scrollable = true;

  load();
});

document.addEventListener("touchmove", function (event) {
  if (!scrollable) {
    event.preventDefault();
  }
}, {
  passive: false,
});

function createColorPicker(colorPicker, onChange, defaultColor = "lightslategray") {
  const pickr = Pickr.create({
    el: colorPicker,
    theme: "monolith",
    default: defaultColor,
    swatches: ["#ff7f7e", "#ffbf7f", "#feff7f", "#7eff80", "#7fffff", "#807fff", "#ff7ffe"],
    components: {
      preview: true,
      hue: true,
      interaction: {
        input: true,
        clear: true,
        save: true,
      },
    },
  });

  pickr.on("save", (color) => {
    onChange(color);
    pickr.hide();
  });
}

function addRow() {
  const mainContainer = document.querySelector("main");
  const newRow = document.createElement("div");
  newRow.className = "row";

  // Labels and colors
  const tierLabelDiv = document.createElement("div");
  tierLabelDiv.className = "tier-label";
  tierLabelDiv.setAttribute("contenteditable", true);

  const paragraph = document.createElement("p");
  paragraph.textContent = "New tier";
  paragraph.setAttribute("spellcheck", false);

  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  tooltip.setAttribute("contenteditable", false);

  const colorPicker = document.createElement("div");
  colorPicker.className = "color-picker";

  // Tiers
  const tierDiv = document.createElement("div");
  tierDiv.className = "tier sort";

  // Options
  const optionsDiv = document.createElement("div");
  optionsDiv.className = "tier-options";

  const optionsContainer = document.createElement("div");
  optionsContainer.className = "options-container";

  const deleteButton = document.createElement("div");
  deleteButton.className = "option delete";
  deleteButton.innerHTML = '<img src="assets/trash.svg" alt="Delete" onclick="deleteRow(this)">';

  const upButton = document.createElement("div");
  upButton.className = "option";
  upButton.innerHTML = '<img src="assets/chevron-up.svg" alt="Up" onclick="moveRow(this, -1)">';

  const downButton = document.createElement("div");
  downButton.className = "option";
  downButton.innerHTML = '<img src="assets/chevron-down.svg" alt="Down" onclick="moveRow(this, 1)">';

  // Add divs to the row / main container
  tooltip.appendChild(colorPicker);

  createColorPicker(colorPicker, (color) => {
    tooltip.parentNode.style.backgroundColor = color ? color.toHEXA().toString() : "";
  });

  tierLabelDiv.appendChild(paragraph);
  tierLabelDiv.appendChild(tooltip);

  optionsContainer.appendChild(deleteButton);
  optionsContainer.appendChild(upButton);
  optionsContainer.appendChild(downButton);

  optionsDiv.appendChild(optionsContainer);

  newRow.appendChild(tierLabelDiv);
  newRow.appendChild(tierDiv);
  newRow.appendChild(optionsDiv);

  mainContainer.appendChild(newRow);

  initializeDragula();
}

function deleteRow(element) {
  element.closest(".row").remove();
}

function moveRow(button, direction) {
  const row = button.closest(".row");

  const currentIndex = Array.from(row.parentNode.children).indexOf(row);
  const newIndex = currentIndex + direction;

  if (newIndex >= 0) {
    row.parentNode.insertBefore(
      row,
      row.parentNode.children[newIndex + (direction === 1 ? 1 : 0)]
    );
  }
}

function selectImages() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple = true;

  input.click();

  input.addEventListener("change", () => uploadImages(input.files));
}

function uploadImages(files) {
  const imagesBar = document.getElementById("images-bar");

  for (const file of files) {
    const image = document.createElement("img");
    image.src = URL.createObjectURL(file);
    image.className = "image";

    imagesBar.appendChild(image);
  }

  initializeDragula();
}

function initializeDragula() {
  const containers = Array.from(document.querySelectorAll(".sort"));

  if (window.drake) {
    window.drake.containers.push(...containers);
  } else {
    window.drake = dragula(containers);
  }

  window.drake
    .on("drag", () => { scrollable = false; })
    .on("drop", () => { scrollable = true; })
    .on("cancel", () => { scrollable = true; });
}

function dynamicStyle(checkbox, css) {
  const style = document.getElementById("dynamic-styles");

  if (checkbox.checked) {
    style.innerHTML += css;
  } else {
    style.innerHTML = style.innerHTML.replace(css, "");
  }
}

// Helper function to encode non UTF-8 characters to Base64
function encodeUnicode(str) {
  return btoa(
    encodeURIComponent(str).replace(
      /%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
        return String.fromCharCode("0x" + p1);
      }
    )
  );
}

// Helper function to decode non UTF-8 characters from Base64
function decodeUnicode(str) {
  return decodeURIComponent(
    atob(str)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
}

function convertImageToDataURL(imageElement) {
  const MAX_IMG_SIZE = 500;
  const c = document.createElement("canvas");
  const ratio = imageElement.naturalHeight / imageElement.naturalWidth;

  if (ratio > 1) {
    c.height = Math.min(MAX_IMG_SIZE, imageElement.naturalHeight);
    c.width = Math.round(MAX_IMG_SIZE / ratio);
  } else if (ratio < 1) {
    c.height = Math.round(MAX_IMG_SIZE * ratio);
    c.width = Math.min(MAX_IMG_SIZE, imageElement.naturalWidth);
  } else {
    c.width = MAX_IMG_SIZE;
    c.height = MAX_IMG_SIZE;
  }

  const ctx = c.getContext("2d");
  ctx.drawImage(imageElement, 0, 0, c.width, c.height);
  const base64String = c.toDataURL();
  c.remove();

  return base64String;
}

async function share(shareButton, sharePositions) {
  const tiers = document.getElementsByClassName("row");
  const imagesBar = document.getElementById("images-bar");
  const barImages = Array.from(imagesBar.children);

  const oldButtonText = shareButton.innerText;
  shareButton.disabled = true;
  shareButton.innerText = "...";

  let shareJSON = {
    images: [],
    tiers: [],
  };

  console.log(`Sharing with${sharePositions ? "" : "out"} positions...`);

  Array.from(tiers).forEach((tier, tierIndex) => {
    const betterTier = {
      index: tierIndex,
      name: tier.children[0].children[0].textContent,
      color: tier.children[0].style.backgroundColor,
      images: Array.from(tier.children[1].children),
    };

    shareJSON.tiers.push({
      index: betterTier.index,
      name: betterTier.name,
      color: betterTier.color,
    });

    betterTier.images.forEach((img, imgIndex) => {
      const betterImage = {
        index: imgIndex,
        element: img,
        src: img.src,
      };

      const base64String = convertImageToDataURL(betterImage.element);

      shareJSON.images.push({
        img: base64String,
        tier: sharePositions ? betterTier.index : -1,
      });
    });
  });

  console.log(shareJSON);

  barImages.forEach((img, imgIndex) => {
    const betterImage = {
      index: imgIndex,
      element: img,
      src: img.src,
    };

    const base64String = convertImageToDataURL(betterImage.element);

    shareJSON.images.push({
      img: base64String,
      tier: -1,
    });
  });

  const c64 = encodeUnicode(JSON.stringify(shareJSON));
  const chunks = c64.match(/.{1,10000}/g);

  const values = await Promise.all(
    chunks.map(async (chunk) => {
      const response = await fetch("https://corsproxy.org/?https://hastebin.skyra.pw/documents", {
        method: "POST",
        body: chunk,
      });
      return await response.json();
    })
  );

  const strings = values.map((v) => v.key);
  const res = await fetch("https://corsproxy.org/?https://hastebin.skyra.pw/documents", {
    method: "POST",
    body: encodeUnicode(JSON.stringify(strings)),
  });
  const hastebinResponse = await res.json();

  console.log(hastebinResponse);

  const shareData = {
    title: "Share tier list!",
    text: `${window.location.origin}${window.location.pathname}#${hastebinResponse.key}`,
    url: `${window.location.origin}${window.location.pathname}#${hastebinResponse.key}`,
  };

  if (navigator.canShare(shareData)) {
    try {
      navigator.share(shareData);
    } finally {
      shareButton.innerText = "Shared!";
      setTimeout(() => {
        shareButton.innerText = oldButtonText;
        shareButton.disabled = false;
      }, 3000);
    }
  } else {
    await navigator.clipboard.writeText(shareData["url"]);

    shareButton.innerText = "Copied!";
    setTimeout(() => {
      shareButton.innerText = oldButtonText;
      shareButton.disabled = false;
    }, 5000);
  }
}

async function load() {
  const hash = window.location.hash.substring(1);

  if (hash.length <= 0) {
    console.log("Nothing to load.");
    return;
  }

  console.log(`Loading with the id "${hash}"...`);

  // Get the chunks
  const response = await fetch(`https://corsproxy.org/?https://hastebin.skyra.pw/raw/${hash}`);
  const text = await response.text();
  const chunks = JSON.parse(decodeUnicode(text));

  // Get the content of the chunks
  const chunksData = await Promise.all(chunks.map(async (chunk) => {
    const chunkResponse = await fetch(`https://corsproxy.org/?https://hastebin.skyra.pw/raw/${chunk}`);
    return chunkResponse.text();
  }));

  const res = chunksData.join(""); // Merge all chunks
  const data = JSON.parse(decodeUnicode(res));
  console.log(data); // Print readable data

  Array.from(document.getElementsByClassName("row")).forEach((row) => {
    deleteRow(row);
  });

  data.tiers.forEach(() => {
    addRow();
  });

  for (const tier of data.tiers) {
    const el = document.getElementsByClassName("row")[tier.index];
    el.children[0].children[0].textContent = tier.name;
    el.children[0].style.backgroundColor = tier.color;
  }

  const imagesBar = document.getElementById("images-bar");

  for (const img of data.images) {
    const image = document.createElement("img");
    image.src = img.img;
    image.className = "image";

    if (img.tier === -1) {
      imagesBar.appendChild(image);
    } else {
      document.getElementsByClassName("row")[img.tier].children[1].appendChild(image);
    }
  }
}
