


function fetchAndStoreExperiences() {
  // Retrieve access token from local storage
  var base_url='https://api.myriad.social'
  chrome.storage.local.get(['accessToken', 'username'], function(items) {
    var accessToken = items.accessToken;
    var username = items.username;

    var headers = {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken,
    };

    var url = base_url + "/user/experiences";
    var page = 1;
    var pagelimit = 10;
    var filter = '{"where":{"deletedAt":{"$exists":false}},"order":"createdAt DESC","include":["user",{"relation":"experience","scope":{"include":[{"relation":"user","scope":{"include":[{"relation":"accountSetting"}]}}]}}]}';
    var experiences = {}; // To store the Experience Names and IDs

    function fetchPage() {
      var params = new URLSearchParams({ "pageNumber": page, "pageLimit": pagelimit, "filter": filter });
      fetch(url + "?" + params.toString(), { headers: headers })
        .then(response => response.json())
        .then(data => {
       if (!data || !data.data) {
          console.error('Unexpected data structure:', data);
          return; // Exit early if data or data.data is undefined
        }
          var filtered_experiences = data.data.filter(exp => exp.experience.user.username === username);
          filtered_experiences.forEach(exp => {
            var experience_id = exp.experience.id;
            var experience_name = exp.experience.name;
            experiences[experience_name] = experience_id;
          });

          if (data.meta.additionalData.totalOwnedExperience > Object.keys(experiences).length) {
            page += 1;
            fetchPage(); // Fetch the next page if there are more experiences
          } else {
            // Store the experiences in local storage
            chrome.storage.local.set({ "experiences": JSON.stringify(experiences) }, function() {
              console.log("Experiences have been saved to local storage.");
              //populateExperiences(experiences); // Populate the experiences in the optgroup
            });
          }
        })
        .catch(error => console.error('Error:', error));
    }

    fetchPage(); // Start fetching the first page
  });
}


