var loginData = {
  accessToken: null,
  username: null
};




function checkSelectedExperience() {
  // Get the select element by its ID
  var selectElement = document.getElementById('experience_selector');

  // Check if an option is selected
  if (selectElement.selectedIndex !== -1) {
    // Get the selected option's value (experience name)
    var selectedExperienceName = selectElement.options[selectElement.selectedIndex].textContent;

    // Check if an experience is selected
    if (selectedExperienceName) {
      // Retrieve experiences from local storage
      var experiences = localStorage.getItem("experiences");
      if (experiences) {
        experiences = JSON.parse(experiences);

        // Get the corresponding experience ID
        var experienceId = experiences[selectedExperienceName];

        // Save the experience ID to local storage
        localStorage.setItem("default_experience_id", experienceId);


// Create the hyperlink to the selected experience
var experienceLink = "https://app.myriad.social/?type=experience&id=" + experienceId;

// Display the hyperlink using your function
displayUserFeedback('Click <a href="' + experienceLink + '" target="_blank">Here</a> to go to the selected Experience.');

      }
    }
  }
}

function addToDefaultExperience(postId) {
  var defaultExperienceId = localStorage.getItem("default_experience_id");
  var accessToken = localStorage.getItem("accessToken");

  var apiUrl = "https://api.myriad.social/experiences/post";
  var headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + accessToken,
  };

  var experienceData = {
    "experienceIds": [defaultExperienceId],
    "postId": postId
  };

  fetch(apiUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(experienceData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log(data);
    displayUserFeedback('The post has been successfully added to the default Timeline.');
  })
  .catch((error) => {
    console.error('Error:', error);
    displayUserFeedback('There was an error adding the post to the default Timeline. Please try again.', false);
  });
}


// Function to populate experiences and show the experiences div
function populateExperiences(experiences, defaultExperienceId) {
  var selectElement = document.getElementById('experience_selector');
  var optgroup = selectElement.querySelector('optgroup');

  // Clear any existing options
  optgroup.innerHTML = '';

  // Add the experiences
  for (var experience_name in experiences) {
    var option = document.createElement('option');
    option.value = experiences[experience_name];
    option.textContent = experience_name;
    optgroup.appendChild(option);

    // Select the default experience if it matches
    if (experiences[experience_name] === defaultExperienceId) {
      option.selected = true;
    }
  }

  // Show the experiences div
  document.getElementById('experiences').style.display = 'block';
}

// Function to load experiences from local storage and populate the optgroup
function loadExperiencesFromLocalStorage() {
  var experiences = localStorage.getItem("experiences");
  var defaultExperienceId = localStorage.getItem("default_experience_id");
  if (experiences) {
    experiences = JSON.parse(experiences);
    populateExperiences(experiences, defaultExperienceId);
  }
}


function fetchAndStoreExperiences() {
  var storedExperiences = localStorage.getItem("experiences");
  if (storedExperiences) {
    return; // Exit early if experiences are already populated
  }
  // Show spinner and message
  document.getElementById('spinner').style.display = 'block';
  displayUserFeedback("The extension is loading your Myriad data. Please do not close.");

  // Retrieve access token from local storage
  var accessToken = localStorage.getItem("accessToken");
  var username = localStorage.getItem("username");
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
          finalizeFetching();
        }
      })
      .catch(error => console.error('Error:', error));
  }

  function finalizeFetching() {
    // Check if there are no experiences
    if (Object.keys(experiences).length === 0) {
      createDefaultExperience(); // Create a new default experience
    }

    // Store the experiences in local storage
    localStorage.setItem("experiences", JSON.stringify(experiences));

    // Set the default experience to be the first one if not already set
    if (!localStorage.getItem("default_experience_id")) {
      var firstExperienceId = Object.values(experiences)[0];
      localStorage.setItem("default_experience_id", firstExperienceId);
    }

    displayUserFeedback("Myriad Timelines loaded.");
    document.getElementById('spinner').style.display = 'none';
    populateExperiences(experiences); // Populate the experiences in the optgroup
  }

  fetchPage(); // Start fetching the first page
}

