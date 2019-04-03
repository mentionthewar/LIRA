// Set flags to ensure elements on page are not repeated
var picpresent = false;
var labelpresent = false;
var descriptpresent = false;
var extractpresent = false;
var occupresent = false;
var LBSOpresent = false;
var BBpresent = false;
var connectpresent = false;
var workspresent = false;
var snacpresent = false;

// Add a border
document.body.style.border = "5px solid yellow";

// Where in the page is the content going?
const pagepoint = document.getElementById('name-authority');
const pagepoint2 = document.getElementsByClassName('col starts-at-full ends-at-two-thirds holding-box clr');

// Rewrite filler/contextual text on page
const boxtitle = document.getElementsByClassName('order-option-main details-breather');
boxtitle[0].firstElementChild.innerText = "What does Wikidata know about this Person?";

const boxtext = document.getElementsByClassName('order-option-description')
boxtext[0].firstElementChild.innerText = "Click button three times (like Dorothy) to summon Wikidata and SNAC data on this entity. The creator details and collections summary will be augmented.";

// Add and style a button
var wikibutton = document.createElement('button');        
var buttonText = document.createTextNode('Get data');    
wikibutton.style.background = '#099'; 
wikibutton.style.color = 'white';
wikibutton.style.padding = '8px';
wikibutton.style.cssFloat = "right"; // right align
wikibutton.appendChild(buttonText);                       
pagepoint2[0].appendChild(wikibutton);                    

//Get URL path for current Discovery page
var url = window.location.pathname
var NAid = url.substring(url.lastIndexOf('/')+1);
console.log(NAid);

// Formulate URL for SPARQL query
var WikidataURLa = "https://query.wikidata.org/sparql?format=JSON&query=SELECT%20%3Fitem%20%3FitemLabel%20%3FTNAid%0AWHERE%0A%7B%0A%09%3Fitem%20wdt%3AP3029%20%22"
var WikidataURLb = "%22.%0A%20%20%20%20%3Fitem%20wdt%3AP3029%20%3FTNAid%0A%0A%09SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22%20%7D%0A%7D"
var WikidataURL = WikidataURLa + NAid + WikidataURLb;
console.log(WikidataURL);

var WikidataURLc = 'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=';
var imageURL = 'https://upload.wikimedia.org/wikipedia/commons/b/bb/';
var primaryWDurl = 'https://www.wikidata.org/wiki/'

var output;
var newOutput;
var snacOutput;
var wikiName;

