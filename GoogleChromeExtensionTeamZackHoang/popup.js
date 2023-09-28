// popup.js
document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('saveButton');
    const savedList = document.getElementById('savedList');
  
    // Load saved Reddit URLs from storage and display them in the popup
    chrome.storage.local.get('redditUrls', function (data) {
      if (data.redditUrls) {
        // Reverse the order to show the newest saved URL at the top
        const redditUrls = data.redditUrls.reverse();
        redditUrls.forEach((url) => {
          const listItem = createListItem(url);
          savedList.appendChild(listItem);
        });
      }
    });
  
    // Add event listener to save button
    saveButton.addEventListener('click', function () {
      // Use chrome.tabs API to get the URL of the currently active tab
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = tabs[0].url;
  
        if (url.startsWith('https://www.reddit.com/')) {
          // Retrieve existing saved Reddit URLs
          chrome.storage.local.get('redditUrls', function (data) {
            const redditUrls = data.redditUrls || [];
            redditUrls.push(url);
  
            // Save the updated list back to storage
            chrome.storage.local.set({ redditUrls }, function () {
              // Add the new URL to the top of the popup list
              const listItem = createListItem(url);
              savedList.insertBefore(listItem, savedList.firstChild);
            });
          });
        } else {
          alert('This is not a Reddit page. Please visit a Reddit page and try again.');
        }
      });
    });
  
    // Function to create a list item with a delete button
    function extractTitleFromUrl(url) {
        // Split the URL by '/' and remove any empty elements
        const parts = url.split('/').filter(part => part.trim() !== '');
      
        // Reddit URLs typically contain the post title as the last part of the path
        // Example: /r/some-subreddit/comments/abc123/some_post_title/
        if (parts.length >= 2) {
          // Get the second-to-last part (the part before the last '/')
          const encodedTitle = parts[parts.length - 1];
      
          // Decode the URI component to get the title
          return decodeURIComponent(encodedTitle);
        }
      
        // If extraction fails, return a default title
        return 'Untitled Reddit Post';
      }
      
    function createListItem(url) {
        const listItem = document.createElement('li');
        listItem.classList.add('saved-url-item');
      
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-button');
      
        const hyperlink = document.createElement('a');
        hyperlink.innerText = extractTitleFromUrl(url)
        hyperlink.href = url;
        hyperlink.target = '_blank'; // Open the link in a new tab
      
        // Append the delete button before the hyperlink
        listItem.appendChild(deleteButton);
        listItem.appendChild(hyperlink);
      
        deleteButton.addEventListener('click', function () {
          deleteUrl(url, listItem);
        });
      
        return listItem;
      }
  
    // Function to handle URL deletion
    function deleteUrl(url, listItem) {
      // Retrieve existing saved Reddit URLs
      chrome.storage.local.get('redditUrls', function (data) {
        const redditUrls = data.redditUrls || [];
  
        // Remove the deleted URL from the list
        const index = redditUrls.indexOf(url);
        if (index !== -1) {
          redditUrls.splice(index, 1);
  
          // Save the updated list back to storage
          chrome.storage.local.set({ redditUrls }, function () {
            // Remove the deleted URL from the popup list
            listItem.remove();
          });
        }
      });
    }
  });
  