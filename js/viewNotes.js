let googleUserId;

window.onload = (event) => {
  // Use this to retain user state between html pages.
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log('Logged in as: ' + user.displayName);
      googleUserId = user.uid;
      getNotes(googleUserId);
    } else {
      // If not logged in, navigate back to login page.
      window.location = 'index.html'; 
    };
  });
};

const getNotes = (userId) => {
  const notesRef = firebase.database().ref(`currentNotes/users/${userId}`);
  notesRef.orderByChild("title").on('value', (snapshot) => {
    const data = []
    console.log('json snapshot', snapshot.toJSON())
    snapshot.forEach(note => {
      console.log('note', note.val())
      data.push(note.val())
    })
    // const data = snapshot.val();
    console.log('data', data)
    /**
      {
        'id': { label, text, title }
      }
      --->
      const notesArray = [
        id1,
        id2,
        id3,
      ]
      
      notesArray.sort()
    */
    // const notesArray = Object.keys(data)
    // console.log(notesArray)
      /**
    notesArray.sort(function(a, b) {
      console.log(a)
      console.log(b)
      var nameA = a.name.toUpperCase(); // ignore upper and lowercase
      var nameB = b.name.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
        if (nameA > nameB) {
      return 1;
      }

      return 0;
      
      .orderByChild
      
  });*/
    
    renderDataAsHtml(data);
  });
};



const renderDataAsHtml = (data) => {
  let cards = ``;
  for(const noteItem in data) {
    const note = data[noteItem];
    // For each note create an HTML card
    cards += createCard(note, noteItem)
  };
  // Inject our string of HTML into our viewNotes.html page
  document.querySelector('#app').innerHTML = cards;
};


const editNote = (noteId) => {
  const editNoteModal = document.querySelector('#editNoteModal');
  const notesRef = firebase.database().ref(`currentNotes/users/${googleUserId}`);
  notesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    const noteDetails = data[noteId];
    document.querySelector('#editNoteId').value = noteId;
    document.querySelector('#editTitleInput').value = noteDetails.title;
    document.querySelector('#editTextInput').value = noteDetails.text;
  });

  editNoteModal.classList.toggle('is-active');
};

const deleteNote = (noteId) => {
  if(confirm("Are you sure you want to delete this note?")){
    firebase.database().ref(`currentNotes/users/${googleUserId}/${noteId}`).remove();
  }else{
    console.log("The delete was cancelled")
  }
}

const saveEditedNote = () => {
  const noteId = document.querySelector('#editNoteId').value;
  const noteTitle = document.querySelector('#editTitleInput').value;
  const noteText = document.querySelector('#editTextInput').value;
  const noteEdits = {
    title: noteTitle,
    text: noteText
  };
  firebase.database().ref(`currentNotes/users/${googleUserId}/${noteId}`).update(noteEdits);
  closeEditModal();
}

const closeEditModal = () => {
  const editNoteModal = document.querySelector('#editNoteModal');
  editNoteModal.classList.toggle('is-active');
};

const archiveNote = (noteId) => {
  const notesRef = firebase.database().ref(`currentNotes/users/${googleUserId}`);
  var noteTitle
  var noteText
  var noteLabel
  notesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    const noteDetails = data[noteId];
    noteTitle = noteDetails.title;
    noteText = noteDetails.text;
    noteLabel = noteDetails.label
  });
  
  // 2. Format the data and write it to our database
  firebase.database().ref(`archivedNotes/users/${googleUser.uid}`).push({
    title: noteTitle.value,
    text: noteText.value,
    label: noteLabel.value
  })
  
  // 3. Remove the note entry from the current notes directory
  firebase.database().ref(`currentNotes/users/${googleUserId}/${noteId}`).remove();
}


const createCard = (note, noteId) => {
  let innerHTML = "";
  innerHTML += `<div class="column is-one-quarter">`
  innerHTML += `<div class="card">`
  innerHTML += `<header class="card-header">`
  innerHTML += `<p class="card-header-title">`
  innerHTML += `${note.title}`
  innerHTML += `</p>`
  innerHTML += `</header>`
  innerHTML += `<div class="card-content">`
  innerHTML += `<div class="content">`
  innerHTML += `${note.text}`
  innerHTML += `</div>`
  innerHTML += `</div>`
  innerHTML +=  `<footer class="card-footer">`
  innerHTML +=  `<a id="${noteId}" class="card-footer-item" onclick="editNote(this.id)">Edit</a>`
  innerHTML +=  `<a id="${noteId}" href="#" class="card-footer-item" onclick="archiveNote(this.id)">Archive</a>`
  innerHTML +=  `<a id="${noteId}" href="#" class="card-footer-item" onclick="deleteNote(this.id)">Delete</a>`
  innerHTML +=  `</footer>`
  innerHTML += `</div>`
  innerHTML += `</div>`

  return innerHTML;
};

/*
`
if note.label === userInputLabel:
     <div class="column is-one-quarter"">
     <div class="card" style="background-color:${backgroundColor};>
       <header class="card-header">
         <p class="card-header-title">${name}</p>
         <p class="card-header-title">${note.title}</p>
       </header>
       <div class="card-content">
         <div class="content">${note.text}</div>
       </div>
       `<footer class="card-footer">
          <a id="${noteId}" href="#" class="card-footer-item"
             onclick="deleteNote('${noteId}')">
             Delete
          </a>
        </footer>`
     </div>
   </div> `;
*/

// old render HTML 

//Given a list of notes, render them in HTML
/*
function renderDataAsHtml(data, name){
  const appElement = document.querySelector("#app")
  appElement.innerHTML = "";
  const userLabel = document.querySelector("#noteLabel")
  for (const noteItem in data) {
    const note = data[noteItem];
    const card = createCard(note,name);
    console.log("note.label: "+note.label)
    console.log("userLabel.value: " + userLabel.value)
    if(note.label === userLabel.value){
      appElement.appendChild(card)
    }
  }
}


/* 
// OLD createCard DOM manipulation
// Return a note object converted into an HTML card
function createCard(note, name){
  const backgroundColor = '#'+Math.floor(Math.random()*16777215).toString(16);
  const columnElement = document.createElement("div");
  const cardElement = document.createElement("div");
  cardElement.className = "card"
  cardElement.style.backgroundColor = backgroundColor
  columnElement.appendChild(cardElement);
  columnElement.className = "column is-one-quarter"
  const headerElement = document.createElement("header");
  headerElement.className = "card-header"
  cardElement.appendChild(headerElement);
  const nameElement = document.createElement("p");
  nameElement.className = "card-header-title"
  nameElement.innerHTML = name;
  const titleElement = document.createElement("p");
  titleElement.className = "card-header-title"
  titleElement.innerHTML = note.title
  headerElement.appendChild(nameElement);
  headerElement.appendChild(titleElement);
  const contentDivElement = document.createElement("div");
  contentDivElement.className = "card-content"
  cardElement.appendChild(contentDivElement);
  const contentElement = document.createElement("div");
  contentElement.innerHTML = note.text;
  contentDivElement.appendChild(contentElement);
  const footerElement = document.createElement("footer");
  footerElement.className="card-footer";
  cardElement.appendChild(footerElement);
  
  const cardFooterContent = document.createElement("a");
  cardFooterContent.className="card-footer-item";
  cardFooterContent.id="${noteId}";
  return cardElement;
}
*/