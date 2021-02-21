let db;

//create instance 
const request = indexedDB.open("budget",1)

// create schema
request.onupgradeneeded= function(event){
    const  db = event.target.result;
    db.createObjectStore("pending", {autoIncrement: true})

    
};

request.onsuccess = function(event){
    console.log(event)   
    db = event.target.result;
    if (navigator.onLine){
        checkDatabase();
    }
}

request.onerror = (event)=>{
    console.error("Error during idnex db request see below \n" + event.target.errorCode)
}

function checkDatabase() {
    
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();
  
    getAll.onsuccess = function() {
      if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
        .then(response => response.json())
        .then(() => {
          // if successful, open a transaction on your pending db
          const transaction = db.transaction(["pending"], "readwrite");
  
          // access your pending object store
          const store = transaction.objectStore("pending");
  
          // clear all items in your store
          store.clear();
        });
      }
    };
  }


  function addData(data) {
    // create a transaction on the pending db with readwrite access
    const transaction = db.transaction(["pending"], "readwrite");
  
    // access your pending object store
    const store = transaction.objectStore("pending");
  
    // add record to your store with add method.
    store.add(data);
  }


// listen for app coming back online
window.addEventListener("online", checkDatabase);



