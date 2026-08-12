
//  ========registration form=======
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

const firstNames = ["Aman", "Rohit", "Priya", "Neha"];
const lastNames = ["Sharma", "Verma", "Yadav", "Singh"];
const cities = ["Lucknow", "Delhi", "Kanpur"];

// ✅ REAL REACT FIX (IMPORTANT)
function setReactInput(el, value) {
  const setter = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(el),
    "value"
  ).set;

  setter.call(el, value);

  el.dispatchEvent(new Event("input", { bubbles: true }));
}

// 🔹 Fill inputs (REAL FIX)
function fillInputs() {
  document.querySelectorAll("input").forEach((el) => {
    const ph = (el.placeholder || "").toLowerCase();

    if (ph.includes("form")) setReactInput(el, Math.floor(1000 + Math.random() * 9000));
    else if (ph.includes("first")) setReactInput(el, random(firstNames));
    else if (ph.includes("middle")) setReactInput(el, "Kumar");
    else if (ph.includes("last")) setReactInput(el, random(lastNames));
    else if (ph.includes("father")) setReactInput(el, random(firstNames) + " " + random(lastNames));
    else if (ph.includes("contact")) setReactInput(el, "9" + Math.floor(100000000 + Math.random() * 900000000));
    else if (ph.includes("city")) setReactInput(el, random(cities));
    else if (ph.includes("fee")) setReactInput(el, Math.floor(1000 + Math.random() * 5000));
  });

  document.querySelectorAll("textarea").forEach((el) => {
    setReactInput(el, "Street " + Math.floor(Math.random() * 100));
  });
}

// 🔹 Save
function clickSave() {
  document.querySelectorAll("button").forEach((btn) => {
    if (btn.innerText.toLowerCase().includes("save")) {
      btn.click();
    }
  });
}

// 🔥 MAIN
let count = 0;

function run() {
  fillInputs();

  console.log("🟡 Form filled (REAL STATE UPDATED)");
  console.log("👉 Now select dropdown manually");
  console.log("👉 Then press ENTER");

  function handleEnter(e) {
    if (e.key === "Enter") {
      document.removeEventListener("keydown", handleEnter);

      clickSave();
      console.log("✅ Submitted:", count + 1);

      count++;

      if (count < 5) {
        setTimeout(run, 2000);
      } else {
        console.log("🔥 DONE");
      }
    }
  }

  document.addEventListener("keydown", handleEnter);
}

run();








// ==================enrollment=======



const randomNum = (len) =>
  Math.floor(Math.random() * Math.pow(10, len)).toString().padStart(len, "0");

const names = ["Suman", "Pooja", "Rekha", "Sunita", "Anita"];
const relations = ["Uncle", "Aunt", "Brother", "Sister"];
const states = ["Uttar Pradesh", "Delhi", "Bihar"];
const emails = ["test1@gmail.com", "demo@gmail.com", "user@gmail.com"];

// ✅ React safe setter (IMPORTANT)
function setReactValue(el, value) {
  const setter = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(el),
    "value"
  ).set;

  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

// 🔥 MASTER FILL (ALL LEFTOVER)
document.querySelectorAll("input, textarea").forEach((el) => {
  const ph = (el.placeholder || "").toLowerCase();

  // ❌ skip already filled
  if (el.value && el.value.trim() !== "") return;

  // ===== BASIC IDs =====
  if (ph.includes("pen")) {
    setReactValue(el, randomNum(10));
  }

  else if (ph.includes("apar")) {
    setReactValue(el, randomNum(10));
  }

  else if (ph.includes("serial") || ph.includes("sr")) {
    setReactValue(el, randomNum(6));
  }

  // ===== AADHAAR =====
  else if (ph.includes("aadhaar")) {
    setReactValue(el, randomNum(12));
  }

  // ===== PHONE =====
  else if (ph.includes("phone") || ph.includes("mobile")) {
    setReactValue(el, "9" + randomNum(9));
  }

  // ===== INCOME =====
  else if (ph.includes("income")) {
    setReactValue(el, randomNum(6));
  }

  // ===== NAMES =====
  else if (ph.includes("mother name")) {
    setReactValue(el, names[Math.floor(Math.random() * names.length)] + " Devi");
  }

  else if (ph.includes("guardian name")) {
    setReactValue(el, "Ramesh Sharma");
  }

  // ===== RELATION =====
  else if (ph.includes("relation")) {
    setReactValue(el, relations[Math.floor(Math.random() * relations.length)]);
  }

  // ===== OCCUPATION =====
  else if (ph.includes("occupation")) {
    setReactValue(el, "Private Job");
  }

  // ===== ADDRESS =====
  else if (ph.includes("address 2")) {
    setReactValue(el, "Near Market Area");
  }

  // ===== PIN =====
  else if (ph.includes("pin")) {
    setReactValue(el, randomNum(6));
  }

  // ===== STATE =====
  else if (ph.includes("state")) {
    setReactValue(el, states[Math.floor(Math.random() * states.length)]);
  }

  // ===== EMAIL =====
  else if (ph.includes("email")) {
    setReactValue(el, emails[Math.floor(Math.random() * emails.length)]);
  }
});

