let db;

//open connection to database pwa
const request = indexedDB.open("pwa", 1);

request.onupgradeneeded = function (event) {
  // save a reference to the database
  const db = event.target.result;
  // create an object to store
  db.createObjectStore("new_transaction", { autoIncrement: true });
};

//on success
request.onsuccess = function (event) {
  db = event.target.result;
  // check if app is online
  if (navigator.onLine) {
    uploadTransaction();
  }
};

// if error
request.onerror = function (event) {
  console.log(event.target.errorCode);
};

//function to submit new transaction
function saveRecord(record) {
  const transaction = db.transaction(["new_transaction"], "readwrite");
  // acces object
  const transactionsObjectStore = transaction.objectStore("new_transaction");
  //add record to store
  transactionsObjectStore.add(record);
}

function uploadTransaction() {

    //open a transaction on db
  const transaction = db.transaction(["new_transaction"], "readwrite");

  //access object
  const transactionsObjectStore = transaction.objectStore("new_transaction");

  //get all records
  const getAll = transactionsObjectStore.getAll();

  //upon suucess
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {


      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          //open one more transaction
          const transaction = db.transaction(["new_transaction"], "readwrite");
          //access new transaction object store
          const transactionsObjectStore =
            transaction.objectStore("new_transaction");
          //clear store
          transactionsObjectStore.clear();

          alert("All transactions have been submitted");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}
//listen for the app coming back online
window.addEventListener("online", uploadTransaction);