function createDefaultExperience() {
  var accessToken = localStorage.getItem("accessToken");
  var headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + accessToken,
  };
  var url = base_url + "/user/experiences";

  // We'll name the experience "Default" as you requested
  var experience_name = "Default";
  var data = JSON.stringify({ "name": experience_name });

  fetch(url, {
    method: 'POST', // We'll use POST method to create the experience
    headers: headers,
    body: data
  })
  .then(response => response.json())
  .then(responseData => {
    // Here you can handle the response data if needed
    console.log("Default experience created:", responseData);
  })
  .catch(error => console.error('Error:', error));
}



function dataURLToBlob(dataUrl) {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

function displayUserFeedback(messageText, isSuccess = true) {
  // Create a new message element
  let messageElement = document.createElement('div');

  // Add classes to the message
  messageElement.className = 'message ' + (isSuccess ? 'success' : 'error');

  // Set the HTML content of the message
  messageElement.innerHTML = messageText; // Use innerHTML instead of textContent

  // Append the message to the body
  document.body.appendChild(messageElement);

  // After 6 seconds, remove the message
  setTimeout(() => {
    document.body.removeChild(messageElement);
  }, 5000);
}


base_url='https://api.myriad.social';
function createMyriadPost(title, textBlocks, platform = 'myriad', visibility = 'public') {
  document.getElementById('spinner').style.display = 'block';
  const apiEndpoint = `${base_url}/user/posts`;

  fetch(`${base_url}/users/${loginData.username}`, {
    headers: {
        'Authorization': `Bearer ${loginData.accessToken}`
    }
  })
  .then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(user_data => {
    const createdBy = user_data.id;

    let now = new Date();

    let createdAt = now.toISOString();

    let text = textBlocks.join('\n');

    var defaultExperienceId = localStorage.getItem("default_experience_id");

    let post_data = {
        "rawText": text,
        "text": text,
        "status": "published",
        "selectedTimelineIds": [defaultExperienceId],
        "createdBy": createdBy,
        "createdAt": createdAt,
        "platform": platform,
        "visibility": visibility
    };

    return fetch(apiEndpoint, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.accessToken}`
      },
      body: JSON.stringify(post_data)
    })
  })
  .then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  })
  .then(data => {
    console.log('Post created successfully!');
    displayUserFeedback('Post created successfully!', true);

    // Hide the spinner
    document.getElementById('spinner').style.display = 'none';
  })
  .catch((error) => {
    console.error('Error:', error);

    // Hide the spinner
    document.getElementById('spinner').style.display = 'none';
  });
}




function generateFacebookEmbed(url) {
	  // Remove subdomains like "m." or "web." if present
  url = url.replace(/https:\/\/(m\.|web\.)?facebook\.com/, 'https://www.facebook.com');

  let src;
  if (url.includes('/videos/')) {
    // It's a video
    const videoId = url.split('/videos/')[1].split('/')[0];
    const pageName = url.split('facebook.com/')[1].split('/')[0];
    src = `https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2F${pageName}%2Fvideos%2F${videoId}%2F&show_text=false&width=100%&t=0`;
  } else {
    // It's a post
    src = `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=100%`;
  }

  return `<iframe src="${src}" width="100%" height="476" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen="true"></iframe>`;
}



function embedFacebookPost() {
  // Get the current tab URL
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTabURL = tabs[0].url;

    // Check if the URL is a Facebook post or video
    const facebookPattern = /^https:\/\/(www\.|m\.|web\.)?facebook\.com\/.+/;
    if (!facebookPattern.test(currentTabURL)) {
      //displayUserFeedback("Please go to a Facebook post or video.");
      return;
    }

    // Construct the embed HTML using the generateFacebookEmbed function
    const embedHTML = generateFacebookEmbed(currentTabURL);

    // Title for the Myriad post (you can customize this)
    const title = "Facebook Embed";

    // Call the createMyriadPost function to post the embedded Facebook content
    createMyriadPost(title, [embedHTML], 'myriad');
  });
}

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "grabText") {
    const originalText = message.text;

    // Construct the embed HTML using the generateFacebookEmbed function
    const embedHTML = generateFacebookEmbed(sender.tab.url, originalText);

    // Title for the Myriad post 
    const title = "Facebook Embed";

    // Call the createMyriadPost function to post the embedded Facebook content
    createMyriadPost(title, [embedHTML], 'myriad');
  }
});

// ... Rest of the code as before ...





//Alex check below
// When the popup is opened, get the active tab URL.
chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
  let url = tabs[0].url;
  const iframe = document.getElementById('myriad_iframe');
  iframe.style.display = 'none';

  // If the active page is Twitter
  if (url.includes("twitter.com")) {
    // Check if the URL is of the format "https://twitter.com/{username}/status/{postid}"
    const match = url.match(/https:\/\/twitter\.com\/[^\/]+\/status\/(\d+)/);
    processMatch(match);
  }

  // If the active page is Reddit
  if (url.includes("reddit.com")) {
    // Check if the URL is of the format "https://www.reddit.com/r/{subreddit}/comments/{alphanumeric}/{title}/"
    const match = url.match(/https:\/\/www\.reddit\.com\/r\/[^\/]+\/comments\/(\w+)/);
    processMatch(match);
  }
  
  function processMatch(match) {
    if (match) {
      const postId = match[1];
      
      // Perform a GET request to the API
      fetch('https://api.myriad.social//user/posts?pageLimit=200')
        .then(response => response.json())
        .then(data => {
          // Find the post with the same "originPostId" as our "postid"
          const post = data.data.find(post => post.originPostId === postId);
          
          // Get the iframe and other elements
          const emailField = document.getElementById('emailfield');
          const magicLink = document.getElementById('magiclink');
          const postDiv = document.getElementById('post');
          const importDiv = document.getElementById('import');
          
          if (post) {
            // Construct the Myriad URL
            const myriadUrl = `https://app.myriad.social/post/${post.id}`;
            
            // Set the source of the iframe
            iframe.src = myriadUrl;

            // Show the iframe and hide the other elements
            iframe.style.display = 'block';
            emailField.style.display = 'none';
            magicLink.style.display = 'none';
            postDiv.style.display = 'none';
            importDiv.style.display = 'none';
          } else {
            // Hide the iframe and show the other elements
            iframe.style.display = 'none';
            console.log('Post not found in API response.');
          }
        })
        .catch(error => console.error('Error:', error));
    }
  }
});

