$( "#totalmem" ).on("click", function() {
    chrome.storage.sync.getBytesInUse(null, function (footprint){
        alert(footprint + " bytes in use")
    })
})

$( "#clearmem" ).on("click", function() {
    chrome.storage.sync.clear(function (){
        alert("Cleared all memory, reload page for effects to take place")
    })
})