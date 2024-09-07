const DOC_ID = "1byBf60vW_Tq7TjQPyniBxQ1Iw9CtSURJU4_Cl1IziqY"; 
var lb = new Map();
var nameMap = new Map();
var lbCaseSensitive = new Map();
var wrTotal = 0;
function fetchDocData() {
  const url = `https://docs.google.com/feeds/download/documents/export/Export?id=${DOC_ID}&exportFormat=txt`; // Text
  fetch(url)
    .then(response => response.text())
    .then(data => {
      // Clear the lb map before processing new data
      lb.clear();
      wrTotal = 0;
      const lines = data.split('\n');
      // Process each line
      lines.forEach(line => {
        if (line.includes("WR:")) {
          var split1 = line.split("WR:");
          split1 = split1[1];
          // Grabs the WR holder
          var split2a = split1.split("(");
          var split2 = [];
          split2a.forEach(function(spl) {
            split2.push(spl.split(")")[0]);
          })
          if (split2.length > 0) split2.reverse().pop(); // Removes the WR %s
          // adds up stats for every found WR
          split2.forEach(function(ign) {
            // Checks if the name contains a percentage sign
            if (ign != "-" && !ign.includes("%")) {
              wrTotal = wrTotal + 1;
              // Increase [ign]'s WR count
              if (lb.has(ign.toLowerCase())) {
                lb.set(ign.toLowerCase(), lb.get(ign.toLowerCase()) + 1);
              } else {
                lb.set(ign.toLowerCase(), 1);
              }
              // Track the (likely) correct capitalization of [ign]
              if (!nameMap.has(ign.toLowerCase())) {
                nameMap.set(ign.toLowerCase(), ign)
              }
            }
          });
        }
      });
      // Sort the leaderboard by WR count (descending)
      let sortedLb = new Map([...lb.entries()].sort((a, b) => b[1] - a[1]));
      // Update HTML elements with results
      document.getElementById("wrTotal").textContent = "Total WRs: " + wrTotal;
      document.getElementById("wrHolders").textContent = "WR Holders: " + lb.size;
      // Create the leaderboard list
      let leaderboardList = document.getElementById("leaderboard");
      leaderboardList.innerHTML = ''; // Clear any previous list
      let rank = 1; // Initialize a counter for rank
      sortedLb.forEach((wrCount, player) => {
        let listItem = document.createElement("li");
        let listItemWrapper = document.createElement("div");
        let nameSpan = document.createElement('span');
        let numberSpan = document.createElement('span');
        nameSpan.textContent = `${nameMap.get(player)}: `;
        numberSpan.textContent = `${wrCount} WRs`;
        // Apply classes based on rank
        if (rank === 1) {
          listItem.classList.add("gold");
        } else if (rank === 2) {
          listItem.classList.add("silver");
        } else if (rank === 3) {
          listItem.classList.add("bronze");
        }
        listItemWrapper.appendChild(nameSpan);
        listItemWrapper.appendChild(numberSpan);
        listItem.appendChild(listItemWrapper);
        leaderboardList.appendChild(listItem);
        rank++; // Increment the rank counter
      });
    })
    .catch(error => console.error("Error fetching data:", error));
}
// Initial call to fetch data
fetchDocData();
// Set up interval to fetch data every 30 minutes
setInterval(fetchDocData, 1800000); // 1800000 milliseconds = 30 minutes