// This function changes the visibility based on the last clicked button
function updateVisibility() {
    var lastClicked = localStorage.getItem('lastClicked');

    if(lastClicked === 'email_login') {
        document.getElementById('selector').style.display = 'none';
        document.getElementById('emailfield').style.display = 'block';
    } else {
        document.getElementById('selector').style.display = 'block';
        document.getElementById('emailfield').style.display = 'none';
    }
}


document.addEventListener('DOMContentLoaded', function () {


document.getElementById('refresh_button').addEventListener('click', function() {
  // Remove the experiences data from local storage
  localStorage.removeItem("experiences");

  // Call fetchAndStoreExperiences to repopulate the data
  fetchAndStoreExperiences();


});

// Get the logout button and confirmation div
var logoutButton = document.getElementById('logout_button');
var logoutConfirmation = document.getElementById('logout_confirmation');

// When the logout button is clicked
logoutButton.addEventListener('click', function() {
  // Hide the logout button and show the confirmation div
  logoutButton.style.display = 'none';
  logoutConfirmation.style.display = 'inline';
});

// When the "yes" link is clicked
document.getElementById('logout_yes').addEventListener('click', function(e) {
  e.preventDefault(); // Prevent the default link behavior
  // Remove ALL data from local storage
  localStorage.clear();

  // Hide the confirmation div and show the logout button
  logoutConfirmation.style.display = 'none';
  logoutButton.style.display = 'inline';

  // You can add some user feedback here if you like
  displayUserFeedback('Logged out successfully! See you next time!');
  checkLogin();
});

// When the "no" link is clicked
document.getElementById('logout_no').addEventListener('click', function(e) {
  e.preventDefault(); // Prevent the default link behavior
  // Hide the confirmation div and show the logout button
  logoutConfirmation.style.display = 'none';
  logoutButton.style.display = 'inline';
});


document.getElementById('logo').addEventListener('click', function () {
    window.open('https://app.myriad.social', '_blank');
});

	document.getElementById('create_account').addEventListener('click', function () {
    window.open('https://app.myriad.social/login?instance=https%3A%2F%2Fapi.myriad.social', '_blank');
});

document.getElementById('connect_email').addEventListener('click', function () {
    window.open('https://app.myriad.social/settings?section=email&instance=https%3A%2F%2Fapi.myriad.social', '_blank');
});
	 
    var buttons = document.getElementsByTagName('button');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function () {
            this.style.backgroundColor = '#ffd24d';
        });
    }

    var writePostButton = document.getElementById('write_post_button');
    var submitPostButton = document.getElementById('submit_post_button');
    var postContent = document.getElementById('post_content');

    writePostButton.addEventListener('click', function () {
        writePostButton.style.display='none';
        postContent.style.display = 'block';
        submitPostButton.style.display = 'inline-block';
    });

    submitPostButton.addEventListener('click', function () {
        let content = postContent.value;
        if (content) {
            let title = 'Title';
            let textBlocks = content.split('\n');

            createMyriadPost(title, textBlocks);
            postContent.value = '';
            writePostButton.style.display='block';
            postContent.style.display = 'none';
            this.style.display = 'none';
        }
    });