// Run query to return corresponding Wikidata ID
wikibutton.addEventListener('click', () => {
fetch(WikidataURL)
.then( response => {
console.log('Fetching first resource...');
if(response.ok) {
return response;
}
throw Error(response.statusText);
})
.then( response => response.json() )
.then( data1 => output = data1.results.bindings[0].item.value )
.catch( error => console.log('There was an error:', error))

var QCode = output.substring(output.lastIndexOf('/')+1);
console.log(QCode)
var Wikidatacall = WikidataURLc + QCode;

// Get full Wikidata metadata
fetch(Wikidatacall)
.then( response => {
console.log('Fetching second resource...');
if(response.ok) {
return response;
}
throw Error(response.statusText);
})
.then( response => response.json() )
.then( data2 => newOutput = data2.entities[QCode] )
.catch( error => console.log('There was an error:', error))

// Main bio section

// Show the wikidata name/label in English with dates
var wikibirth = newOutput.claims.P569[0].mainsnak.datavalue.value.time; 
var wikideath = newOutput.claims.P570[0].mainsnak.datavalue.value.time;
var displaybirth = wikibirth.substring(1,5);
var displaydeath = wikideath.substring(1,5);
var displaydate = ' (' + displaybirth + ' - ' + displaydeath + ')';

var wikiname = newOutput.labels.en.value;
if(labelpresent == false){
var contentHead = document.createElement('h2');
var headContent = document.createTextNode(wikiname + displaydate);
contentHead.style.color = 'black';
contentHead.appendChild(headContent);
pagepoint.appendChild(contentHead);
labelpresent = true; // flip flag
}

// Show the wikidata description in English
var wikilabel = newOutput.descriptions.en.value;
if(descriptpresent == false){
var contentBody = document.createElement('p');
var bodyContent = document.createTextNode(wikilabel);
contentBody.appendChild(bodyContent);
pagepoint.appendChild(contentBody);
descriptpresent = true; // flip flag
}


// Occupation
var occupationNum = newOutput.claims.P106.length; // How many occupations?
var occupCount = 0;

if(occupresent == false){ // have we run this already?

const occupation = 'Occupation: ';
var occuplabelHead = document.createElement('h4');
var occuplabelText = document.createTextNode(occupation);
occuplabelHead.appendChild(occuplabelText);
pagepoint.appendChild(occuplabelHead);

while (occupCount < occupationNum) {
var wikijob = newOutput.claims.P106[occupCount].mainsnak.datavalue.value.id;
var occupHead = document.createElement('a');
occupHead.href = primaryWDurl + wikijob;
var occuptext = document.createTextNode(wikijob + ', ');
occupHead.appendChild(occuptext);
pagepoint.appendChild(occupHead);
console.log(occupationNum);
occupCount ++;
}
occupresent = true; // flip flag
}

// Mark slaveowners
if(LBSOpresent == false){ // have we run this already?
var claimCheckLBSO = newOutput.claims.hasOwnProperty('P3023'); // boolean check whether LBSO property is present
if(claimCheckLBSO !== false){ 
var connectLBSO = newOutput.claims.P3023[0].mainsnak.datavalue.value.id; 
var LBSOHead = document.createElement('h4');
var LBSOtext = document.createTextNode('This individual was a slave-owner and was compensated at abolition in 1833');
LBSOHead.appendChild(LBSOtext);
pagepoint.appendChild(LBSOHead);
} else {
	console.log('No LBSO id');
}
LBSOpresent = true; // flip flag
}

// Mark 'Black Book' entrants
if(BBpresent == false){ // have we run this already?
var BBclaimCheck = newOutput.claims.hasOwnProperty('P4248'); // boolean check whether Black book property is present
if(BBclaimCheck !== false){ 
var BBconnect = newOutput.claims.P4248[0].mainsnak.datavalue.value.id; 
var BBHead = document.createElement('h4');
var BBtext = document.createTextNode('This individual was listed by the SS for immediate arrest in the event of a Nazi occupation of Britain');
BBHead.appendChild(BBtext);
pagepoint.appendChild(BBHead);
} else {
	console.log('No Black Book id');
}
BBpresent = true; // flip flag
}


// Concatenate the Commons URL of the image
var imgSuffix = newOutput.claims.P18[0].mainsnak.datavalue.value;
var imageURLcall = 'https://commons.wikimedia.org/wiki/Special:Filepath/';
var fullimageURL = imageURLcall + imgSuffix;
console.log(fullimageURL);

// If the image is available display it
if(typeof imgSuffix !== 'undefined' && picpresent == false){
console.log(imgSuffix);
var img = document.createElement("img");
img.src = fullimageURL;
img.style.width = '225px'; // pick a sensible size (whole - possibly large - image is being loaded)
img.style.cssFloat = "right"; // right align
img.style.border = "thick solid white";
img.alt = imgSuffix; // set alt tag to be image name
pagepoint.appendChild(img);
picpresent = true; 
}

// Get start of wikipedia article
var wpName = newOutput.sitelinks.enwiki.title;
const wpapiURL = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=';
const mainwikiURL = 'https://en.wikipedia.org/wiki/'
var wikiintroURL = wpapiURL + wpName;
var wpPagelink = mainwikiURL + wpName;

fetch(wikiintroURL)
.then( response => {
console.log('Fetching Wikipedia intro...');
if(response.ok) {
return response;
}
throw Error(response.statusText);
})
.then( response => response.json() )
.then( data3 => wpOutput = data3.query )
.catch( error => console.log('There was an error:', error))

var vexedIDarray = Object.keys(wpOutput.pages); // get Wikipedia page ID even though I don't know what it is
var vexedID = vexedIDarray[0];
var wikiExtract = wpOutput.pages[vexedID].extract;

// Add the wikipedia article text to the page
if(extractpresent == false){
var wikitext = document.createElement('p');
var wikicontent = document.createTextNode(wikiExtract);
wikitext.appendChild(wikicontent);
pagepoint.appendChild(wikitext);

// Also add a link to the full wikipedia article
var enwpLink = document.createElement('a');
var wplinkText = document.createTextNode('[Read full Wikipedia article]');
enwpLink.href = wpPagelink;
enwpLink.appendChild(wplinkText);
pagepoint.appendChild(enwpLink);	

extractpresent = true; // flip flag
}

// Connections

if(connectpresent == false){

// Add title for connections section
const connections = 'Connections';
var connectionsHead = document.createElement('h3');
var connectionstitle = document.createTextNode(connections);
connectionsHead.appendChild(connectionstitle);
pagepoint.appendChild(connectionsHead);

// Collate and display connections data - Parents, Spouse, Children, Godchildren, Education, Memberships, Artistic Movement etc.

// Add a link to a family tree using Magnus Manske's Geneawiki tool
var geneawikiURL = 'https://tools.wmflabs.org/magnus-toolserver/ts2/geneawiki/?q=';
var fullgeneawikiURL = geneawikiURL + QCode;

var gwLink = document.createElement('a');
gwLink.href = fullgeneawikiURL;
var gwlinkText = document.createTextNode('Use the Geneawiki tool to view a family tree of this individual');
gwLink.appendChild(gwlinkText);
pagepoint.appendChild(gwLink);
pagepoint.appendChild(document.createElement('br'));

// Mother (P25) and father (P22)
var claimcheckPa = newOutput.claims.hasOwnProperty('P22'); // father present?
var claimcheckMa = newOutput.claims.hasOwnProperty('P25'); // mother present?

if(claimcheckPa !== false && claimcheckMa !== false){
var connectPa = newOutput.claims.P22[0].mainsnak.datavalue.value.id;
var connectMa = newOutput.claims.P25[0].mainsnak.datavalue.value.id;
var connectParents = connectMa + ' , ' + connectPa;
var parentHead = document.createElement('p');
var parenttext = document.createTextNode(connectParents + ' (Parents)');
parentHead.appendChild(parenttext);
pagepoint.appendChild(parentHead);
} else if(claimcheckPa !== false){
var connectPa = newOutput.claims.P22[0].mainsnak.datavalue.value.id;
var connectParents = connectPa;
var parentHead = document.createElement('a');
var parenttext = document.createTextNode(connectParents + ' (Father)');
parentHead.appendChild(parenttext);
parentHead.href = primaryWDurl + connectPa;
pagepoint.appendChild(parentHead);
pagepoint.appendChild(document.createElement('br'));
} else if(claimcheckMa !== false){
var connectMa = newOutput.claims.P25[0].mainsnak.datavalue.value.id;
var connectParents = connectMa;
var parentHead = document.createElement('p');
var parenttext = document.createTextNode(connectParents + ' Mother)');
parentHead.appendChild(parenttext);
pagepoint.appendChild(parentHead);
} else {
	console.log('No Parents for this entity');
}
	
var claimCheck1 = newOutput.claims.hasOwnProperty('P26'); // boolean check whether spouse property is present
//var claimCheck1a = newOutput.claims.P26[0].mainsnak.snaktype; // further check the property is not 'no value'
if(claimCheck1 !== false) //  && claimCheck1a !== "novalue") 
{ 
var numSpouse = newOutput.claims.P26.length;
var connectSpouse = newOutput.claims.P26[0].mainsnak.datavalue.value.id; // this is only spouse # 1
var spouseHead = document.createElement('a');
spouseHead.href = primaryWDurl + connectSpouse;
var spousetext = document.createTextNode(connectSpouse + ' (Spouse)');
spouseHead.appendChild(spousetext);
pagepoint.appendChild(spouseHead);
pagepoint.appendChild(document.createElement('br'));
} else {
	console.log('No Spouse for this entity');
}

var claimCheck2 = newOutput.claims.hasOwnProperty('P40'); // boolean check whether child property is present
if(claimCheck2 !== false){ 
var numChild = newOutput.claims.P40.length;
var connectChild = newOutput.claims.P40[0].mainsnak.datavalue.value.id; // this is only child # 1
var childHead = document.createElement('a');
childHead.href = primaryWDurl + connectChild;
var childtext = document.createTextNode(connectChild + ' (Child)');
childHead.appendChild(childtext);
pagepoint.appendChild(childHead);
pagepoint.appendChild(document.createElement('br'));
} else {
	console.log('No Children for this entity');
}

var claimCheck20 = newOutput.claims.hasOwnProperty('P3373'); // boolean check whether sibling property is present
if(claimCheck20 !== false){ 
var numSib = newOutput.claims.P3373.length;
var connectSib = newOutput.claims.P3373[0].mainsnak.datavalue.value.id; // this is only sibling # 1
var sibHead = document.createElement('a');
sibHead.href = primaryWDurl + connectSib;
var sibtext = document.createTextNode(connectSib + ' (Sibling)');
sibHead.appendChild(sibtext);
pagepoint.appendChild(sibHead);
pagepoint.appendChild(document.createElement('br'));
} else {
	console.log('No Siblings for this entity');
}

var claimCheck20a = newOutput.claims.hasOwnProperty('P1038'); // boolean check whether other relative property is present
if(claimCheck20a !== false){ 
var numRellies = newOutput.claims.P1038.length;
var connectRellies = newOutput.claims.P1038[0].mainsnak.datavalue.value.id; // this is only relative # 1
var relliesHead = document.createElement('a');
relliesHead.href = primaryWDurl + connectRellies;
var relliestext = document.createTextNode(connectRellies + ' (Other relative)'); // property has field describing the relationship (e.g. 'aunt')
relliesHead.appendChild(relliestext);
pagepoint.appendChild(relliesHead);
pagepoint.appendChild(document.createElement('br'));
} else {
	console.log('No additional relatives for this entity');
}


var claimCheck3 = newOutput.claims.hasOwnProperty('P69'); // boolean check whether education property is present
if(claimCheck3 !== false){
var numEducation = newOutput.claims.P69.length;
var connectEducation = newOutput.claims.P69[0].mainsnak.datavalue.value.id;

// Build up Wikidata query to show school contemporaries
var wdschoolURL1 = 'https://query.wikidata.org/embed.html#SELECT%20%3Fperson%20%3FpersonLabel%20%3FpersonDescription%20%3Fbirth%0AWHERE%7B%3Fperson%20wdt%3AP31%20wd%3AQ5.%0A%3Fperson%20wdt%3AP69%20wd%3A';
var wdschoolURL2 = '.%0A%3Fperson%20wdt%3AP569%20%3Fbirth%20.%0AFILTER%20%28%3Fbirth%20%3E%20%22';
var wdschoolURL3 = '%22%5E%5Exsd%3AdateTime%20%26%26%20%3Fbirth%20%3C%20%22'
var wdschoolURL4 = '%22%5E%5Exsd%3AdateTime%29%0ASERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%2Cen%22.%20%7D%7D';

// take the birth date and calculate a year either side then turn back into strings
var intdisplaybirth = parseInt(displaybirth, 10);
var edstartdate1 = intdisplaybirth - 1;
var edenddate1 = intdisplaybirth + 1;
var edstartdate = edstartdate1.toString();
var edenddate = edenddate1.toString();
var edstartdate = edstartdate + '-01-01';
var edenddate = edenddate + '-12-31';

var wdschoolURL = wdschoolURL1 + connectEducation + wdschoolURL2 + edstartdate + wdschoolURL3 + edenddate + wdschoolURL4;

pagepoint.appendChild(document.createElement('br'));
var educationHead = document.createElement('a');
educationHead.href = primaryWDurl + connectEducation;
var educationtext = document.createTextNode(connectEducation + ' (Educated at)');
educationHead.appendChild(educationtext);
pagepoint.appendChild(educationHead);

var educationHead1 = document.createElement('a');
educationHead1.href = wdschoolURL;
var educationtext1 = document.createTextNode(' [Show known contemporaries]');
educationHead1.appendChild(educationtext1);
pagepoint.appendChild(educationHead1);
pagepoint.appendChild(document.createElement('br'));
} else {
	console.log('No Education for this entity');
}

var claimCheck4 = newOutput.claims.hasOwnProperty('P135'); // boolean check whether any movements are given
if(claimCheck4 !== false){
var numMovement = newOutput.claims.P135.length;
var connectMovement = newOutput.claims.P135[0].mainsnak.datavalue.value.id;
var movementHead = document.createElement('a');
movementHead.href = primaryWDurl + connectMovement;
var movementtext = document.createTextNode(connectMovement + ' (Movement)');
movementHead.appendChild(movementtext);
pagepoint.appendChild(movementHead);
pagepoint.appendChild(document.createElement('br'));
} else {
	console.log('No movements for this entity');
}

var claimCheck5 = newOutput.claims.hasOwnProperty('P1290'); // boolean check whether godchildren are present
if(claimCheck5 !== false){ 
var numGodchild = newOutput.claims.P1290;
var connectGodchild = newOutput.claims.P1290[0].mainsnak.datavalue.value.id; // interesting to know the parents of the godchild?
var godchildHead = document.createElement('p');
var godchildtext = document.createTextNode(connectGodchild + ' (Godchild)');
gochildHead.appendChild(godchildtext);
pagepoint.appendChild(godchildHead);
} else {
	console.log('No godchildren for this entity');
}

var claimCheck6 = newOutput.claims.hasOwnProperty('P463'); // boolean check whether memberships are present
if(claimCheck6 !== false){ 
var numMembership = newOutput.claims.P463.length;
var connectMembership = newOutput.claims.P463[0].mainsnak.datavalue.value.id;
var membershipHead = document.createElement('a');
membershipHead.href = primaryWDurl + connectMembership;
var membershiptext = document.createTextNode(connectMembership + ' (Member of)');
membershipHead.appendChild(membershiptext);
pagepoint.appendChild(membershipHead);
pagepoint.appendChild(document.createElement('br'));
} else {
	console.log('No memberships for this entity');
}

var claimCheck6a = newOutput.claims.hasOwnProperty('P102'); // boolean check whether political memberships are present
if(claimCheck6a !== false){ 
var numpolMembership = newOutput.claims.P102.length;
var connectpolMembership = newOutput.claims.P102[0].mainsnak.datavalue.value.id;
var polmembershipHead = document.createElement('p');
var polmembershiptext = document.createTextNode(connectpolMembership + ' (Member of)');
polmembershipHead.appendChild(polmembershiptext);
pagepoint.appendChild(polmembershipHead);
} else {
	console.log('No political memberships for this entity');
}

var claimCheck6b = newOutput.claims.hasOwnProperty('P108'); // boolean check whether employer
if(claimCheck6b !== false){ 
var numEmployer = newOutput.claims.P108.length;
var connectEmployer = newOutput.claims.P108[0].mainsnak.datavalue.value.id;
var employerHead = document.createElement('p');
var employertext = document.createTextNode(connectEmployer + ' (Employed by)');
employerHead.appendChild(employertext);
pagepoint.appendChild(employerHead);
} else {
	console.log('No employment details for this entity');
}

console.log('Connections ' + numSpouse + numChild + numSib + numEducation + numMovement + numMembership);

// Military branch (P241) - value for regiment or similar?? and Military rank
// Employer(P108) / employed by
// Ideally I would want to show birth and death places as well as dates
// Honorofic prefix

connectpresent = true; // flip flag
}

// Works section

if (workspresent == false){

// Add title for works section
const works = 'Explore works';
var worksHead = document.createElement('h3');
var workstitle = document.createTextNode(works);
worksHead.appendChild(workstitle);
pagepoint.appendChild(worksHead);

// Notable works
var claimCheck7 = newOutput.claims.hasOwnProperty('P800'); // boolean check whether particular keys/claims are present
if(claimCheck7 !== false){ 
var numNotWorks = newOutput.claims.P800;
var connectNotWorks = newOutput.claims.P800[0].mainsnak.datavalue.value.id;
var notworksHead = document.createElement('a');
notworksHead.href = primaryWDurl + connectNotWorks;
var notworkstext = document.createTextNode(connectNotWorks);
notworksHead.appendChild(notworkstext);
pagepoint.appendChild(notworksHead);
pagepoint.appendChild(document.createElement('br'));
} else {
	console.log('No notable works for this entity');
}

// Concatenate the OpenLibrary url for an artist
var claimCheck8 = newOutput.claims.hasOwnProperty('P648'); // boolean check whether particular keys/claims are present
if(claimCheck8 !== false){ 
const openLibrary = 'https://openlibrary.org/works/';
var openlibraryURL = newOutput.claims.P648[0].mainsnak.datavalue.value;
var fullolURL = openLibrary + openlibraryURL;

var olLink = document.createElement('a');
var linkText2 = document.createTextNode('Read books by this author');
olLink.appendChild(linkText2);
olLink.href = fullolURL;
pagepoint.appendChild(olLink);	
} else {
	console.log('No openLibrary works for this entity');
}

// Concatenate the ART UK url for an artist
var claimCheck9 = newOutput.claims.hasOwnProperty('P1367'); // boolean check whether particular keys/claims are present
if(claimCheck9 !== false){ 
const artUK = 'https://artuk.org/discover/artworks/search/actor:';
var artukURL = newOutput.claims.P1367[0].mainsnak.datavalue.value;
var fullartukURL = artUK + artukURL;

var artukLink = document.createElement('a');
var linkText = document.createTextNode('View images by this artist in public collections');
artukLink.appendChild(linkText);
artukLink.href = fullartukURL;
pagepoint.appendChild(document.createElement('br'));
pagepoint.appendChild(artukLink);	
} else {
	console.log('No ArtUK works for this entity');
}

// Concatenate a Christie's url for an artist
var claimCheck10 = newOutput.claims.hasOwnProperty('P4200'); // boolean check whether particular keys/claims are present
if(claimCheck10 !== false){ 
const christies = 'http://artist.christies.com/_-';
var christiesURL = newOutput.claims.P4200[0].mainsnak.datavalue.value;
var fullChristiesURL = christies + christiesURL + ".aspx";

var cLink = document.createElement('a');
var linkText3 = document.createTextNode('Check works by this individual at auction (Christies)');
cLink.appendChild(linkText3);
cLink.href = fullChristiesURL;
pagepoint.appendChild(document.createElement('br'));
pagepoint.appendChild(cLink);	
} else {
	console.log('No works for sale for this entity');
}

// If all works properties are empty
if (claimCheck8 == false && claimCheck9 == false && claimCheck10 == false){
var emptyworks = document.createElement('p');
var emptytext = document.createTextNode('No works currently available to view');
emptyworks.appendChild(emptytext);
pagepoint.appendChild(emptyworks);	
}

workspresent = true; // flip flag for this section
}

// SNAC

var claimCheck11 = newOutput.claims.hasOwnProperty('P3430');

// Get repositories (and links preferably) with holdings from SNAC
if (claimCheck11 !== false){
var snacBase = 'http://n2t.net/ark:/99166/';
var snacID = newOutput.claims.P3430[0].mainsnak.datavalue.value;
var snacURL = snacBase + snacID;
console.log(snacURL);

if(snacpresent == false){
const colsnac = 'Collections (SNAC)';
var snactitleHead = document.createElement('h2');
snactitleHead.style.color = 'black';
var snactitle = document.createTextNode(colsnac);
snactitleHead.appendChild(snactitle);
pagepoint.appendChild(snactitleHead);

snacpresent = true;
}

// form SNAC-Arkid and fetch data
var constellation = '{"command": "read", "arkid": "' + snacURL + '"}';

fetch('http://api.snaccooperative.org', 
{
method: 'PUT',
headers: {
	'Accept': 'application/json',
	'Content-Type': 'application/json',
},
body: constellation,

}) .then( response => {
console.log('Fetching SNAC resource...');
if(response.ok) {
return response;
}
throw Error(response.statusText);
})
.then( response => response.json() )
.then( data5 => snacOutput = data5.constellation )
.catch( error => console.log('There was an error:', error))

var numSNAClocations = snacOutput.resourceRelations.length;

console.log("Snac knows about: " + numSNAClocations + " collections created by - or referencing - this person");

//ideally in this section we want to see 1) a number, 2) a description, 3) a location, 4) a doc reference [snac does not seem to have these]
// resource.link is the URL straight to the collections
// resource.title is the description [minus the creator, which we know]
// resource.displayentry is the description including the creator - which actually we may want for disambiguation purposes

// we want the loop to create a series of numbered p's, each linking externally and with both fields. That'll do for starters 

// loop over SNAC repositories

var count = 0;
var displaycount = 0;

while (count < numSNAClocations) {

	var snacLoc = snacOutput.resourceRelations[count].resource.repository.nameEntries[0].original;
	var snacStatus = snacOutput.resourceRelations[count].role.term; // see if the entity is the creator or just referred to
	var snaccollink = snacOutput.resourceRelations[count].resource.link; // get external url of collection
	var snacdescription = snacOutput.resourceRelations[count].resource.displayEntry;

	if (snacStatus == "creatorOf"){
			displaycount ++;
			var snactextHead = document.createElement('a');
			snactextHead.href = snaccollink;
			var snaccoltext = document.createTextNode(displaycount + " " + snacdescription + " " + snacLoc);
			snactextHead.appendChild(snaccoltext);
			pagepoint.appendChild(snactextHead);
			pagepoint.appendChild(document.createElement('br'));
		}
		count ++;
}


} else {
	console.log("No SNAC data on this entity");
}

// pagepoint.appendChild(document.createElement('br')); // bonus line break at bottom of page
},false);






