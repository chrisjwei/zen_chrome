// The node to be monitored
var target = $( "#yahoo-search-results" )[0];
var options = {childList: true}

// Create an observer instance
var observer = new MutationObserver(function( mutations ) {
    mutations.forEach(handleMutation);    
});

function extractItemId(element){
    var descriptionElement = $( element ).children()[1]
    var titleElement = $( descriptionElement ).children()[0]
    var linkElement = $( titleElement ).children()[0]
    var link = $( linkElement ).attr("href")  // auction.aspx?itemCode=h182169203
    return link.split("=")[1]
}

function modifyAuctionItem(element){
    var elementId = extractItemId(element)
    chrome.storage.sync.get(elementId, function(result) {
        var blacklisted = 0
        if (jQuery.isEmptyObject(result)){
            console.log("Could not find element in blacklist");
        } else {
            console.log("Found elementId " + elementId + " in blacklist");
            blacklisted = 1
        }
        if (blacklisted == 1){
            $( element ).append("<span class='btn blacklist-button' blacklisted=1>Mark as Interested</div>")
            $( element ).css("background-color", "#d2d7d3")
        } else {
            $( element ).append("<span class='btn whitelist-button' blacklisted=0>Mark as Not Interested</div>")
        }
        var button = $( element ).children()[3]
        $( button ).on("click", function(){
            if ($( this ).attr("blacklisted") == 1){
                chrome.storage.sync.remove(elementId, function(){
                    console.log("Whitelisted id " + elementId)
                })
                $( this ).attr("blacklisted", 0)
                $( this ).removeClass("blacklist-button")
                $( this ).addClass("whitelist-button")
                $( this ).html("Mark as Not Interested")
                $( element ).css("background-color", "#fff")
            } else {
                obj = {}
                obj[elementId] = {}
                chrome.storage.sync.set(obj, function(){
                    console.log("Blacklisted id " + elementId)
                });
                $( this ).attr("blacklisted", 1)
                $( this ).removeClass("whitelist-button")
                $( this ).addClass("blacklist-button")
                $( this ).html("Mark as Interested")
                $( element ).css("background-color", "#d2d7d3")
            }
        })
    });
    // Add additional UI buttons to allow unblacklisting
}

function handleTargetChild(node){
    if (node.className == "col-md-12 yahoo-search-result"){
        modifyAuctionItem(node)
    }
}

function handleMutation(mutation){
    console.log("Got update");
    observer.disconnect(); // Disable observer
    mutation.addedNodes.forEach(handleTargetChild); // Mutate new items
    observer.observe(target, options)// Enable observer
}

// Make initial change
$( "#yahoo-search-results" ).children().each(function(i) {
    handleTargetChild($( this )[0]);
});

// Start observing
observer.observe(target, options);