
// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api/";
const COHORT = "ZacharyVadnais"; 
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

// === Components ===
function partyForm(){

  const form = document.createElement("form");
//==name input
  const nameLabel = document.createElement("label");
  nameLabel.textContent = "Your Name:";
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.name = "Name";
  form.appendChild(nameLabel);
  form.appendChild(nameInput);

//==description input

  const descrLabel = document.createElement("label");
  descrLabel.textContent = "Your Description:"
  const descrInput = document.createElement("textarea");
  descrInput.textContent = ""
  form.appendChild(descrLabel);
  form.appendChild(descrInput);

//==party guests
 const guestLabel = document.createElement("label");
 guestLabel.textContent = " Who's Joining The Party?";
 const guestInput = document.createElement("input");
 guestInput.type = "text";
 guestInput.name = "guests";
 form.appendChild(guestLabel);
 form.appendChild(guestInput);


//==date input
  const dateLabel = document.createElement("label");
  dateLabel.textContent = "Today's Date:";
  const dateInput = document.createElement("input");
  dateInput.type = "date"
  dateInput.name = "date"
  form.appendChild(dateLabel);
  form.appendChild(dateInput);

//==Location input
  const locLabel = document.createElement("label");
  locLabel.textContent = "Next Party Location:";
  const locInput = document.createElement("Input");
  locInput.type = "text";
  locInput.name = "location";
  form.appendChild(locLabel);
  form.appendChild(locInput);

//==submit button
const submitButton = document.createElement("button");
submitButton.type = "submit";
submitButton.textContent = "submit";
form.appendChild(submitButton);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const description = descrInput.value.trim();
  const location = locInput.value.trim();
  const rawDate = dateInput.value;
  const guestList = guestInput.value
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  if (!rawDate) {
    alert("Please Choose A Date. Thank you!");
    return;
  }

  const isoDate = new Date(rawDate).toISOString();

  const newParty = {
    name,
    description,
    location,
    date: isoDate,
  };

  try {
    // === POST: Create new party ===
    const response = await fetch(`${API}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newParty),
    });

    const result = await response.json();
    console.log("Party created:", result);

    if (guestList.length > 0) {
  for (const guestName of guestList) {

    try {
      // Create guest with fake email
      const guestRes = await fetch(`${API}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: guestName,
          email: `${guestName.toLowerCase().replace(/\s/g, "")}`,
          phone: "333-333-4444",
          bio: "happy to be here!",
          job: "employed",
        }),
      });

      const guestJson = await guestRes.json();

      if (!guestJson.success) {
        console.error("Failed to create guest:", guestJson.error);
        continue;
      }

      // Create RSVP
      await fetch(`${API}/rsvps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: guestJson.data.id,
          eventId: result.data.id,
        }),
      });

    } catch (guestError) {
      console.error("Guest or RSVP failed", guestError);
    }
  }
}
  
    form.reset();
    selectedParty = null;
    await getParties();
    await getGuests();
    await getRsvps();
    render();

  } catch (error) {
    console.error("Failed to create party", error);
  }
});
return form;
}

/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
  `;
//==delete button
 const deleteButton = document.createElement("button");
 deleteButton.textContent = "delete party";

 deleteButton.addEventListener("click", async ()=> {
   const confirmDelete = confirm("Are you sure you want to delete this party?");
   if(!confirmDelete)return;
  
   try{
    await fetch(`${API}/events/${selectedParty.id}`,{
      method: "delete",
    });
    selectedParty = null;
    await getParties();
    render();
   }catch(error){
    console.error("failed to delete party, try again.", error);
   }
 });
  $party.appendChild(deleteButton);
  $party.querySelector("GuestList").replaceWith(GuestList());
  
  return $party;
}

/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
      <section>
        <h2>Create a New Party</h2>
        <PartyForm></PartyForm>
      </section>
    </main>
  `;
  $app.querySelector("PartyForm").replaceWith(partyForm());
  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