document.getElementById('send_magic_link').addEventListener('click', function () {
    var email = document.getElementById('email').value;
    localStorage.setItem('lastEmail', email);
    sendMagicLink(email);
    document.getElementById('magiclink').style.display = 'block'; // Show the magic link field

    // Check if email is Gmail or Yahoo, then provide link to email provider
    var link = null;
    if (email.endsWith("@gmail.com")) {
        link = "https://mail.google.com";
    } else if (email.endsWith("@yahoo.com")) {
        link = "https://mail.yahoo.com";
    }

    if (link) {
        var emailProviderLink = document.getElementById('email_provider_link');
        if (emailProviderLink) {
            emailProviderLink.href = link; // Update existing link if it already exists
        } else {
            // Create new link if it doesn't exist yet
            emailProviderLink = document.createElement('a');
            emailProviderLink.id = 'email_provider_link';
            emailProviderLink.href = link;
            emailProviderLink.target = "_blank";
            emailProviderLink.textContent = "Go to your email provider";

            document.getElementById('emailfield').appendChild(emailProviderLink); // Append the link to the emailfield div
        }
    }
});


document.getElementById('submit_magic_link').addEventListener('click', function () {
    var magicLink = document.getElementById('magic_link').value;
    authenticate(magicLink);
});

window.onload = function() {
    var lastEmail = localStorage.getItem('lastEmail');
    if(lastEmail) {
        document.getElementById('email').value = lastEmail;
        document.getElementById('send_magic_link').textContent = 'Resend Magic Link';
        document.getElementById('magiclink').style.display = 'block'; // Show the magic link field if an email is stored
    }
    updateVisibility();

    // This event listener is here
    document.getElementById('email_login').addEventListener('click', function () {
        localStorage.setItem('lastClicked', 'email_login');
        updateVisibility();
    });
}

    
    