console.log("🔥 FULL MASTER AUTO-FILL DONE (SAFE + NO RESET)");


// ========Teacher =======

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randNum = (len) =>
  Math.floor(Math.random() * Math.pow(10, len)).toString().padStart(len, "0");

const firstNames = ["Aman", "Rohit", "Neha", "Priya"];
const lastNames = ["Sharma", "Verma", "Yadav", "Singh"];
const cities = ["Lucknow", "Delhi", "Kanpur"];
const states = ["Uttar Pradesh", "Delhi"];
const subjects = ["Math", "Science", "English", "Hindi"];

// ✅ React safe setter
function setVal(el, val) {
  const setter = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(el),
    "value"
  ).set;

  setter.call(el, val);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

// 🔥 Fill empty only
function fillForm() {
  document.querySelectorAll("input, textarea").forEach((el) => {
    if (el.value && el.value.trim() !== "") return;

    const ph = (el.placeholder || "").toLowerCase();

    // ===== PERSONAL =====
    if (ph.includes("teacher id")) setVal(el, randNum(5));
    else if (ph.includes("first")) setVal(el, random(firstNames));
    else if (ph.includes("middle")) setVal(el, "Kumar");
    else if (ph.includes("last")) setVal(el, random(lastNames));
    else if (ph.includes("caste")) setVal(el, "General");
    else if (ph.includes("phone")) setVal(el, "9" + randNum(9));
    else if (ph.includes("email")) setVal(el, "user" + randNum(3) + "@gmail.com");
    else if (ph.includes("contact name")) setVal(el, "Ramesh Sharma");
    else if (ph.includes("relation")) setVal(el, "Brother");

    // ===== ADDRESS =====
    else if (ph.includes("address line 1")) setVal(el, "Street " + randNum(2));
    else if (ph.includes("address line 2")) setVal(el, "Near Market");
    else if (ph.includes("city")) setVal(el, random(cities));
    else if (ph.includes("state")) setVal(el, random(states));
    else if (ph.includes("pin")) setVal(el, randNum(6));
    else if (ph.includes("mobile")) setVal(el, "9" + randNum(9));

    // ===== EXPERIENCE =====
    else if (ph.includes("school")) setVal(el, "ABC School");
    else if (ph.includes("designation")) setVal(el, "Teacher");
    else if (ph.includes("subject")) setVal(el, random(subjects));

    // ===== EMPLOYMENT =====
    else if (ph.includes("department")) setVal(el, "Science");
  });
}

// 🔹 Save button
function clickSave() {
  document.querySelectorAll("button").forEach((btn) => {
    if (btn.innerText.toLowerCase().includes("save")) {
      btn.click();
    }
  });
}

// 🔥 LOOP 4 TEACHERS
let count = 0;

function run() {
  fillForm();

  console.log("🟡 Teacher filled:", count + 1);
  console.log("👉 Fill dropdown manually (Gender, Category, etc.)");
  console.log("👉 Then press ENTER");

  function handleEnter(e) {
    if (e.key === "Enter") {
      document.removeEventListener("keydown", handleEnter);

      clickSave();
      console.log("✅ Submitted:", count + 1);

      count++;

      if (count < 4) {
        setTimeout(run, 2000);
      } else {
        console.log("🔥 DONE 4 TEACHERS");
      }
    }
  }

  document.addEventListener("keydown", handleEnter);
}

run();


// =======route master======


const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

const routes = ["City Route", "School Route", "Morning Route", "Evening Route"];
const locations = ["Lucknow", "Kanpur", "Delhi", "Noida"];

// ✅ React safe setter
function setReactValue(el, value) {
  const setter = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(el),
    "value"
  ).set;

  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

// 🔹 Fill Inputs
document.querySelectorAll("input").forEach((el) => {
  const ph = (el.placeholder || "").toLowerCase();

  if (ph.includes("route name")) {
    setReactValue(el, random(routes));
  }

  else if (ph.includes("route code")) {
    setReactValue(el, "R" + Math.floor(100 + Math.random() * 900));
  }

  else if (ph.includes("start")) {
    setReactValue(el, random(locations));
  }

  else if (ph.includes("end")) {
    setReactValue(el, random(locations));
  }
});

// 🔹 Checkbox (Active)
document.querySelectorAll("input[type='checkbox']").forEach((el) => {
  if (!el.checked) el.click();
});

// 🔹 Click Save
document.querySelectorAll("button").forEach((btn) => {
  if (btn.innerText.toLowerCase().includes("save")) {
    btn.click();
  }
});

console.log("🔥 Route created successfully");