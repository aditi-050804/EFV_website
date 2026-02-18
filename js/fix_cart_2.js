
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'cart.js');

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Define the snippet to replace (Old broken logic)
    const oldSnippet = 'container.innerHTML = `<iframe src="${pdfUrl}${pageParam}&toolbar=0" style="width:100%; height:100%; border:none;"></iframe>`;';
    
    // Check if it exists
    if (!content.includes(oldSnippet)) {
        console.error('Old snippet not found! File might be different than expected.');
        // Debugging: Print surrounding lines if possible, or just exit
        process.exit(1);
    }

    // New Logic
    const newSnippet = `
                // CORECTED URL CONSTRUCTION
                let hashParams = [];
                if (startPage > 1) hashParams.push(\`page=\${startPage}\`);
                hashParams.push('toolbar=0');
                const separator = pdfUrl.includes('#') ? '&' : '#';
                const fullUrl = \`\${pdfUrl}\${separator}\${hashParams.join('&')}\`;
                
                container.innerHTML = \`<iframe src="\${fullUrl}" style="width:100%; height:100%; border:none;"></iframe>\`;
    `;

    // Perform replacement
    const finalContent = content.replace(oldSnippet, newSnippet);

    fs.writeFileSync(filePath, finalContent, 'utf8');
    console.log('Successfully patched cart.js fallbackToIframe');

} catch (err) {
    console.error('Error:', err);
}
