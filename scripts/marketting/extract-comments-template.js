const fs = require('fs');
const path = require('path');

// Default paths
const DEFAULT_INPUT_FILE = 'c:/job/t-hisab-ad.html';
const DEFAULT_OUTPUT_FILE = path.join(__dirname, 'extracted-comments.json');

/**
 * Extracts comment information from a Facebook HTML file.
 * 
 * @param {string} inputFile - Path to the input HTML file.
 * @param {string} outputFile - Path where the output JSON should be saved.
 */
function extractComments(inputFile = DEFAULT_INPUT_FILE, outputFile = DEFAULT_OUTPUT_FILE) {
  if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file not found at ${inputFile}`);
    process.exit(1);
  }

  console.log(`Reading input HTML file: ${inputFile}...`);
  const html = fs.readFileSync(inputFile, 'utf8');
  console.log(`File loaded. Size: ${(html.length / 1024 / 1024).toFixed(2)} MB`);

  // Split by the start of a comment block (Facebook comment articles have aria-label starting with "Comment by ")
  const blocks = html.split('<div aria-label="Comment by ');
  console.log(`Found ${blocks.length - 1} potential comment blocks.`);

  const comments = [];

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    
    // 1. Extract the aria-label content (which contains commenter name and time)
    const labelEndIndex = block.indexOf('"');
    if (labelEndIndex === -1) continue;
    const labelText = block.substring(0, labelEndIndex);

    // Parse commenter name and full time from labelText
    // e.g. "Asiful Islam Shohag 7 weeks ago"
    const labelMatch = labelText.match(/^(.*?)\s+(\d+\s+(?:week|weeks|day|days|hour|hours|minute|minutes|second|seconds|month|months|year|years)\s+ago)$/i);
    let commenterName = labelText;
    let timeAgoFull = '';
    if (labelMatch) {
      commenterName = labelMatch[1];
      timeAgoFull = labelMatch[2];
    } else {
      // Fallback: check for short form or other formats
      const shortMatch = labelText.match(/^(.*?)\s+(\d+[wdhmy](?:\s+ago)?)$/i);
      if (shortMatch) {
        commenterName = shortMatch[1];
        timeAgoFull = shortMatch[2];
      }
    }

    // 2. Extract profile URL, commenter ID, and comment ID from the link
    // e.g. href="https://www.facebook.com/tamanna.shohag?comment_id=Y29t..."
    const hrefMatch = block.match(/href="https:\/\/www\.facebook\.com\/([^"?#]+)(?:\?([^"]*?))?"/);
    let profileUrl = '';
    let commenterId = '';
    let commentId = '';
    
    if (hrefMatch) {
      const pathPart = hrefMatch[1];
      const queryPart = hrefMatch[2] || '';
      
      profileUrl = `https://www.facebook.com/${pathPart}${queryPart ? '?' + queryPart : ''}`;
      
      if (pathPart === 'profile.php') {
        const idMatch = queryPart.match(/(?:^|&)id=([^&]+)/);
        commenterId = idMatch ? idMatch[1] : '';
      } else {
        commenterId = pathPart.split('/')[0];
      }
      
      const commentIdMatch = queryPart.match(/(?:^|&)comment_id=([^&]+)/);
      commentId = commentIdMatch ? commentIdMatch[1] : '';
    }

    // 3. Extract the comment text
    // The comment text is inside <div dir="auto" style="text-align: start;">...</div>
    const commentTextMatch = block.match(/<div\s+dir="auto"\s+style="text-align:\s*start;"[^>]*?>([\s\S]*?)<\/div>/);
    let commentText = '';
    if (commentTextMatch) {
      // Strip any HTML tags from comment text
      commentText = commentTextMatch[1].replace(/<[^>]+>/g, '').trim();
    }

    // 4. Extract short time (e.g. "7w" or "8w")
    // e.g. dir="auto">7w</span>
    const shortTimeMatch = block.match(/dir="auto">(\d+[wdhmy])<\/span>/);
    const howLongAgo = shortTimeMatch ? shortTimeMatch[1] : (timeAgoFull || 'Unknown');

    comments.push({
      commenter_name: commenterName,
      comment: commentText,
      how_long_ago: howLongAgo,
      commenter_id: commenterId,
      comment_id: commentId,
      time_ago_full: timeAgoFull,
      profile_url: profileUrl
    });
  }

  // Write the results to a JSON file
  fs.writeFileSync(outputFile, JSON.stringify(comments, null, 2));
  console.log(`Successfully extracted ${comments.length} comments.`);
  console.log(`Results saved to: ${outputFile}`);
}

// Allow running from command line with custom arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  const inputArg = args[0];
  const outputArg = args[1];
  extractComments(inputArg, outputArg);
}

module.exports = { extractComments };
