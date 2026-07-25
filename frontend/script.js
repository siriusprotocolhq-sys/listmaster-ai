document.addEventListener('DOMContentLoaded', () => {
    // Tabs Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
        });
    });

    // Copy to Clipboard
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.copy;
            const contentElement = document.getElementById(targetId);
            let textToCopy = '';
            
            if (contentElement.tagName === 'UL') {
                const lis = contentElement.querySelectorAll('li');
                lis.forEach(li => textToCopy += `• ${li.innerText}\n`);
            } else {
                textToCopy = contentElement.innerText;
            }
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast('Copied to clipboard!');
            });
        });
    });

    function showToast(msg) {
        const toast = document.getElementById('toast');
        toast.innerText = msg;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);
    }

    // Generate Listings Logic
    const generateBtn = document.getElementById('generateBtn');
    const loading = document.getElementById('loading');
    const resultsSection = document.getElementById('resultsSection');
    const productNameInput = document.getElementById('productName');

    generateBtn.addEventListener('click', async () => {
        const productName = productNameInput.value.trim();
        if (!productName) {
            alert("Please enter a product name or details.");
            return;
        }

        loading.classList.remove('hidden');
        generateBtn.disabled = true;
        resultsSection.classList.add('hidden');

        try {
            const SYSTEM_PROMPT = `You are an expert E-Commerce copywriter and listing optimizer.
Generate highly optimized, platform-specific product listings for Amazon, Flipkart, and Meesho based on the product provided.

Follow these platform guidelines:
1. Amazon: SEO-heavy long title, 5 detailed bullet points, a professional description, and backend search terms.
2. Flipkart: Crisp and clean title, 4-5 short bulleted "Highlights", and clear specifications (key-value pairs).
3. Meesho: Very simple and short title, a value-focused short description, and a list of comma-separated raw tags.

Output your response STRICTLY as a valid JSON object matching this structure exactly (do not include markdown):
{
  "amazon": { "title": "string", "bullet_points": ["string", "string"], "description": "string", "search_terms": "string" },
  "flipkart": { "title": "string", "highlights": ["string", "string"], "specifications": {"string": "string"} },
  "meesho": { "title": "string", "description": "string", "tags": "string" }
}`;

            const fullPrompt = `${SYSTEM_PROMPT}\n\nProduct Details:\n${productName}`;
            const encodedPrompt = encodeURIComponent(fullPrompt);
            const url = `https://text.pollinations.ai/${encodedPrompt}?json=true`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP Error ${response.status}: Failed to reach AI.`);
            }

            const textRes = await response.text();
            
            // Clean JSON
            let cleanText = textRes.trim();
            const startIdx = cleanText.indexOf('{');
            const endIdx = cleanText.lastIndexOf('}');
            if (startIdx !== -1 && endIdx !== -1) {
                cleanText = cleanText.substring(startIdx, endIdx + 1);
            }
            
            const data = JSON.parse(cleanText);
            
            // Populate Amazon
            document.getElementById('amz-title').innerText = data.amazon.title;
            document.getElementById('amz-bullets').innerHTML = data.amazon.bullet_points.map(b => `<li>${b}</li>`).join('');
            document.getElementById('amz-desc').innerText = data.amazon.description;
            document.getElementById('amz-terms').innerText = data.amazon.search_terms;

            // Populate Flipkart
            document.getElementById('fk-title').innerText = data.flipkart.title;
            document.getElementById('fk-highlights').innerHTML = data.flipkart.highlights.map(h => `<li>${h}</li>`).join('');
            const specs = data.flipkart.specifications;
            document.getElementById('fk-specs').innerHTML = Object.keys(specs).map(k => `<strong>${k}</strong>: ${specs[k]}<br>`).join('');

            // Populate Meesho
            document.getElementById('ms-title').innerText = data.meesho.title;
            document.getElementById('ms-desc').innerText = data.meesho.description;
            document.getElementById('ms-tags').innerText = data.meesho.tags;

            resultsSection.classList.remove('hidden');
        } catch (err) {
            alert(`Generation failed: ${err.message}`);
        } finally {
            loading.classList.add('hidden');
            generateBtn.disabled = false;
        }
    });
});
