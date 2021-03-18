let db;
// create budget database
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
   // create pending object store
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;
  // run checkDatabase if user is online
  if (navigator.onLine) {
    checkDatabase();
  }
};

// function to add information to budget database in indexedDB
function saveRecord(record) {
  const transaction = db.transaction(["pending"], "readwrite");
  transaction.objectStore("pending").add(record);
;
}

function checkDatabase() {
  // get everything from the pending object store
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  // send all data from indexedDB database to the mongoDB database after the database has been checked. Clear the indexedDB when this is done.
  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
      })
      .then(response => response.json())
      .then(() => {
        const transaction = db.transaction(["pending"], "readwrite");
        const store = transaction.objectStore("pending");
        store.clear();
      });
    }
  };
}

// check database when user comes online 
window.addEventListener("online", checkDatabase);