document.getElementById('import_post').addEventListener('click', function () {
	var writePostButton = document.getElementById('write_post_button');
	writePostButton.style.display='block';
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var currentUrl = tabs[0].url;
        if (currentUrl.includes('twitter.com') || currentUrl.includes('reddit.com')) {
            importTwitterPost(currentUrl);
        } else if (currentUrl.includes('youtube.com')) {
            let text = `<iframe width="100%" height="315" src="${currentUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
            if (text.includes('watch?v=')) {
                text = text.replace('watch?v=', 'embed/');
            }
            let content = postContent.value;
            let title = 'Title';

            let textBlocks = [text];
            if (content) {
                textBlocks.unshift(content.split('</p><p>'));
            }
            // Create Myriad Post
            createMyriadPost(title, textBlocks, 'myriad', 'public');
            postContent.value = '';
            postContent.style.display = 'none';
            this.style.display = 'none';
        } else if (currentUrl.includes('twitch.tv/')) {
            const url = new URL(currentUrl);
            let twitchUser = url.pathname.substring(1);
            let text = `<iframe src="https://player.twitch.tv/?channel=${twitchUser}&parent=app.myriad.social" frameborder="0" allowfullscreen="true" scrolling="no" height="378" width="100%"></iframe>`

            let textBlocks = [text];
            let title = 'Title';
            let content = postContent.value;
            if (content) {
                textBlocks.unshift(content.split('</p><p>'));
            }
            // Create Myriad Post
            createMyriadPost(title, textBlocks, 'myriad', 'public');
            postContent.value = '';
            postContent.style.display = 'none';
            this.style.display = 'none';
        } else if (currentUrl.includes('facebook.com/')) {
			embedFacebookPost()
		}
    });
});

// Get the select element by its ID
var selectElement = document.getElementById('experience_selector');

// Add an event listener that listens for the "change" event
selectElement.addEventListener('change', checkSelectedExperience);


checkSelectedExperience();


});



function checkLogin() {
	
	var writepostbuttonElement = document.getElementById('write_post_button');
    var importbuttonElement = document.getElementById('import_post');
importbuttonElement.innerText = importbuttonElement.textContent = 'new text';
     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
       var currentUrl = tabs[0].url;
       var contextElement = document.getElementById('contextof');
           if (currentUrl.includes('twitter.com') || currentUrl.includes('reddit.com')) {
       //displayUserFeedback(`The current page is natively importable to Myriad!`, true);
       contextElement.innerText = "The current page is natively importable to Myriad! ";
              document.getElementById('write_post_button').style.display = 'none';
      importbuttonElement.innerText = importbuttonElement.textContent = 'Import Post';
    } else if (currentUrl.includes('youtube.com') || currentUrl.includes('twitch.tv') || currentUrl.includes('facebook.com')) {
        contextElement.innerText = "The current page can be embedded into a Myriad post! "; 
          // If the URL is not from Facebook, show the "Add Caption" button
       if (!currentUrl.includes('facebook.com')) {
    writepostbuttonElement.innerText = writepostbuttonElement.textContent = 'Add Caption';
    } else {
		writepostbuttonElement.style.display = 'none';
	}
        importbuttonElement.innerText = importbuttonElement.textContent = 'Embed';
    } else {
        contextElement.innerText = "Myriad supports inserting posts from Twitter, Reddit, YouTube, Twitch, and Facebook!\nYou can also write a Myriad text post below.";
        importbuttonElement.innerText = importbuttonElement.textContent = 'Archive Content';
              document.getElementById('import_post').style.display = 'none';
    }        
     
     
     })

// Retrieve the "accessToken" and "username" from local storage
var accessToken = localStorage.getItem("accessToken");
var username = localStorage.getItem("username");
if (accessToken && username) {
      loginData.accessToken = accessToken;
      loginData.username = username;
      fetchAndStoreExperiences();
      loadExperiencesFromLocalStorage();
      var preloginElement = document.getElementById('prelogin');
      if (preloginElement) {
        preloginElement.innerText = "Logged in as: " + username;
      }
      document.getElementById('logout_button').style.display = 'block';
      document.getElementById('email').style.display = 'none';
      document.getElementById('magic_link').style.display = 'none';
      document.getElementById('send_magic_link').style.display = 'none';
      document.getElementById('submit_magic_link').style.display = 'none';
            document.getElementById('selector').style.display = 'none';
      document.getElementById('write_post_button').style.display = 'inline-block';
      document.getElementById('import_post').style.display = 'inline-block';
      
            document.getElementById('contextof').style.display = 'block';
      
    } else {
      document.getElementById('email').style.display = 'block';
      document.getElementById('magic_link').style.display = 'block';
      document.getElementById('send_magic_link').style.display = 'block';
      document.getElementById('submit_magic_link').style.display = 'block';
      document.getElementById('prelogin').style.display = 'block';
      
            document.getElementById('contextof').style.display = 'none';
      
      
      document.getElementById('write_post_button').style.display = 'none';
      document.getElementById('import_post').style.display = 'none';
    }
  };




function sendMagicLink(email) {
	  document.getElementById('spinner').style.display = 'block';
  var apiUrl = "https://api.myriad.social/authentication/otp/email";
  
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "email": email,
      "callbackURL": "https://app.myriad.social/login"
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log(data);
    displayUserFeedback('Magic link has been successfully sent to your email. Please copy that magic link from your email and come back here to paste it!');
  })
  .catch((error) => {
    console.error('Error:', error);
    displayUserFeedback('There was an error sending the magic link. Please try again.', false);
  });
    document.getElementById('spinner').style.display = 'none';
}


function authenticate(magicLink) {
  // Show the spinner
  document.getElementById('spinner').style.display = 'block';
  var callbackUrl = "https://app.myriad.social/login";
  var token = magicLink.replace(callbackUrl+"?token=", "");
  
  var apiUrl = "https://api.myriad.social/authentication/login/otp";

  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "token": token
    })
  })
  .then(response => response.json())
  .then(data => {
    var accessToken = data.token.accessToken;
    var username = data.user.username;
    
    // store accessToken and username in local storage
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("username", username);
    displayUserFeedback("You're authenticated!");
    checkLogin(); 
    document.getElementById('import_post').style.visibility = 'visible';
    var preloginElement = document.getElementById('prelogin');
    if (preloginElement) {
      preloginElement.innerText = "Logged in as: " + username;
    }

    // Fetch and store experiences after successful authentication
   
     //chrome.runtime.sendMessage({ action: 'fetchAndStoreExperiences' });
  })
  .catch((error) => {
    console.error('Error:', error);
    displayUserFeedback('There was an error during authentication. Please try again.', false);
  });
  document.getElementById('spinner').style.display = 'none';
}



function importTwitterPost(twitterUrl) {
  // Show the spinner
  document.getElementById('spinner').style.display = 'block';

  // retrieve access token and username from local storage
  var at = localStorage.getItem("accessToken");
  var un = localStorage.getItem("username");
  var defaultExperienceId = localStorage.getItem("default_experience_id");

  var apiUrl = "https://api.myriad.social/user/posts/import";
  var headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + at,
  };

  var data = {
    "url": twitterUrl,
    "importer": un,
    "selectedTimelineIds": defaultExperienceId ,
  };

  fetch(apiUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {

    console.log(data);
    displayUserFeedback('The post has been successfully imported.');

    // Hide the spinner
    document.getElementById('spinner').style.display = 'none';
  })
  .catch((error) => {
    console.error('Error:', error);
    displayUserFeedback('There was an error during the import. Please try again.', false);

    // Hide the spinner
    document.getElementById('spinner').style.display = 'none';
  });
};



document.addEventListener('DOMContentLoaded', checkLogin);

